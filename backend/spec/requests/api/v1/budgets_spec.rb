require 'rails_helper'

RSpec.describe "Api::V1::Budgets", type: :request do
  include ApiHelper

  let(:user)     { create(:user) }
  let(:customer) { create(:customer) }
  let(:vehicle)  { create(:vehicle, customer: customer) }

  let(:valid_attributes) do
    {
      budgets: {
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        date: Date.current.iso8601,
        status: "draft",
        notes: "Test budget",
        card_surcharge_percentage: 0,
        items_attributes: [
          { description: "Cambio de aceite", quantity: 1, unit_price: 500 }
        ]
      }
    }
  end

  describe "GET /api/v1/budgets" do
    let!(:budgets) { create_list(:budget, 3, customer: customer, vehicle: vehicle) }

    before { get "/api/v1/budgets", headers: auth_headers(user) }

    it "returns 200" do
      expect(response).to have_http_status(:ok)
    end

    it "returns all budgets" do
      expect(json_response[:data][:budgets].length).to eq(3)
    end

    it "follows API response pattern" do
      expect(json_response).to include(success: true, data: hash_including(:budgets, :pagination))
    end
  end

  describe "GET /api/v1/budgets with filters" do
    let!(:draft_budget)   { create(:budget, status: "draft",   customer: customer, vehicle: vehicle) }
    let!(:sent_budget)    { create(:budget, status: "sent",    customer: customer, vehicle: vehicle) }

    it "filters by status" do
      get "/api/v1/budgets", params: { status: "draft" }, headers: auth_headers(user)
      ids = json_response[:data][:budgets].map { |b| b[:id] }
      expect(ids).to include(draft_budget.id)
      expect(ids).not_to include(sent_budget.id)
    end

    it "filters by customer_id" do
      other_customer = create(:customer)
      other_budget = create(:budget, customer: other_customer, vehicle: create(:vehicle, customer: other_customer))
      get "/api/v1/budgets", params: { customer_id: customer.id }, headers: auth_headers(user)
      ids = json_response[:data][:budgets].map { |b| b[:id] }
      expect(ids).to contain_exactly(draft_budget.id, sent_budget.id)
      expect(ids).not_to include(other_budget.id)
    end

    it "searches by vehicle_description" do
      create(:budget, vehicle_description: "Ford Ranger ABC123", customer: customer, vehicle: vehicle)
      get "/api/v1/budgets", params: { search: "Ford" }, headers: auth_headers(user)
      expect(json_response[:data][:budgets].length).to eq(1)
    end
  end

  describe "GET /api/v1/budgets/:id" do
    let!(:budget) { create(:budget, :with_items, customer: customer, vehicle: vehicle) }

    context "when budget exists" do
      before { get "/api/v1/budgets/#{budget.id}", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns the budget with items" do
        data = json_response[:data]
        expect(data[:id]).to eq(budget.id)
        expect(data[:items]).to be_an(Array)
      end
    end

    context "when budget does not exist" do
      before { get "/api/v1/budgets/0", headers: auth_headers(user) }

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/budgets" do
    context "with valid attributes" do
      before { post "/api/v1/budgets", params: valid_attributes, headers: auth_headers(user) }

      it "returns 201" do
        expect(response).to have_http_status(:created)
      end

      it "creates the budget" do
        expect(Budget.count).to eq(1)
      end

      it "returns the created budget" do
        expect(json_response[:data][:status]).to eq("draft")
      end

      it "returns the message in Spanish" do
        expect(json_response[:message]).to eq("Presupuesto creado exitosamente")
      end
    end

    context "con ítems con IVA" do
      before do
        attrs = valid_attributes.deep_dup
        attrs[:budgets][:card_surcharge_percentage] = 10
        attrs[:budgets][:items_attributes] = [
          { description: "Aceite", quantity: 2, unit_price: 10_000, iva_rate: "21" },
          { description: "Neumático", quantity: 1, unit_price: 4_000, iva_rate: "10.5" },
          { description: "Mano de obra", quantity: 1, unit_price: 15_000, iva_rate: "" }
        ]
        post "/api/v1/budgets", params: attrs, headers: auth_headers(user)
      end

      it "devuelve los totales con IVA discriminado" do
        data = json_response[:data]
        expect(data).to include(subtotal_net: "24000.0", total_iva: "4620.0", total_list: "43620.0",
                                total_card: "47982.0", exempt_total: "15000.0")
        expect(data[:iva_breakdown].map { |row| row.to_h.symbolize_keys }).to eq([
          { rate: "21.0", base: "20000.0", amount: "4200.0" },
          { rate: "10.5", base: "4000.0", amount: "420.0" }
        ])
      end

      it "guarda la alícuota de cada ítem" do
        expect(json_response[:data][:items].map { |i| i[:iva_rate] }).to eq([ "21.0", "10.5", nil ])
      end
    end

    context "con una alícuota inválida en un ítem" do
      it "returns 422" do
        attrs = valid_attributes.deep_dup
        attrs[:budgets][:items_attributes] = [ { description: "X", quantity: 1, unit_price: 100, iva_rate: "100" } ]
        post "/api/v1/budgets", params: attrs, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be(false)
        expect(Budget.count).to eq(0)
      end
    end

    context "con distintos % de IVA en un ítem" do
      def post_with_rate(rate)
        attrs = valid_attributes.deep_dup
        attrs[:budgets][:items_attributes] = [ { description: "X", quantity: 1, unit_price: 100, iva_rate: rate } ]
        post "/api/v1/budgets", params: attrs, headers: auth_headers(user)
      end

      [ "15", "0", "100", "-1" ].each do |rate|
        it "responde 422 con #{rate}" do
          post_with_rate(rate)
          expect(response).to have_http_status(:unprocessable_content)
          expect(json_response[:success]).to be(false)
          expect(json_response[:errors]).to be_present
          expect(Budget.count).to eq(0)
        end
      end
    end

    context "con ganancia en un ítem" do
      def post_with_margin(margin)
        attrs = valid_attributes.deep_dup
        attrs[:budgets][:card_surcharge_percentage] = 10
        attrs[:budgets][:items_attributes] = [
          { description: "Aceite", quantity: 1, unit_price: 1000, iva_rate: "21", margin_percentage: margin }.compact
        ]
        post "/api/v1/budgets", params: attrs, headers: auth_headers(user)
      end

      it "guarda la ganancia y la suma a los totales" do
        post_with_margin("30")
        expect(response).to have_http_status(:created)
        data = json_response[:data]
        expect(data[:items].first[:margin_percentage]).to eq("30.0")
        expect(data).to include(subtotal_net: "1000.0", total_iva: "210.0", margin_total: "300.0",
                                total_list: "1510.0", total_card: "1661.0")
      end

      it "usa 0 si no se envía" do
        post_with_margin(nil)
        expect(response).to have_http_status(:created)
        expect(json_response[:data][:items].first[:margin_percentage]).to eq("0.0")
        expect(json_response[:data]).to include(margin_total: "0.0", total_list: "1210.0")
      end

      [ "", nil ].each do |blank|
        it "usa 0 si se envía la clave con #{blank.inspect}" do
          attrs = valid_attributes.deep_dup
          attrs[:budgets][:items_attributes] = [
            { description: "Aceite", quantity: 1, unit_price: 1000, iva_rate: "21", margin_percentage: blank }
          ]
          post "/api/v1/budgets", params: attrs, headers: auth_headers(user), as: :json
          expect(response).to have_http_status(:created)
          expect(json_response[:data][:items].first[:margin_percentage]).to eq("0.0")
          expect(json_response[:data]).to include(margin_total: "0.0", total_list: "1210.0")
        end
      end

      it "responde 422 con una ganancia negativa" do
        post_with_margin("-5")
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:success]).to be(false)
        expect(Budget.count).to eq(0)
      end
    end

    context "con un vehículo de otro cliente" do
      it "returns 422" do
        attrs = valid_attributes.deep_dup
        attrs[:budgets][:vehicle_id] = create(:vehicle).id
        post "/api/v1/budgets", params: attrs, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end

    context "without authentication" do
      it "returns 401" do
        post "/api/v1/budgets", params: valid_attributes
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with invalid attributes" do
      before do
        post "/api/v1/budgets",
          params: { budgets: { date: nil, status: "invalid_status" } },
          headers: auth_headers(user)
      end

      it "returns 422" do
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe "PATCH /api/v1/budgets/:id" do
    let!(:budget) { create(:budget, status: "draft", customer: customer, vehicle: vehicle) }

    context "with valid attributes" do
      before do
        patch "/api/v1/budgets/#{budget.id}",
          params: { budgets: { notes: "Updated notes" } },
          headers: auth_headers(user)
      end

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "updates the budget" do
        expect(budget.reload.notes).to eq("Updated notes")
      end
    end

    context "with invalid attributes" do
      before do
        patch "/api/v1/budgets/#{budget.id}",
          params: { budgets: { status: "invalid" } },
          headers: auth_headers(user)
      end

      it "returns 422" do
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "con un ítem viejo guardado con % libre" do
      let!(:item) do
        budget.items.create!(description: "Aceite", quantity: 1, unit_price: 1000, iva_rate: 21).tap do |i|
          i.update_column(:iva_rate, 15)
        end
      end

      it "lo vuelve a guardar sin tocar la alícuota y con ganancia" do
        patch "/api/v1/budgets/#{budget.id}",
          params: { budgets: { items_attributes: [ { id: item.id, description: "Aceite", quantity: 2, iva_rate: "15",
                                                     margin_percentage: "10" } ] } },
          headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
        expect(item.reload).to have_attributes(iva_rate: 15, margin_percentage: 10)
        expect(json_response[:data]).to include(total_iva: "300.0", margin_total: "200.0", total_list: "2500.0")
      end

      it "responde 422 si se cambia a otro % fuera de la lista" do
        patch "/api/v1/budgets/#{budget.id}",
          params: { budgets: { items_attributes: [ { id: item.id, description: "Aceite", iva_rate: "16" } ] } },
          headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_content)
        expect(item.reload.iva_rate).to eq(15)
      end
    end

    context "when budget does not exist" do
      before do
        patch "/api/v1/budgets/0",
          params: { budgets: { notes: "x" } },
          headers: auth_headers(user)
      end

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/budgets/:id/duplicate" do
    let!(:budget) do
      create(:budget, status: "approved", date: 1.month.ago.to_date, customer: customer, vehicle: vehicle,
                      notes: "Original", card_surcharge_percentage: 10)
    end

    before do
      budget.items.create!(description: "Aceite", quantity: 2, unit_price: 1000, iva_rate: 21, margin_percentage: 25,
                           position: 0)
      budget.items.create!(description: "Mano de obra", quantity: 1, unit_price: 500, iva_rate: nil, position: 1)
      budget.save!
    end

    context "when budget exists" do
      before { post "/api/v1/budgets/#{budget.id}/duplicate", headers: auth_headers(user) }

      it "returns 201 with a new draft dated today" do
        expect(response).to have_http_status(:created)
        expect(json_response[:success]).to be(true)
        data = json_response[:data]
        expect(data[:id]).not_to eq(budget.id)
        expect(data).to include(status: "draft", date: Date.current.iso8601, notes: "Original",
                                customer_id: customer.id, vehicle_id: vehicle.id)
      end

      it "copies the items with their IVA rate and margin" do
        items = json_response[:data][:items]
        expect(items.map { |i| [ i[:description], i[:iva_rate], i[:margin_percentage] ] })
          .to eq([ [ "Aceite", "21.0", "25.0" ], [ "Mano de obra", nil, "0.0" ] ])
        expect(json_response[:data][:total_list]).to eq(budget.reload.total_list.to_s)
      end

      it "keeps the original untouched" do
        expect(budget.reload.status).to eq("approved")
        expect(budget.items.count).to eq(2)
      end
    end

    context "con un ítem al % anterior (15)" do
      before do
        budget.items.create!(description: "Filtro", quantity: 1, unit_price: 200, iva_rate: 21, position: 2)
                     .update_column(:iva_rate, 15)
      end

      it "lo duplica y conserva el 15%" do
        post "/api/v1/budgets/#{budget.id}/duplicate", headers: auth_headers(user)
        expect(response).to have_http_status(:created)
        filtro = json_response[:data][:items].find { |i| i[:description] == "Filtro" }
        expect(filtro[:iva_rate]).to eq("15.0")
        expect(Budget.find(json_response[:data][:id]).items.find_by(description: "Filtro").iva_rate).to eq(15)
      end
    end

    context "when budget does not exist" do
      it "returns 404" do
        post "/api/v1/budgets/0/duplicate", headers: auth_headers(user)
        expect(response).to have_http_status(:not_found)
        expect(json_response[:success]).to be(false)
      end
    end

    context "without authentication" do
      it "returns 401" do
        post "/api/v1/budgets/#{budget.id}/duplicate"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/budgets/:id" do
    let!(:budget) { create(:budget, customer: customer, vehicle: vehicle) }

    context "when budget exists" do
      before { delete "/api/v1/budgets/#{budget.id}", headers: auth_headers(user) }

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "destroys the budget" do
        expect(Budget.find_by(id: budget.id)).to be_nil
      end
    end

    context "when budget does not exist" do
      before { delete "/api/v1/budgets/0", headers: auth_headers(user) }

      it "returns 404" do
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
