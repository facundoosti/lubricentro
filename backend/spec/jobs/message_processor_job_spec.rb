require 'rails_helper'

RSpec.describe MessageProcessorJob, type: :job do
  before do
    allow(ActionCable.server).to receive(:broadcast)
    allow(WhatsAppService).to receive(:send_message)
    allow(AiAgentJob).to receive(:perform_later)
  end

  # ─── payload helpers ─────────────────────────────────────────────────────────

  def inbound_payload(phone: "+5491112345678", text: "Hola", wamid: "wamid.IN001")
    {
      "message" => {
        "id"    => wamid,
        "type"  => "text",
        "text"  => { "body" => text },
        "kapso" => { "direction" => "inbound", "status" => "received" }
      },
      "conversation" => { "phone_number" => phone }
    }
  end

  def delivered_payload(wamid: "wamid.OUT001", phone: "+5491112345678")
    {
      "message" => {
        "id"    => wamid,
        "kapso" => {
          "direction" => "outbound",
          "status"    => "delivered",
          "statuses"  => [
            { "id" => wamid, "status" => "sent",      "timestamp" => "1730092860", "recipient_id" => phone },
            { "id" => wamid, "status" => "delivered", "timestamp" => "1730092888", "recipient_id" => phone }
          ]
        }
      },
      "conversation" => { "phone_number" => phone }
    }
  end

  def read_payload(wamid: "wamid.OUT001", phone: "+5491112345678")
    {
      "message" => {
        "id"    => wamid,
        "kapso" => {
          "direction" => "outbound",
          "status"    => "read",
          "statuses"  => [
            { "id" => wamid, "status" => "sent",      "timestamp" => "1730092860" },
            { "id" => wamid, "status" => "delivered", "timestamp" => "1730092888" },
            { "id" => wamid, "status" => "read",      "timestamp" => "1730092900" }
          ]
        }
      },
      "conversation" => { "phone_number" => phone }
    }
  end

  def failed_payload(wamid: "wamid.OUT001", phone: "+5491112345678")
    {
      "message" => {
        "id"    => wamid,
        "type"  => "text",
        "kapso" => {
          "direction" => "outbound",
          "status"    => "failed",
          "statuses"  => [
            { "id" => wamid, "status" => "sent",   "timestamp" => "1730093100", "recipient_id" => phone },
            {
              "id"        => wamid,
              "status"    => "failed",
              "timestamp" => "1730093200",
              "recipient_id" => phone,
              "errors"    => [
                { "code" => 131047, "title" => "Re-engagement message",
                  "message" => "More than 24 hours have passed since the recipient last replied" }
              ]
            }
          ]
        }
      },
      "conversation" => { "phone_number" => phone }
    }
  end

  # ─── handle_message_received ─────────────────────────────────────────────────

  describe "mensaje inbound (received)" do
    context "conversación nueva" do
      it "crea la conversación con status bot" do
        expect {
          described_class.perform_now(inbound_payload)
        }.to change(Conversation, :count).by(1)

        expect(Conversation.last.status).to eq("bot")
        expect(Conversation.last.whatsapp_phone).to eq("+5491112345678")
      end

      it "crea el mensaje inbound" do
        expect {
          described_class.perform_now(inbound_payload)
        }.to change(Message, :count).by(1)

        msg = Message.last
        expect(msg.direction).to eq("inbound")
        expect(msg.sender_type).to eq("customer")
        expect(msg.body).to eq("Hola")
        expect(msg.whatsapp_message_id).to eq("wamid.IN001")
      end

      it "actualiza last_message_at de la conversación" do
        described_class.perform_now(inbound_payload)
        expect(Conversation.last.last_message_at).to be_present
      end

      it "hace broadcast al canal inbox con el nuevo mensaje" do
        described_class.perform_now(inbound_payload)
        expect(ActionCable.server).to have_received(:broadcast).with(
          "inbox",
          hash_including(
            new_message: hash_including(direction: "inbound", sender_type: "customer")
          )
        )
      end

      it "encola AiAgentJob para responder" do
        described_class.perform_now(inbound_payload)
        conv = Conversation.last
        msg  = conv.messages.last
        expect(AiAgentJob).to have_received(:perform_later).with(conv.id, msg.id)
      end
    end

    context "conversación existente" do
      let!(:conversation) { create(:conversation, whatsapp_phone: "+5491112345678") }

      it "no crea una conversación nueva" do
        expect {
          described_class.perform_now(inbound_payload)
        }.not_to change(Conversation, :count)
      end

      it "agrega el mensaje a la conversación existente" do
        described_class.perform_now(inbound_payload)
        expect(conversation.messages.count).to eq(1)
      end
    end

    context "vinculación con Customer" do
      let!(:customer) { create(:customer, phone: "+5491112345678") }

      it "vincula la conversación al customer por teléfono" do
        described_class.perform_now(inbound_payload)
        conv = Conversation.find_by(whatsapp_phone: "+5491112345678")
        expect(conv.customer).to eq(customer)
      end
    end

    context "idempotencia — mismo wamid recibido dos veces" do
      it "no crea un segundo mensaje" do
        payload = inbound_payload(wamid: "wamid.DUPE001")
        described_class.perform_now(payload)

        expect {
          described_class.perform_now(payload)
        }.not_to change(Message, :count)
      end

      it "no encola AiAgentJob por el mensaje duplicado" do
        payload = inbound_payload(wamid: "wamid.DUPE002")
        described_class.perform_now(payload)

        # Expectation set BEFORE the second call — any call here means the guard failed
        expect(AiAgentJob).not_to receive(:perform_later)
        described_class.perform_now(payload)
      end
    end

    context "teléfono registrado en SupplierPhone" do
      let!(:supplier) { create(:supplier_phone, phone: "+5491199000001") }

      it "crea la conversación con status supplier" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        expect(Conversation.last.status).to eq("supplier")
      end

      it "envía la respuesta automática de proveedor" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        expect(WhatsAppService).to have_received(:send_message).with(
          phone: "+5491199000001",
          text:  MessageProcessorJob::SUPPLIER_DEFAULT_REPLY
        )
      end

      it "crea el mensaje de respuesta automática outbound" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        conv  = Conversation.find_by(whatsapp_phone: "+5491199000001")
        reply = conv.messages.find_by(direction: "outbound")
        expect(reply).to be_present
        expect(reply.sender_type).to eq("bot")
        expect(reply.body).to eq(MessageProcessorJob::SUPPLIER_DEFAULT_REPLY)
      end

      it "no encola AiAgentJob" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        expect(AiAgentJob).not_to have_received(:perform_later)
      end

      it "hace broadcast del mensaje entrante con status supplier" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        expect(ActionCable.server).to have_received(:broadcast).with(
          "inbox",
          hash_including(
            status:      "supplier",
            new_message: hash_including(direction: "inbound", sender_type: "customer")
          )
        )
      end

      it "hace broadcast de la respuesta automática de proveedor" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        expect(ActionCable.server).to have_received(:broadcast).with(
          "inbox",
          hash_including(
            status:      "supplier",
            new_message: hash_including(direction: "outbound", sender_type: "bot")
          )
        )
      end

      it "actualiza last_message_at de la conversación" do
        described_class.perform_now(inbound_payload(phone: "+5491199000001"))
        conv = Conversation.find_by(whatsapp_phone: "+5491199000001")
        expect(conv.last_message_at).to be_present
      end

      context "cuando WhatsAppService falla al enviar la respuesta automática" do
        before do
          allow(WhatsAppService).to receive(:send_message).and_raise(StandardError, "Network error")
        end

        it "no aborta el job" do
          expect {
            described_class.perform_now(inbound_payload(phone: "+5491199000001"))
          }.not_to raise_error
        end

        it "crea el mensaje de respuesta en BD aunque WA falle" do
          described_class.perform_now(inbound_payload(phone: "+5491199000001"))
          conv = Conversation.find_by(whatsapp_phone: "+5491199000001")
          expect(conv.messages.where(direction: "outbound").count).to eq(1)
        end
      end
    end

    context "upgrade de bot a supplier (teléfono agregado a SupplierPhone después)" do
      let!(:conversation) { create(:conversation, whatsapp_phone: "+5491199000002", status: "bot") }
      let!(:supplier)     { create(:supplier_phone, phone: "+5491199000002") }

      it "migra la conversación existente a supplier" do
        described_class.perform_now(inbound_payload(phone: "+5491199000002"))
        expect(conversation.reload.status).to eq("supplier")
      end
    end

    context "conversación en needs_human" do
      let!(:conversation) { create(:conversation, whatsapp_phone: "+5491112345678", status: "needs_human") }

      it "registra el mensaje sin encolcar AiAgentJob" do
        described_class.perform_now(inbound_payload)
        expect(AiAgentJob).not_to have_received(:perform_later)
        expect(conversation.messages.count).to eq(1)
      end
    end

    context "mensaje de tipo no-text (imagen, audio, etc.)" do
      let(:image_payload) do
        {
          "message" => {
            "id"    => "wamid.IMG001",
            "type"  => "image",
            "image" => { "id" => "media_id_123" },
            "kapso" => { "direction" => "inbound", "status" => "received" }
          },
          "conversation" => { "phone_number" => "+5491112345678" }
        }
      end

      it "no crea ningún mensaje" do
        expect {
          described_class.perform_now(image_payload)
        }.not_to change(Message, :count)
      end

      it "no encola AiAgentJob" do
        described_class.perform_now(image_payload)
        expect(AiAgentJob).not_to have_received(:perform_later)
      end
    end
  end

  # ─── handle_message_delivered ────────────────────────────────────────────────

  describe "status delivered" do
    let!(:conversation) { create(:conversation, whatsapp_phone: "+5491112345678") }
    let!(:message) do
      create(:message, :outbound, conversation: conversation, whatsapp_message_id: "wamid.OUT001")
    end

    it "actualiza delivered_at del mensaje" do
      described_class.perform_now(delivered_payload)
      expect(message.reload.delivered_at).to be_present
    end

    it "hace broadcast con message_status delivered" do
      described_class.perform_now(delivered_payload)
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox",
        hash_including(
          conversation_id: conversation.id,
          message_status: hash_including(wamid: "wamid.OUT001", status: "delivered")
        )
      )
    end

    context "idempotente — delivered_at ya estaba seteado" do
      before { message.update!(delivered_at: 1.hour.ago) }

      it "no modifica delivered_at" do
        original = message.delivered_at
        described_class.perform_now(delivered_payload)
        expect(message.reload.delivered_at).to be_within(1.second).of(original)
      end
    end

    context "mensaje no encontrado por wamid" do
      it "no lanza error" do
        expect {
          described_class.perform_now(delivered_payload(wamid: "wamid.UNKNOWN"))
        }.not_to raise_error
      end
    end
  end

  # ─── handle_message_read ─────────────────────────────────────────────────────

  describe "status read" do
    let!(:conversation) { create(:conversation, whatsapp_phone: "+5491112345678") }
    let!(:message) do
      create(:message, :outbound, conversation: conversation, whatsapp_message_id: "wamid.OUT001")
    end

    it "actualiza read_at del mensaje" do
      described_class.perform_now(read_payload)
      expect(message.reload.read_at).to be_present
    end

    it "retro-stampa delivered_at si estaba vacío" do
      expect(message.delivered_at).to be_nil
      described_class.perform_now(read_payload)
      expect(message.reload.delivered_at).to be_present
    end

    it "no sobreescribe delivered_at si ya existía" do
      original = 2.hours.ago
      message.update!(delivered_at: original)
      described_class.perform_now(read_payload)
      expect(message.reload.delivered_at).to be_within(1.second).of(original)
    end

    it "hace broadcast con message_status read" do
      described_class.perform_now(read_payload)
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox",
        hash_including(message_status: hash_including(status: "read"))
      )
    end

    context "idempotente — read_at ya estaba seteado" do
      before { message.update!(read_at: 1.hour.ago) }

      it "no modifica read_at" do
        original = message.read_at
        described_class.perform_now(read_payload)
        expect(message.reload.read_at).to be_within(1.second).of(original)
      end
    end
  end

  # ─── handle_message_failed ───────────────────────────────────────────────────

  describe "status failed" do
    let!(:conversation) { create(:conversation, whatsapp_phone: "+5491112345678", status: "bot") }

    it "escala la conversación a needs_human" do
      described_class.perform_now(failed_payload)
      expect(conversation.reload.status).to eq("needs_human")
    end

    it "hace broadcast con alerta de mensaje fallido" do
      described_class.perform_now(failed_payload)
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox",
        hash_including(
          conversation_id: conversation.id,
          status:          "needs_human",
          alert:           hash_including(type: "message_failed", wamid: "wamid.OUT001")
        )
      )
    end

    it "incluye el error code/title en el alert" do
      described_class.perform_now(failed_payload)
      broadcast_args = ActionCable.server.__send__(:recorded_messages) rescue nil
      # Verifica que el broadcast contiene los errores
      expect(ActionCable.server).to have_received(:broadcast).with(
        "inbox",
        hash_including(alert: hash_including(errors: include("131047")))
      )
    end

    context "conversación ya en needs_human (idempotente)" do
      before { conversation.update!(status: "needs_human") }

      it "no vuelve a hacer broadcast" do
        described_class.perform_now(failed_payload)
        expect(ActionCable.server).not_to have_received(:broadcast)
      end
    end

    context "conversación no encontrada" do
      it "no lanza error" do
        expect {
          described_class.perform_now(failed_payload(phone: "+5490000000000"))
        }.not_to raise_error
      end
    end
  end
end
