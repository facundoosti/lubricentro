require 'rails_helper'

RSpec.describe VehicleLookupService do
  subject(:service) { described_class.new(plate) }
  let(:plate) { "ABC123" }

  let(:http_double) { instance_double(Net::HTTP) }
  let(:response_double) { instance_double(Net::HTTPResponse) }

  before do
    allow(Net::HTTP).to receive(:new).and_return(http_double)
    allow(http_double).to receive(:use_ssl=)
    allow(http_double).to receive(:open_timeout=)
    allow(http_double).to receive(:read_timeout=)
    allow(http_double).to receive(:request).and_return(response_double)
  end

  describe '#call' do
    context 'when API returns 200 with vehicle data' do
      let(:body) do
        {
          success: true,
          data: {
            make: "Toyota",
            model: "Corolla",
            year: 2020,
            plate: "ABC123",
            currentLocation: { province: "Buenos Aires" }
          }
        }.to_json
      end

      before do
        allow(response_double).to receive(:code).and_return("200")
        allow(response_double).to receive(:body).and_return(body)
      end

      it 'returns found status with vehicle data' do
        result = service.call
        expect(result[:status]).to eq("found")
        expect(result[:make]).to eq("Toyota")
        expect(result[:model]).to eq("Corolla")
        expect(result[:year]).to eq(2020)
        expect(result[:plate]).to eq("ABC123")
        expect(result[:province]).to eq("Buenos Aires")
      end
    end

    context 'when API returns 200 but success is false' do
      before do
        allow(response_double).to receive(:code).and_return("200")
        allow(response_double).to receive(:body).and_return({ success: false, data: nil }.to_json)
      end

      it 'returns not_found status' do
        result = service.call
        expect(result[:status]).to eq("not_found")
      end
    end

    context 'when API returns 404' do
      before { allow(response_double).to receive(:code).and_return("404") }

      it 'returns not_found status' do
        result = service.call
        expect(result[:status]).to eq("not_found")
      end
    end

    context 'when API returns 401' do
      before { allow(response_double).to receive(:code).and_return("401") }

      it 'returns error with invalid API key message' do
        result = service.call
        expect(result[:status]).to eq("error")
        expect(result[:message]).to include("API key")
      end
    end

    context 'when API returns 403' do
      before { allow(response_double).to receive(:code).and_return("403") }

      it 'returns error with invalid API key message' do
        result = service.call
        expect(result[:status]).to eq("error")
        expect(result[:message]).to include("API key")
      end
    end

    context 'when API returns 429' do
      before { allow(response_double).to receive(:code).and_return("429") }

      it 'returns error with rate limit message' do
        result = service.call
        expect(result[:status]).to eq("error")
        expect(result[:message]).to include("Rate limit")
      end
    end

    context 'when API returns other error code' do
      before { allow(response_double).to receive(:code).and_return("500") }

      it 'returns error with HTTP code' do
        result = service.call
        expect(result[:status]).to eq("error")
        expect(result[:message]).to include("500")
      end
    end

    context 'when response body is invalid JSON' do
      before do
        allow(response_double).to receive(:code).and_return("200")
        allow(response_double).to receive(:body).and_return("not valid json{")
      end

      it 'returns error with invalid response message' do
        result = service.call
        expect(result[:status]).to eq("error")
        expect(result[:message]).to include("inválida")
      end
    end

    context 'when a network error occurs' do
      before do
        allow(http_double).to receive(:request).and_raise(StandardError, "Connection timeout")
      end

      it 'returns error with message' do
        result = service.call
        expect(result[:status]).to eq("error")
        expect(result[:message]).to eq("Connection timeout")
      end
    end

    context 'when plate is given in lowercase' do
      subject(:service) { described_class.new("abc123") }

      before do
        allow(response_double).to receive(:code).and_return("404")
      end

      it 'upcases the plate' do
        expect(Net::HTTP::Get).to receive(:new).and_wrap_original do |orig, uri, *args|
          expect(uri.to_s).to include("ABC123")
          orig.call(uri, *args)
        end
        service.call
      end
    end
  end
end
