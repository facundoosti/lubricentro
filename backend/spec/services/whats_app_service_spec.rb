require 'rails_helper'

RSpec.describe WhatsAppService do
  subject(:service) { described_class.new }

  # Override the constant (set at class load time from ENV) for tests
  before do
    stub_const("WhatsAppService::BASE_URL", "https://api.test.kapso.local/meta/whatsapp/v24.0")
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("KAPSO_API_KEY").and_return("test_api_key")
    allow(ENV).to receive(:fetch).with("KAPSO_PHONE_NUMBER_ID").and_return("123456789")
  end

  # ─── HTTP helpers ─────────────────────────────────────────────────────────────

  # Returns a double that passes `response.is_a?(Net::HTTPSuccess)` → true
  def http_success(body = "{}")
    double("Net::HTTPSuccess").tap do |r|
      allow(r).to receive(:is_a?).with(Net::HTTPSuccess).and_return(true)
      allow(r).to receive(:body).and_return(body)
    end
  end

  # Returns a double that passes `response.is_a?(Net::HTTPSuccess)` → false
  def http_error(body = '{"error":"bad_request"}')
    double("Net::HTTPClientError").tap do |r|
      allow(r).to receive(:is_a?).with(Net::HTTPSuccess).and_return(false)
      allow(r).to receive(:body).and_return(body)
    end
  end

  # Stubs Net::HTTP#request to return a given response and optionally
  # captures the Net::HTTP::Request object for body/header assertions.
  def stub_http(response)
    allow_any_instance_of(Net::HTTP).to receive(:request).and_return(response)
  end

  def capture_http_request(response)
    captured = nil
    allow_any_instance_of(Net::HTTP).to receive(:request) do |_, req|
      captured = req
      response
    end
    captured  # caller saves the reference; block updates it lazily
  end

  # ─── #send_message ────────────────────────────────────────────────────────────

  describe "#send_message" do
    let(:phone) { "+5491112345678" }
    let(:text)  { "Hola, ¿en qué podemos ayudarte?" }

    context "API responde con éxito" do
      before { stub_http(http_success) }

      it "retorna la response HTTP" do
        result = service.send_message(phone: phone, text: text)
        expect(result.is_a?(Net::HTTPSuccess)).to be(true)
      end

      it "no loguea ningún error" do
        expect(Rails.logger).not_to receive(:error)
        service.send_message(phone: phone, text: text)
      end

      it "envía el JSON body correcto" do
        sent = nil
        allow_any_instance_of(Net::HTTP).to receive(:request) { |_, req| sent = req; http_success }

        service.send_message(phone: phone, text: text)

        body = JSON.parse(sent.body)
        expect(body["messaging_product"]).to eq("whatsapp")
        expect(body["to"]).to eq(phone)
        expect(body["type"]).to eq("text")
        expect(body["text"]["body"]).to eq(text)
      end

      it "incluye el header X-API-Key" do
        sent = nil
        allow_any_instance_of(Net::HTTP).to receive(:request) { |_, req| sent = req; http_success }

        service.send_message(phone: phone, text: text)
        expect(sent["X-API-Key"]).to eq("test_api_key")
      end

      it "incluye el header Content-Type application/json" do
        sent = nil
        allow_any_instance_of(Net::HTTP).to receive(:request) { |_, req| sent = req; http_success }

        service.send_message(phone: phone, text: text)
        expect(sent["Content-Type"]).to eq("application/json")
      end
    end

    context "API responde con error" do
      before do
        allow(Rails.logger).to receive(:error)
        stub_http(http_error('{"error":"unauthorized"}'))
      end

      it "no lanza excepción" do
        expect { service.send_message(phone: phone, text: text) }.not_to raise_error
      end

      it "loguea el error con contexto de servicio" do
        expect(Rails.logger).to receive(:error).with(match(/\[WhatsAppService\]/))
        service.send_message(phone: phone, text: text)
      end
    end
  end

  # ─── #send_reminder_template ──────────────────────────────────────────────────

  describe "#send_reminder_template" do
    let(:params) do
      {
        phone:    "+5491112345678",
        name:     "Juan Pérez",
        vehicle:  "Toyota Corolla",
        due_date: "15/06/2026"
      }
    end

    let(:success_body) { { "messages" => [ { "id" => "wamid.TEMPLATE001" } ] }.to_json }

    context "API responde con éxito" do
      before { stub_http(http_success(success_body)) }

      it "retorna el JSON parseado de la response" do
        result = service.send_reminder_template(**params)
        expect(result).to eq({ "messages" => [ { "id" => "wamid.TEMPLATE001" } ] })
      end

      it "envía el template correcto" do
        sent = nil
        allow_any_instance_of(Net::HTTP).to receive(:request) { |_, req| sent = req; http_success(success_body) }

        service.send_reminder_template(**params)

        body = JSON.parse(sent.body)
        expect(body["type"]).to eq("template")
        expect(body["template"]["name"]).to eq("service_reminder_v1")
        expect(body["template"]["language"]["code"]).to eq("es_AR")
      end

      it "incluye los parámetros del cliente y vehículo en el body del template" do
        sent = nil
        allow_any_instance_of(Net::HTTP).to receive(:request) { |_, req| sent = req; http_success(success_body) }

        service.send_reminder_template(**params)

        body       = JSON.parse(sent.body)
        components = body["template"]["components"]
        body_comp  = components.find { |c| c["type"] == "body" }
        texts      = body_comp["parameters"].map { |p| p["text"] }

        expect(texts).to include("Juan Pérez")
        expect(texts).to include("Toyota Corolla")
        expect(texts).to include("15/06/2026")
      end

      it "envía al teléfono correcto" do
        sent = nil
        allow_any_instance_of(Net::HTTP).to receive(:request) { |_, req| sent = req; http_success(success_body) }

        service.send_reminder_template(**params)
        expect(JSON.parse(sent.body)["to"]).to eq("+5491112345678")
      end
    end

    context "API responde con error" do
      before { stub_http(http_error('{"error":"template_not_found"}')) }

      it "lanza RuntimeError con el body del error" do
        expect { service.send_reminder_template(**params) }
          .to raise_error(RuntimeError, /WhatsApp API error/)
      end
    end
  end
end
