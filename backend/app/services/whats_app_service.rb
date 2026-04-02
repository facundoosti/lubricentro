require "net/http"
require "json"

class WhatsAppService
  BASE_URL = "https://graph.facebook.com/v19.0"

  REMINDER_TEMPLATE = "service_reminder_v1"

  def self.send_message(phone:, text:)
    new.send_message(phone: phone, text: text)
  end

  def self.send_reminder_template(phone:, name:, vehicle:, due_date:)
    new.send_reminder_template(phone: phone, name: name, vehicle: vehicle, due_date: due_date)
  end

  def send_message(phone:, text:)
    uri = URI("#{BASE_URL}/#{phone_number_id}/messages")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{access_token}"
    request["Content-Type"]  = "application/json"
    request.body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: text }
    }.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("[WhatsAppService] Failed to send message: #{response.body}")
    end

    response
  end

  def send_reminder_template(phone:, name:, vehicle:, due_date:)
    uri = URI("#{BASE_URL}/#{phone_number_id}/messages")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{access_token}"
    request["Content-Type"]  = "application/json"
    request.body = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: REMINDER_TEMPLATE,
        language: { code: "es_AR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: name },
              { type: "text", text: vehicle },
              { type: "text", text: due_date }
            ]
          }
        ]
      }
    }.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise "WhatsApp API error: #{response.body}"
    end

    JSON.parse(response.body)
  end

  private

  def phone_number_id
    ENV.fetch("WHATSAPP_PHONE_NUMBER_ID")
  end

  def access_token
    ENV.fetch("WHATSAPP_ACCESS_TOKEN")
  end
end
