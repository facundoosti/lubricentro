module ApiHelper
  def json_response
    JSON.parse(response.body).with_indifferent_access
  end

  def auth_headers(user = nil)
    # TODO: Implement when JWT is ready
    # user ||= create(:user)
    # token = JwtService.encode(user_id: user.id)
    # { 'Authorization' => "Bearer #{token}" }
    {}
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
