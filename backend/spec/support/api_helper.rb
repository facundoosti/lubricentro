module ApiHelper
  def json_response
    JSON.parse(response.body).with_indifferent_access
  end

  def auth_headers(user = nil)
    user ||= create(:user)

    # Crear token usando Doorkeeper
    application = Doorkeeper::Application.first || create(:oauth_application)
    access_token = Doorkeeper::AccessToken.create!(
      resource_owner_id: user.id,
      application_id: application.id,
      expires_in: Doorkeeper.configuration.access_token_expires_in,
      scopes: Doorkeeper.configuration.default_scopes
    )

    { 'Authorization' => "Bearer #{access_token.token}" }
  end

  def api_success_response(data, message = nil)
    {
      success: true,
      data: data,
      message: message
    }.compact
  end

  def api_error_response(errors, message = nil)
    {
      success: false,
      errors: Array(errors),
      message: message || "Error occurred"
    }
  end
end
