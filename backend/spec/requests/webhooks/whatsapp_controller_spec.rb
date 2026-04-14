require 'rails_helper'

RSpec.describe "Webhooks::Whatsapp", type: :request do
  let(:secret) { "test_kapso_secret" }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("KAPSO_WEBHOOK_SECRET").and_return(secret)
    allow(MessageProcessorJob).to receive(:perform_later)
  end

  # POST the payload with a computed (or custom) HMAC signature
  def kapso_post(payload, signature: :valid)
    body = payload.to_json
    sig  = case signature
           when :valid   then OpenSSL::HMAC.hexdigest("SHA256", secret, body)
           when :missing then nil
           else signature
           end

    headers = { "CONTENT_TYPE" => "application/json" }
    headers["X-Webhook-Signature"] = sig unless sig.nil?

    post "/webhooks/whatsapp", params: body, headers: headers
  end

  # ─── payload fixtures ────────────────────────────────────────────────────────

  let(:inbound_event) do
    {
      "message" => {
        "id"        => "wamid.AAA001",
        "timestamp" => "1730092801",
        "type"      => "text",
        "text"      => { "body" => "Hola, necesito un turno" },
        "kapso"     => {
          "direction" => "inbound",
          "status"    => "received",
          "phone_number" => "+5491112345678"
        }
      },
      "conversation"        => { "id" => "conv_abc", "phone_number" => "+5491112345678" },
      "is_new_conversation" => true
    }
  end

  let(:batch_payload) do
    {
      "batch" => true,
      "data"  => [
        {
          "message"      => {
            "id" => "wamid.111", "type" => "text", "text" => { "body" => "Primero" },
            "kapso" => { "direction" => "inbound", "status" => "received" }
          },
          "conversation" => { "phone_number" => "+5491112345678" }
        },
        {
          "message"      => {
            "id" => "wamid.112", "type" => "text", "text" => { "body" => "Segundo" },
            "kapso" => { "direction" => "inbound", "status" => "received" }
          },
          "conversation" => { "phone_number" => "+5491112345678" }
        }
      ],
      "batch_info" => { "size" => 2, "window_ms" => 5000 }
    }
  end

  # ─── tests ───────────────────────────────────────────────────────────────────

  describe "POST /webhooks/whatsapp" do
    context "con firma válida" do
      it "retorna 200" do
        kapso_post(inbound_event)
        expect(response).to have_http_status(:ok)
      end

      it "encola MessageProcessorJob con el payload parseado" do
        expect(MessageProcessorJob).to receive(:perform_later).with(inbound_event)
        kapso_post(inbound_event)
      end
    end

    context "con firma inválida" do
      it "retorna 401" do
        kapso_post(inbound_event, signature: "deadbeef")
        expect(response).to have_http_status(:unauthorized)
      end

      it "no encola ningún job" do
        expect(MessageProcessorJob).not_to receive(:perform_later)
        kapso_post(inbound_event, signature: "deadbeef")
      end
    end

    context "sin header X-Webhook-Signature" do
      it "retorna 401" do
        kapso_post(inbound_event, signature: :missing)
        expect(response).to have_http_status(:unauthorized)
      end

      it "no encola ningún job" do
        expect(MessageProcessorJob).not_to receive(:perform_later)
        kapso_post(inbound_event, signature: :missing)
      end
    end

    context "payload batch (batch: true)" do
      it "encola un MessageProcessorJob por cada evento del batch" do
        expect(MessageProcessorJob).to receive(:perform_later).exactly(2).times
        kapso_post(batch_payload)
      end

      it "retorna 200" do
        kapso_post(batch_payload)
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
