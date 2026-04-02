module Webhooks
  class WhatsappController < ActionController::API
    # GET — Meta webhook verification
    def verify
      if params["hub.verify_token"] == ENV["WHATSAPP_VERIFY_TOKEN"] &&
         params["hub.mode"] == "subscribe"
        render plain: params["hub.challenge"]
      else
        head :forbidden
      end
    end

    # POST — incoming messages
    def receive
      payload = JSON.parse(request.body.read)
      MessageProcessorJob.perform_later(payload)
      head :ok  # Meta requires 200 in < 5 seconds
    end
  end
end
