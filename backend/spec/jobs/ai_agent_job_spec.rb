require 'rails_helper'

RSpec.describe AiAgentJob, type: :job do
  let(:conversation) { create(:conversation) }
  let(:message)      { create(:message, conversation: conversation, body: "¿Tienen aceite 10W40?") }

  before do
    allow(ActionCable.server).to receive(:broadcast)
    allow(WhatsAppService).to receive(:send_message)
    allow_any_instance_of(AiAgentService).to receive(:process)
      .and_return({ reply: "Sí, tenemos aceite 10W40 y otros tipos." })
  end

  describe "#perform" do
    context "conversación en estado bot" do
      it "crea un mensaje outbound de bot" do
        expect {
          described_class.perform_now(conversation.id, message.id)
        }.to change { conversation.messages.where(direction: "outbound").count }.by(1)
      end

      it "el mensaje outbound tiene sender_type bot y el texto de la IA" do
        described_class.perform_now(conversation.id, message.id)
        outbound = conversation.messages.find_by(direction: "outbound")
        expect(outbound.sender_type).to eq("bot")
        expect(outbound.body).to eq("Sí, tenemos aceite 10W40 y otros tipos.")
      end

      it "llama a WhatsAppService.send_message con el texto generado" do
        expect(WhatsAppService).to receive(:send_message).with(
          phone: conversation.whatsapp_phone,
          text:  "Sí, tenemos aceite 10W40 y otros tipos."
        )
        described_class.perform_now(conversation.id, message.id)
      end

      it "hace broadcast al canal inbox con el mensaje outbound" do
        described_class.perform_now(conversation.id, message.id)
        expect(ActionCable.server).to have_received(:broadcast).with(
          "inbox",
          hash_including(
            conversation_id: conversation.id,
            new_message:     hash_including(direction: "outbound", sender_type: "bot")
          )
        )
      end

      it "actualiza last_message_at de la conversación" do
        expect {
          described_class.perform_now(conversation.id, message.id)
        }.to change { conversation.reload.last_message_at }
      end

      it "delega el procesamiento a AiAgentService con el body del mensaje" do
        expect_any_instance_of(AiAgentService).to receive(:process)
          .with("¿Tienen aceite 10W40?")
          .and_return({ reply: "ok" })
        described_class.perform_now(conversation.id, message.id)
      end
    end

    context "guard — conversación en needs_human" do
      let(:conversation) { create(:conversation, :needs_human) }

      it "no crea ningún mensaje" do
        # Pre-access to force lazy evaluation of `message` before the expect block
        conv_id, msg_id = conversation.id, message.id
        expect {
          described_class.perform_now(conv_id, msg_id)
        }.not_to change(Message, :count)
      end

      it "no llama a WhatsAppService" do
        described_class.perform_now(conversation.id, message.id)
        expect(WhatsAppService).not_to have_received(:send_message)
      end

      it "no hace broadcast" do
        described_class.perform_now(conversation.id, message.id)
        expect(ActionCable.server).not_to have_received(:broadcast)
      end
    end

    context "guard — conversación en supplier" do
      let(:conversation) { create(:conversation, :supplier) }

      it "no crea ningún mensaje" do
        conv_id, msg_id = conversation.id, message.id
        expect {
          described_class.perform_now(conv_id, msg_id)
        }.not_to change(Message, :count)
      end

      it "no llama a WhatsAppService" do
        described_class.perform_now(conversation.id, message.id)
        expect(WhatsAppService).not_to have_received(:send_message)
      end
    end

    context "guard — conversación en archived" do
      let(:conversation) { create(:conversation, :archived) }

      it "no crea ningún mensaje" do
        conv_id, msg_id = conversation.id, message.id
        expect {
          described_class.perform_now(conv_id, msg_id)
        }.not_to change(Message, :count)
      end
    end
  end
end
