require 'rails_helper'

RSpec.describe EmbeddingService do
  let(:embedding_vector) { Array.new(768) { rand } }
  let(:openai_client) { instance_double(OpenAI::Client) }

  before do
    allow(OpenAI::Client).to receive(:new).and_return(openai_client)
  end

  describe '.generate (class method)' do
    it 'delegates to an instance and returns the embedding' do
      allow(openai_client).to receive(:embeddings).and_return(
        { "data" => [ { "embedding" => embedding_vector } ] }
      )

      result = described_class.generate("oil change")
      expect(result).to eq(embedding_vector)
    end

    it 'returns nil when the API raises an error' do
      allow(openai_client).to receive(:embeddings).and_raise(StandardError, "timeout")
      allow(Rails.logger).to receive(:error)

      expect(described_class.generate("oil change")).to be_nil
    end
  end

  describe '#generate' do
    subject(:service) { described_class.new }

    context 'when the API call succeeds' do
      before do
        allow(openai_client).to receive(:embeddings).and_return(
          { "data" => [ { "embedding" => embedding_vector } ] }
        )
      end

      it 'returns the embedding vector' do
        expect(service.generate("cambio de aceite")).to eq(embedding_vector)
      end

      it 'passes the correct model to the API' do
        expect(openai_client).to receive(:embeddings).with(
          parameters: hash_including(model: ENV.fetch("AI_MODEL_EMBEDDING", nil))
        ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

        service.generate("test")
      end

      it 'strips whitespace from the input before sending' do
        expect(openai_client).to receive(:embeddings).with(
          parameters: hash_including(input: "aceite")
        ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

        service.generate("  aceite  ")
      end

      it 'converts non-string input to string' do
        expect(openai_client).to receive(:embeddings).with(
          parameters: hash_including(input: "42")
        ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

        service.generate(42)
      end
    end

    context 'when the API call fails' do
      before do
        allow(openai_client).to receive(:embeddings).and_raise(StandardError, "connection refused")
      end

      it 'returns nil' do
        expect(service.generate("test")).to be_nil
      end

      it 'logs the error with service context' do
        expect(Rails.logger).to receive(:error).with(
          match(/\[EmbeddingService\].*connection refused/)
        )
        service.generate("test")
      end

      it 'does not propagate the exception' do
        expect { service.generate("test") }.not_to raise_error
      end
    end

    context 'when AI_API_URL env var is missing' do
      before do
        allow(OpenAI::Client).to receive(:new).and_call_original
        allow(ENV).to receive(:fetch).with("AI_API_URL").and_raise(KeyError, "key not found: AI_API_URL")
        allow(ENV).to receive(:fetch).with("AI_API_KEY").and_return("test-key")
        allow(Rails.logger).to receive(:error)
      end

      it 'returns nil gracefully' do
        expect(service.generate("test")).to be_nil
      end
    end
  end

  describe '#reindex_catalog!' do
    subject(:service) { described_class.new }

    # before must be declared before let! so the embeddings stub is active
    # when factory callbacks fire during record creation.
    before do
      allow(openai_client).to receive(:embeddings).and_return(
        { "data" => [ { "embedding" => embedding_vector } ] }
      )
    end

    let!(:product) { create(:product, :oil) }
    let!(:srv)     { create(:service, :oil_change) }

    it 'generates an embedding for each product using name + description' do
      expect(openai_client).to receive(:embeddings).with(
        parameters: hash_including(input: "#{product.name} #{product.description}")
      ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

      allow(openai_client).to receive(:embeddings).with(
        parameters: hash_including(input: "#{srv.name} #{srv.description}")
      ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

      allow_any_instance_of(Product).to receive(:update_column)
      allow_any_instance_of(Service).to receive(:update_column)

      service.reindex_catalog!
    end

    it 'generates an embedding for each service using name + description' do
      allow(openai_client).to receive(:embeddings).with(
        parameters: hash_including(input: "#{product.name} #{product.description}")
      ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

      expect(openai_client).to receive(:embeddings).with(
        parameters: hash_including(input: "#{srv.name} #{srv.description}")
      ).and_return({ "data" => [ { "embedding" => embedding_vector } ] })

      allow_any_instance_of(Product).to receive(:update_column)
      allow_any_instance_of(Service).to receive(:update_column)

      service.reindex_catalog!
    end

    it 'saves the embedding on each product' do
      expect_any_instance_of(Product).to receive(:update_column).with(:embedding, embedding_vector)
      expect_any_instance_of(Service).to receive(:update_column).with(:embedding, embedding_vector)

      service.reindex_catalog!
    end

    context 'when embedding generation fails for a record' do
      before do
        allow(openai_client).to receive(:embeddings).and_raise(StandardError, "API error")
        allow(Rails.logger).to receive(:error)
      end

      it 'skips update_column for that record' do
        expect_any_instance_of(Product).not_to receive(:update_column)
        expect_any_instance_of(Service).not_to receive(:update_column)
        service.reindex_catalog!
      end

      it 'does not raise an error' do
        expect { service.reindex_catalog! }.not_to raise_error
      end
    end
  end
end
