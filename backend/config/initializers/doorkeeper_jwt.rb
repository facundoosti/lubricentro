# frozen_string_literal: true

Doorkeeper::JWT.configure do
  # Set the payload for the JWT token. This should contain unique information
  # about the user.
  token_payload do |opts|
    {
      iss: "lubricentro",
      iat: Time.current.utc.to_i,
      jti: SecureRandom.uuid,
      sub: opts[:resource_owner_id],
      aud: opts[:application][:uid],
      exp: 2.hours.from_now.to_i
    }
  end

  # Use the application's secret key for signing the token.
  secret_key Rails.application.credentials.secret_key_base

  # Optionally set additional headers to work with JWT.
  token_headers do |opts|
    {
      kid: opts[:application][:uid]
    }
  end
end
