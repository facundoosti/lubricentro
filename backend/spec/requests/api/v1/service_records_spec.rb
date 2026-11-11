require 'rails_helper'

RSpec.describe "Api::V1::ServiceRecords", type: :request do
  include ApiHelper
  let(:user) { create(:user) }
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:service_record) { create(:service_record, customer: customer, vehicle: vehicle) }
  let(:valid_attributes) { attributes_for(:service_record, customer_id: customer.id, vehicle_id: vehicle.id) }
  let(:invalid_attributes) { { service_date: nil, total_amount: nil, mileage: nil } }

  describe "GET /api/v1/service_records" do
    before do
      create_list(:service_record, 3, customer: customer, vehicle: vehicle)
    end

    it "returns a successful response" do
      get "/api/v1/service_records", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it "returns all service records" do
      get "/api/v1/service_records", headers: auth_headers(user)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]["service_records"].length).to eq(3)
    end

    it "follows API response pattern" do
      get "/api/v1/service_records", headers: auth_headers(user)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key("success")
      expect(json_response).to have_key("data")
    end

    context "with customer_id filter" do
      let(:other_customer) { create(:customer) }
      let(:other_vehicle) { create(:vehicle, customer: other_customer) }

      before do
        create(:service_record, customer: other_customer, vehicle: other_vehicle)
      end

      it "filters by customer_id" do
        get "/api/v1/service_records", params: { customer_id: customer.id }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["data"]["service_records"].length).to eq(3)
      end
    end

    context "with vehicle_id filter" do
      let(:other_vehicle) { create(:vehicle, customer: customer) }

      before do
        create(:service_record, customer: customer, vehicle: other_vehicle)
      end

      it "filters by vehicle_id" do
        get "/api/v1/service_records", params: { vehicle_id: vehicle.id }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["data"]["service_records"].length).to eq(3)
      end
    end

    context "with date range filter" do
      it "filters by date range" do
        start_date = 1.week.ago.to_date
        end_date = 1.week.from_now.to_date
        get "/api/v1/service_records", params: { start_date: start_date, end_date: end_date }, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/:id" do
    it "returns a successful response" do
      get "/api/v1/service_records/#{service_record.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it "returns the service record data" do
      get "/api/v1/service_records/#{service_record.id}", headers: auth_headers(user)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]["id"]).to eq(service_record.id)
    end

    context "when service record not found" do
      it "returns not found error" do
        get "/api/v1/service_records/999999", headers: auth_headers(user)
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be false
        expect(json_response["message"]).to eq("Service record not found")
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/#{service_record.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/service_records" do
    context "with valid parameters" do
      it "creates a new ServiceRecord" do
        expect {
          post "/api/v1/service_records", params: { service_record: valid_attributes }, headers: auth_headers(user)
        }.to change(ServiceRecord, :count).by(1)
      end

      it "returns a created response" do
        post "/api/v1/service_records", params: { service_record: valid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
      end

      it "returns success response" do
        post "/api/v1/service_records", params: { service_record: valid_attributes }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be true
        expect(json_response["message"]).to eq("Service record created successfully")
      end
    end

    context "with invalid parameters" do
      it "does not create a new ServiceRecord" do
        expect {
          post "/api/v1/service_records", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        }.not_to change(ServiceRecord, :count)
      end

      it "returns an unprocessable entity response" do
        post "/api/v1/service_records", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns error response" do
        post "/api/v1/service_records", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be false
        expect(json_response["message"]).to eq("Failed to create service record")
      end
    end

    context "with customer_id parameter" do
      let(:other_customer) { create(:customer) }

      it "sets the customer when customer_id is provided" do
        post "/api/v1/service_records", params: {
          service_record: valid_attributes.merge(customer_id: other_customer.id),
          customer_id: other_customer.id
        }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
      end

      context "when customer not found" do
        it "returns not found error" do
          post "/api/v1/service_records", params: {
            service_record: valid_attributes,
            customer_id: 999999
          }, headers: auth_headers(user)
          expect(response).to have_http_status(:not_found)
          json_response = JSON.parse(response.body)
          expect(json_response["message"]).to eq("Customer not found")
        end
      end
    end

    context "with vehicle_id parameter" do
      let(:other_vehicle) { create(:vehicle, customer: customer) }

      it "sets the vehicle when vehicle_id is provided" do
        post "/api/v1/service_records", params: {
          service_record: valid_attributes.merge(vehicle_id: other_vehicle.id),
          vehicle_id: other_vehicle.id
        }, headers: auth_headers(user)
        expect(response).to have_http_status(:created)
      end

      context "when vehicle not found" do
        it "returns not found error" do
          post "/api/v1/service_records", params: {
            service_record: valid_attributes,
            vehicle_id: 999999
          }, headers: auth_headers(user)
          expect(response).to have_http_status(:not_found)
          json_response = JSON.parse(response.body)
          expect(json_response["message"]).to eq("Vehicle not found")
        end
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        post "/api/v1/service_records", params: { service_record: valid_attributes }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "ítems (items_attributes)" do
    let(:product) { create(:product) }
    let(:mixed_items) do
      [
        { description: "Aceite 5W30", quantity: 2, unit_price: 10_000, iva_rate: 21, product_id: product.id, position: 0 },
        { description: "Lavado de motor", quantity: 1, unit_price: 5_000, position: 1 }
      ]
    end

    def create_record(extra = {})
      post "/api/v1/service_records",
           params: { service_record: valid_attributes.merge(items_attributes: mixed_items).merge(extra) },
           headers: auth_headers(user), as: :json
    end

    it "crea la atención con sus ítems en orden y el total con IVA" do
      create_record
      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]
      expect(data["items"].map { |i| i["description"] }).to eq([ "Aceite 5W30", "Lavado de motor" ])
      expect(data["items"].first).to include("product_id" => product.id, "service_id" => nil, "iva_rate" => "21.0", "total" => "20000.0")
      expect(data["items"].last).to include("product_id" => nil, "service_id" => nil, "iva_rate" => nil)
      expect(data).to include("total_amount" => "29200.0", "subtotal_net" => "20000.0", "total_iva" => "4200.0",
                              "exempt_total" => "5000.0", "budget_id" => nil)
      expect(data["iva_breakdown"]).to eq([ { "rate" => "21.0", "base" => "20000.0", "amount" => "4200.0" } ])
    end

    it "ignora el total_amount enviado por el cliente" do
      create_record(total_amount: 1)
      expect(JSON.parse(response.body)["data"]["total_amount"]).to eq("29200.0")
    end

    it "descarta los ítems sin descripción" do
      post "/api/v1/service_records",
           params: { service_record: valid_attributes.merge(items_attributes: [ { description: "", quantity: 1, unit_price: 100 } ]) },
           headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:created)
      expect(ServiceRecord.last.items).to be_empty
    end

    it "responde 422 con un % de IVA inválido" do
      post "/api/v1/service_records",
           params: { service_record: valid_attributes.merge(items_attributes: [ { description: "X", quantity: 1, unit_price: 100, iva_rate: 100 } ]) },
           headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(ServiceRecord.count).to eq(0)
    end

    it "borra un ítem con _destroy y recalcula el total" do
      create_record
      record = ServiceRecord.last
      patch "/api/v1/service_records/#{record.id}",
            params: { service_record: { items_attributes: [ { id: record.items.first.id, _destroy: true } ] } },
            headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
      expect(record.reload.items.count).to eq(1)
      expect(record.total_amount).to eq(5_000)
    end
  end

  describe "copiar desde presupuesto (budget_id)" do
    let(:budget) { create(:budget, customer: customer, status: "sent") }

    def create_with_budget(budget_id, customer_id: customer.id, vehicle_id: vehicle.id)
      post "/api/v1/service_records",
           params: { service_record: valid_attributes.merge(customer_id: customer_id, vehicle_id: vehicle_id, budget_id: budget_id) },
           headers: auth_headers(user), as: :json
    end

    it "vincula la atención y pasa el presupuesto a aprobado" do
      create_with_budget(budget.id)
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["data"]["budget_id"]).to eq(budget.id)
      expect(budget.reload.status).to eq("approved")
    end

    it "sin budget_id no toca ningún presupuesto" do
      create_with_budget(nil)
      expect(response).to have_http_status(:created)
      expect(ServiceRecord.last.budget_id).to be_nil
      expect(budget.reload.status).to eq("sent")
    end

    it "responde 422 si el presupuesto es de otro cliente y no guarda nada" do
      other_customer = create(:customer)
      other_vehicle = create(:vehicle, customer: other_customer)
      expect {
        create_with_budget(budget.id, customer_id: other_customer.id, vehicle_id: other_vehicle.id)
      }.not_to change(ServiceRecord, :count)
      expect(response).to have_http_status(:unprocessable_content)
      expect(budget.reload.status).to eq("sent")
    end

    it "responde 422 si el presupuesto no existe" do
      expect { create_with_budget(0) }.not_to change(ServiceRecord, :count)
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "no crea la atención si el presupuesto no se puede aprobar" do
      budget.update_column(:card_surcharge_percentage, 200)
      expect { create_with_budget(budget.id) }.not_to change(ServiceRecord, :count)
      expect(response).to have_http_status(:unprocessable_content)
      expect(budget.reload.status).to eq("sent")
    end

    it "editar la atención no cambia el estado del presupuesto" do
      create_with_budget(budget.id)
      budget.reload.update!(status: "sent")
      patch "/api/v1/service_records/#{ServiceRecord.last.id}",
            params: { service_record: { notes: "otra nota" } }, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
      expect(budget.reload.status).to eq("sent")
    end
  end

  describe "PATCH/PUT /api/v1/service_records/:id" do
    context "with valid parameters" do
      let(:new_attributes) { { notes: "Updated notes", total_amount: 150.50 } }

      it "updates the requested service record" do
        previous_total = service_record.total_amount
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: new_attributes }, headers: auth_headers(user)
        service_record.reload
        expect(service_record.notes).to eq("Updated notes")
        # total_amount no se acepta del cliente; sin cambios en los ítems queda como estaba
        expect(service_record.total_amount).to eq(previous_total)
      end

      it "returns a successful response" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: new_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be true
        expect(json_response["message"]).to eq("Service record updated successfully")
      end
    end

    it "ignora budget_id: el presupuesto de origen no cambia al editar" do
      budget = create(:budget, customer: customer)
      service_record.update_column(:budget_id, budget.id)
      other_budget = create(:budget, customer: customer)
      patch "/api/v1/service_records/#{service_record.id}",
            params: { service_record: { notes: "x", budget_id: other_budget.id } }, headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
      expect(service_record.reload.budget_id).to eq(budget.id)
    end

    it "responde 404 si items_attributes trae un ítem de otra atención" do
      foreign_item = create(:service_record_item, description: "Ajeno", quantity: 1, unit_price: 100)
      patch "/api/v1/service_records/#{service_record.id}",
            params: { service_record: { items_attributes: [ { id: foreign_item.id, description: "Robado", quantity: 9 } ] } },
            headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be false
      expect(json_response["errors"]).to be_present
      expect(json_response["message"]).to be_present
      expect(foreign_item.reload).to have_attributes(description: "Ajeno", service_record_id: foreign_item.service_record_id)
    end

    context "with invalid parameters" do
      it "returns error response" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: invalid_attributes }, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be false
        expect(json_response["errors"]).to be_present
      end
    end

    context "without authentication" do
      it "returns unauthorized" do
        patch "/api/v1/service_records/#{service_record.id}", params: { service_record: { notes: "test" } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/service_records/:id" do
    let!(:service_record_to_delete) { create(:service_record, customer: customer, vehicle: vehicle) }

    it "destroys the requested service record" do
      expect {
        delete "/api/v1/service_records/#{service_record_to_delete.id}", headers: auth_headers(user)
      }.to change(ServiceRecord, :count).by(-1)
    end

    it "returns a successful response" do
      delete "/api/v1/service_records/#{service_record_to_delete.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["message"]).to eq("Service record deleted successfully")
    end

    context "without authentication" do
      it "returns unauthorized" do
        delete "/api/v1/service_records/#{service_record_to_delete.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/overdue" do
    before do
      @overdue_record = create(:service_record, :overdue, customer: customer, vehicle: vehicle)
      @upcoming_record = create(:service_record, :upcoming, customer: customer, vehicle: vehicle)
    end

    it "returns only overdue service records" do
      get "/api/v1/service_records/overdue", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]).to be_an(Array)
      expect(@overdue_record.next_service_date).not_to eq(@upcoming_record.next_service_date)
      overdue_count = ServiceRecord.where("next_service_date < ?", Date.current).count
      expect(json_response["data"].length).to eq(overdue_count)
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/overdue"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/upcoming" do
    before do
      @overdue_record = create(:service_record, :overdue, customer: customer, vehicle: vehicle)
      @upcoming_record = create(:service_record, :upcoming, customer: customer, vehicle: vehicle)
    end

    it "returns only upcoming service records" do
      get "/api/v1/service_records/upcoming", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]).to be_an(Array)
      expect(@overdue_record.next_service_date).not_to eq(@upcoming_record.next_service_date)
      upcoming_count = ServiceRecord.where("next_service_date BETWEEN ? AND ?", Date.current, Date.current + 1.month).count
      expect(json_response["data"].length).to eq(upcoming_count)
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/upcoming"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/service_records/statistics" do
    before do
      create_list(:service_record, 5, customer: customer, vehicle: vehicle)
    end

    it "returns service record statistics" do
      get "/api/v1/service_records/statistics", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["success"]).to be true
      expect(json_response["data"]).to have_key("total_records")
      expect(json_response["data"]).to have_key("total_amount")
    end

    context "without authentication" do
      it "returns unauthorized" do
        get "/api/v1/service_records/statistics"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "nested routes" do
    describe "GET /api/v1/customers/:customer_id/service_records" do
      before do
        create_list(:service_record, 2, customer: customer, vehicle: vehicle)
        other_customer = create(:customer)
        other_vehicle = create(:vehicle, customer: other_customer)
        create(:service_record, customer: other_customer, vehicle: other_vehicle)
      end

      it "returns service records for specific customer" do
        get "/api/v1/customers/#{customer.id}/service_records", headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["data"].length).to eq(2)
      end
    end

    describe "GET /api/v1/vehicles/:vehicle_id/service_records" do
      before do
        create_list(:service_record, 2, customer: customer, vehicle: vehicle)
        other_vehicle = create(:vehicle, customer: customer)
        create(:service_record, customer: customer, vehicle: other_vehicle)
      end

      it "returns service records for specific vehicle" do
        get "/api/v1/vehicles/#{vehicle.id}/service_records", headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["data"].length).to eq(2)
      end
    end
  end
end
