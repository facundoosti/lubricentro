require "net/http"
require "json"

class VehicleLookupService
  API_URL = "https://api.clasific.ar/v1/vehicles/basic".freeze

  def initialize(plate)
    @plate = plate.upcase.strip
  end

  def call
    response = make_request
    parse_response(response)
  rescue StandardError => e
    { status: "error", message: e.message }
  end

  private

  def make_request
    uri = URI(API_URL)
    uri.query = URI.encode_www_form(plate: @plate)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10

    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "Bearer #{ENV.fetch('CLASIFIC_API_KEY', '')}"
    request["Accept"] = "application/json"

    http.request(request)
  end

  def parse_response(response)
    case response.code.to_i
    when 200
      extract_vehicle_data(response.body)
    when 401, 403
      { status: "error", message: "API key inválida o expirada" }
    when 404
      { status: "not_found" }
    when 429
      { status: "error", message: "Rate limit alcanzado" }
    else
      { status: "error", message: "HTTP #{response.code}" }
    end
  end

  def extract_vehicle_data(body)
    parsed = JSON.parse(body)

    return { status: "not_found" } unless parsed["success"] && parsed["data"]

    data = parsed["data"]
    {
      status: "found",
      make: data["make"],
      model: data["model"],
      year: data["year"],
      plate: data["plate"],
      province: data.dig("currentLocation", "province")
    }
  rescue JSON::ParserError
    { status: "error", message: "Respuesta inválida de la API" }
  end
end
