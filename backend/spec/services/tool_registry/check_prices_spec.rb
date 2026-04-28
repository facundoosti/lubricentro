require 'rails_helper'

RSpec.describe ToolRegistry::CheckPrices do
  let(:conversation) { create(:conversation) }

  before do
    allow(ActionCable.server).to receive(:broadcast)
    allow(EmbeddingService).to receive(:generate).and_return(nil)
  end

  def call_tool(query)
    described_class.call({ query: query }, conversation)
  end

  describe '#call' do
    it 'returns a hash with :reply key' do
      result = call_tool("aceite")
      expect(result).to have_key(:reply)
    end

    context 'when there are no products or services' do
      it 'returns not found message' do
        result = call_tool("algo que no existe")
        expect(result[:reply]).to include("No encontré")
      end
    end

    context 'when products exist' do
      let!(:product) { create(:product, :oil, name: "Aceite 5W-30") }

      it 'includes product name in response' do
        result = call_tool("aceite")
        expect(result[:reply]).to include("Aceite 5W-30")
      end

      it 'includes the Productos label' do
        result = call_tool("aceite")
        expect(result[:reply]).to include("Productos")
      end
    end

    context 'when services exist' do
      let!(:service) { create(:service, name: "Cambio de aceite") }

      it 'includes service name in response' do
        result = call_tool("cambio")
        expect(result[:reply]).to include("Cambio de aceite")
      end

      it 'includes the Servicios label' do
        result = call_tool("cambio")
        expect(result[:reply]).to include("Servicios")
      end
    end

    context 'when EmbeddingService raises an error' do
      let!(:product) { create(:product, :oil) }

      before do
        allow(EmbeddingService).to receive(:generate).and_raise(StandardError, "API error")
      end

      it 'returns fallback context with available products' do
        result = call_tool("aceite")
        expect(result[:reply]).to include(product.name)
      end
    end
  end
end
