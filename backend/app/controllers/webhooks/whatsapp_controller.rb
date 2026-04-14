module Webhooks
  class WhatsappController < ActionController::API
    # POST — incoming Kapso webhook events
    def receive
      raw_body = request.body.read
      return head :unauthorized unless valid_signature?(raw_body)

      payload = JSON.parse(raw_body)

      # Kapso may deliver a buffered batch: { batch: true, data: [{message, conversation}, ...] }
      # Enqueue one job per event so each message is processed independently
      events = payload["batch"] ? payload["data"] : [ payload ]
      events.each { |event| MessageProcessorJob.perform_later(event) }

      head :ok  # Kapso requires 200 in < 10 seconds
    end

    private

    def valid_signature?(raw_body)
      signature = request.headers["X-Webhook-Signature"]
      return false if signature.blank?

      secret = ENV.fetch("KAPSO_WEBHOOK_SECRET")
      expected = OpenSSL::HMAC.hexdigest("SHA256", secret, raw_body)
      Rack::Utils.secure_compare(signature, expected)
    end
  end
end
