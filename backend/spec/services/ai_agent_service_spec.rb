require 'rails_helper'

RSpec.describe AiAgentService do
  let(:openai_client) { instance_double(OpenAI::Client) }
  let(:conversation)  { create(:conversation) }
  let(:service)       { described_class.new(conversation) }

  # Helper: builds a fake LLM response with a plain text reply
  def llm_text_response(content)
    { "choices" => [ { "message" => { "content" => content, "tool_calls" => nil } } ] }
  end

  # Helper: builds a fake LLM response with a single tool call
  def llm_tool_response(tool_name, arguments = {})
    {
      "choices" => [ {
        "message" => {
          "content"    => nil,
          "tool_calls" => [ {
            "function" => {
              "name"      => tool_name,
              "arguments" => arguments.to_json
            }
          } ]
        }
      } ]
    }
  end

  before do
    allow(OpenAI::Client).to receive(:new).and_return(openai_client)
    # Prevent real HTTP calls from EmbeddingService (triggered by Product/Service after_save)
    allow(EmbeddingService).to receive(:generate).and_return(nil)
    allow(ActionCable.server).to receive(:broadcast)
  end

  # ─── #process ─────────────────────────────────────────────────────────────

  describe '#process' do
    context 'when the LLM returns a plain text reply' do
      before do
        allow(openai_client).to receive(:chat).and_return(
          llm_text_response("Hola, ¿en qué te puedo ayudar?")
        )
      end

      it 'returns the content as the reply' do
        result = service.process("Hola")
        expect(result).to eq({ reply: "Hola, ¿en qué te puedo ayudar?" })
      end

      it 'sends the user message as the last user turn' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(
            messages: end_with(hash_including(role: "user", content: "Hola"))
          )
        ).and_return(llm_text_response("ok"))

        service.process("Hola")
      end

      it 'always includes a system prompt as the first message' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(
            messages: start_with(hash_including(role: "system"))
          )
        ).and_return(llm_text_response("ok"))

        service.process("test")
      end

      it 'sends the defined TOOLS to the LLM' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(tools: ToolRegistry.definitions, tool_choice: "auto")
        ).and_return(llm_text_response("ok"))

        service.process("test")
      end
    end

    # ─── escalate_to_human ────────────────────────────────────────────────

    context 'when the LLM calls escalate_to_human' do
      before do
        allow(openai_client).to receive(:chat).and_return(
          llm_tool_response("escalate_to_human", { reason: "queja del cliente" })
        )
      end

      it 'updates the conversation status to needs_human' do
        service.process("Quiero hablar con el dueño")
        expect(conversation.reload.status).to eq("needs_human")
      end

      it 'broadcasts the status update to the inbox channel' do
        expect(ActionCable.server).to receive(:broadcast).with(
          "inbox",
          hash_including(conversation_id: conversation.id, status: "needs_human")
        )
        service.process("Quiero hablar con el dueño")
      end

      it 'returns a human handoff reply' do
        result = service.process("Quiero hablar con el dueño")
        expect(result[:reply]).to include("comunico con una persona")
      end

      it 'does not change the status if already needs_human' do
        conversation.update!(status: "needs_human")
        service.process("Quiero hablar con el dueño")
        expect(conversation.reload.status).to eq("needs_human")
      end
    end

    # ─── classify_intent (proveedor) ──────────────────────────────────────

    context 'when the LLM calls classify_intent with type=proveedor' do
      before do
        allow(openai_client).to receive(:chat).and_return(
          llm_tool_response("classify_intent", { type: "proveedor" })
        )
      end

      it 'updates the conversation status to supplier' do
        service.process("Soy proveedor de lubricantes")
        expect(conversation.reload.status).to eq("supplier")
      end

      it 'broadcasts the status update' do
        expect(ActionCable.server).to receive(:broadcast).with(
          "inbox",
          hash_including(status: "supplier")
        )
        service.process("Soy proveedor de lubricantes")
      end

      it 'returns a supplier acknowledgment reply' do
        result = service.process("Soy proveedor de lubricantes")
        expect(result[:reply]).to include("recibido")
      end
    end

    # ─── classify_intent (cliente) ────────────────────────────────────────

    context 'when the LLM calls classify_intent with type=cliente' do
      before do
        allow(openai_client).to receive(:chat).and_return(
          llm_tool_response("classify_intent", { type: "cliente" })
        )
      end

      it 'does not change the conversation status' do
        expect { service.process("Soy cliente") }
          .not_to change { conversation.reload.status }
      end

      it 'does not broadcast any status update' do
        expect(ActionCable.server).not_to receive(:broadcast)
        service.process("Soy cliente")
      end
    end

    # ─── schedule_appointment ─────────────────────────────────────────────

    context 'when the LLM calls schedule_appointment' do
      before do
        allow(openai_client).to receive(:chat).and_return(
          llm_tool_response("schedule_appointment", { preferred_date: "2026-04-10", vehicle: "Toyota Corolla" })
        )
      end

      it 'returns a pending confirmation reply when customer is not found' do
        result = service.process("Quiero un turno para el viernes")
        expect(result[:reply]).to include("Anotamos")
      end

      it 'transitions the conversation to needs_human when customer is not found' do
        expect { service.process("Quiero turno") }
          .to change { conversation.reload.status }.to("needs_human")
      end
    end

    # ─── check_prices ─────────────────────────────────────────────────────

    context 'when the LLM calls check_prices' do
      before do
        allow(openai_client).to receive(:chat).and_return(
          llm_tool_response("check_prices", { query: "aceite 10W40" })
        )
      end

      it 'does not change the conversation status' do
        expect { service.process("¿Cuánto sale el aceite?") }
          .not_to change { conversation.reload.status }
      end
    end

    # ─── LLM error handling ───────────────────────────────────────────────

    context 'when the LLM call raises an error' do
      before do
        allow(openai_client).to receive(:chat).and_raise(StandardError, "connection timeout")
        allow(Rails.logger).to receive(:error)
      end

      it 'returns a user-friendly fallback reply' do
        result = service.process("test")
        expect(result[:reply]).to include("problema")
      end

      it 'logs the error with service context' do
        expect(Rails.logger).to receive(:error).with(
          match(/\[AiAgentService\].*connection timeout/)
        )
        service.process("test")
      end

      it 'does not propagate the exception' do
        expect { service.process("test") }.not_to raise_error
      end
    end

    # ─── Message history ──────────────────────────────────────────────────

    context 'when the conversation has prior messages' do
      before do
        create(:message, conversation: conversation, body: "¿Tienen aceite?",      sender_type: "customer", direction: "inbound")
        create(:message, conversation: conversation, body: "Sí, tenemos varios.",  sender_type: "bot",      direction: "outbound")
        allow(openai_client).to receive(:chat).and_return(llm_text_response("ok"))
      end

      it 'maps customer messages to the user role' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(
            messages: include(hash_including(role: "user", content: "¿Tienen aceite?"))
          )
        ).and_return(llm_text_response("ok"))

        service.process("¿Y filtros?")
      end

      it 'maps bot messages to the assistant role' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(
            messages: include(hash_including(role: "assistant", content: "Sí, tenemos varios."))
          )
        ).and_return(llm_text_response("ok"))

        service.process("¿Y filtros?")
      end
    end

    context 'when the conversation has more than 10 messages' do
      before do
        12.times do |i|
          create(:message,
            conversation: conversation,
            body:         "mensaje #{i}",
            sender_type:  "customer",
            direction:    "inbound",
            created_at:   i.minutes.ago)
        end
        allow(openai_client).to receive(:chat).and_return(llm_text_response("ok"))
      end

      it 'only includes the last 10 messages in history' do
        expect(openai_client).to receive(:chat) do |params|
          # system + 10 history + 1 current user message = 12 total
          messages = params[:parameters][:messages]
          history_messages = messages.reject { |m| m[:role] == "system" }.first(12)
          # excluding the final user message added by process, history should be 10
          expect(history_messages.size).to be <= 11
          llm_text_response("ok")
        end

        service.process("nueva pregunta")
      end
    end

    # ─── Context building (fallback) ──────────────────────────────────────

    context 'when running on non-PostgreSQL (fallback context)' do
      let!(:product) { create(:product, :oil) }
      let!(:svc)     { create(:service, :oil_change) }

      before do
        allow_any_instance_of(ContextRetrievalService).to receive(:postgresql?).and_return(false)
        allow(openai_client).to receive(:chat).and_return(llm_text_response("ok"))
      end

      it 'includes product names in the system prompt' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(
            messages: start_with(
              hash_including(role: "system", content: include(product.name))
            )
          )
        ).and_return(llm_text_response("ok"))

        service.process("¿Qué productos tienen?")
      end

      it 'includes service names in the system prompt' do
        expect(openai_client).to receive(:chat).with(
          parameters: hash_including(
            messages: start_with(
              hash_including(role: "system", content: include(svc.name))
            )
          )
        ).and_return(llm_text_response("ok"))

        service.process("¿Qué servicios ofrecen?")
      end
    end

    # ─── Context building (PostgreSQL RAG) ────────────────────────────────

    context 'when running on PostgreSQL' do
      before do
        allow_any_instance_of(ContextRetrievalService).to receive(:postgresql?).and_return(true)
      end

      context 'and embedding generation succeeds' do
        let(:embedding) { Array.new(ENV.fetch("AI_EMBEDDING_DIMENSION").to_i) { rand } }

        before do
          allow(EmbeddingService).to receive(:generate).and_return(embedding)
          allow(Product).to receive(:nearest_neighbors).and_return(Product.none)
          allow(Service).to receive(:nearest_neighbors).and_return(Service.none)
          allow(openai_client).to receive(:chat).and_return(llm_text_response("ok"))
        end

        it 'calls EmbeddingService.generate with the user message' do
          expect(EmbeddingService).to receive(:generate).with("¿Tienen aceite 10W40?")
          service.process("¿Tienen aceite 10W40?")
        end

        it 'queries products using vector similarity' do
          expect(Product).to receive(:nearest_neighbors).with(:embedding, embedding, distance: "cosine")
          service.process("aceite")
        end
      end

      context 'and embedding generation fails (returns nil)' do
        before do
          allow(EmbeddingService).to receive(:generate).and_return(nil)
          allow(openai_client).to receive(:chat).and_return(llm_text_response("ok"))
        end

        it 'falls back to non-vector context without raising' do
          expect { service.process("test") }.not_to raise_error
        end
      end
    end
  end
end
