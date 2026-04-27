require "net/http"
require "json"

class VehicleLookupService
  API_URL = "https://clasific.ar/".freeze
  NEXT_ACTION = "40fa62eaeafe48f7414dfba1dad3c5eeac32b61fc2".freeze

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
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10

    request = Net::HTTP::Post.new(uri)
    request["accept"] = "text/x-component"
    request["accept-language"] = "es-419,es;q=0.9"
    request["content-type"] = "text/plain;charset=UTF-8"
    request["next-action"] = NEXT_ACTION
    request["next-router-state-tree"] = "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D"
    request["origin"] = "https://clasific.ar"
    request["referer"] = "https://clasific.ar/"
    request["user-agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
    request["cookie"] = build_cookie_header

    request.body = JSON.generate([ @plate ])

    http.request(request)
  end

  def build_cookie_header
    [
      "__Host-authjs.csrf-token=#{ENV.fetch('CLASIFIC_CSRF_TOKEN', '')}",
      "__Secure-authjs.callback-url=https%3A%2F%2Fclasific.ar%2Faccount",
      "__Secure-authjs.session-token=#{ENV.fetch('CLASIFIC_SESSION_TOKEN', '')}"
    ].join("; ")
  end

  def parse_response(response)
    case response.code.to_i
    when 200
      extract_vehicle_data(response.body)
    when 401, 403
      { status: "error", message: "Sesión inválida o expirada" }
    when 429
      { status: "error", message: "Rate limit alcanzado" }
    else
      { status: "error", message: "HTTP #{response.code}" }
    end
  end

  # RSC streaming format: "0:{metadata}\n1:{action_result}\n..."
  # The server action result is on line 1 with shape:
  #   {"status":"found","data":{"plate":...,"make":...,"model":...,"year":...,"province":...}}
  def extract_vehicle_data(body)
    body.each_line do |line|
      line = line.strip
      next unless line.match?(/^\d+:\{/)

      payload = line.sub(/^\d+:/, "")

      begin
        parsed = JSON.parse(payload)
        next unless parsed.is_a?(Hash) && parsed.key?("status")

        case parsed["status"]
        when "found"
          vehicle = parsed["data"]
          return {
            status: "found",
            make: vehicle["make"],
            model: vehicle["model"],
            year: vehicle["year"],
            plate: vehicle["plate"],
            province: vehicle["province"]
          }
        when "not_found"
          return { status: "not_found" }
        end
      rescue JSON::ParserError
        next
      end
    end

    { status: "not_found" }
  end
end
