# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_06_20_180318) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "appointments", force: :cascade do |t|
    t.datetime "scheduled_at", null: false
    t.string "status", default: "scheduled", null: false
    t.text "notes"
    t.bigint "customer_id", null: false
    t.bigint "vehicle_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id", "scheduled_at"], name: "index_appointments_on_customer_id_and_scheduled_at"
    t.index ["customer_id"], name: "index_appointments_on_customer_id"
    t.index ["scheduled_at"], name: "index_appointments_on_scheduled_at"
    t.index ["status"], name: "index_appointments_on_status"
    t.index ["vehicle_id", "scheduled_at"], name: "index_appointments_on_vehicle_id_and_scheduled_at"
    t.index ["vehicle_id"], name: "index_appointments_on_vehicle_id"
  end

  create_table "customers", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.string "phone", limit: 20
    t.string "email", limit: 100
    t.text "address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_customers_on_email", unique: true
    t.index ["name"], name: "index_customers_on_name"
  end

  create_table "products", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.text "description"
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.string "unit", limit: 50
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_products_on_name", unique: true
    t.index ["unit_price"], name: "index_products_on_unit_price"
  end

  create_table "service_records", force: :cascade do |t|
    t.date "service_date"
    t.decimal "total_amount"
    t.text "notes"
    t.integer "mileage"
    t.date "next_service_date"
    t.bigint "customer_id", null: false
    t.bigint "vehicle_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_service_records_on_customer_id"
    t.index ["vehicle_id"], name: "index_service_records_on_vehicle_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.text "description"
    t.decimal "base_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["base_price"], name: "index_services_on_base_price"
    t.index ["name"], name: "index_services_on_name", unique: true
  end

  create_table "vehicles", force: :cascade do |t|
    t.string "brand", null: false
    t.string "model", null: false
    t.string "license_plate", null: false
    t.string "year", null: false
    t.bigint "customer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_vehicles_on_customer_id"
    t.index ["license_plate"], name: "index_vehicles_on_license_plate", unique: true
  end

  add_foreign_key "appointments", "customers"
  add_foreign_key "appointments", "vehicles"
  add_foreign_key "service_records", "customers"
  add_foreign_key "service_records", "vehicles"
  add_foreign_key "vehicles", "customers"
end
