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

ActiveRecord::Schema[8.0].define(version: 2026_04_29_100002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "vector"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

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

  create_table "budget_items", force: :cascade do |t|
    t.bigint "budget_id", null: false
    t.integer "position", default: 0, null: false
    t.decimal "quantity", precision: 10, scale: 2, default: "1.0", null: false
    t.string "description", limit: 300, null: false
    t.decimal "unit_price", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "total", precision: 12, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["budget_id", "position"], name: "index_budget_items_on_budget_id_and_position"
    t.index ["budget_id"], name: "index_budget_items_on_budget_id"
  end

  create_table "budgets", force: :cascade do |t|
    t.bigint "customer_id"
    t.bigint "vehicle_id"
    t.string "vehicle_description", limit: 200
    t.date "date", null: false
    t.string "status", limit: 20, default: "draft", null: false
    t.text "notes"
    t.decimal "card_surcharge_percentage", precision: 5, scale: 2, default: "0.0"
    t.decimal "total_list", precision: 12, scale: 2, default: "0.0"
    t.decimal "total_card", precision: 12, scale: 2, default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_budgets_on_customer_id"
    t.index ["date"], name: "index_budgets_on_date"
    t.index ["status"], name: "index_budgets_on_status"
    t.index ["vehicle_id"], name: "index_budgets_on_vehicle_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.bigint "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
    t.index ["parent_id"], name: "index_categories_on_parent_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "customer_id"
    t.string "whatsapp_phone", null: false
    t.string "status", default: "bot", null: false
    t.string "label"
    t.datetime "last_message_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_conversations_on_customer_id"
    t.index ["status"], name: "index_conversations_on_status"
    t.index ["whatsapp_phone"], name: "index_conversations_on_whatsapp_phone", unique: true
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

  create_table "messages", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.string "direction", null: false
    t.string "sender_type"
    t.text "body", null: false
    t.string "whatsapp_message_id"
    t.datetime "received_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "delivered_at"
    t.datetime "read_at"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["whatsapp_message_id"], name: "index_messages_on_whatsapp_message_id", unique: true, where: "(whatsapp_message_id IS NOT NULL)"
  end

  create_table "oauth_access_grants", force: :cascade do |t|
    t.bigint "resource_owner_id", null: false
    t.bigint "application_id", null: false
    t.string "token", null: false
    t.integer "expires_in", null: false
    t.text "redirect_uri", null: false
    t.string "scopes", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "revoked_at"
    t.index ["application_id"], name: "index_oauth_access_grants_on_application_id"
    t.index ["resource_owner_id"], name: "index_oauth_access_grants_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true
  end

  create_table "oauth_access_tokens", force: :cascade do |t|
    t.bigint "resource_owner_id"
    t.bigint "application_id", null: false
    t.string "token", null: false
    t.string "refresh_token"
    t.integer "expires_in"
    t.string "scopes"
    t.datetime "created_at", null: false
    t.datetime "revoked_at"
    t.string "previous_refresh_token", default: "", null: false
    t.index ["application_id"], name: "index_oauth_access_tokens_on_application_id"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true
  end

  create_table "oauth_applications", force: :cascade do |t|
    t.string "name", null: false
    t.string "uid", null: false
    t.string "secret", null: false
    t.text "redirect_uri", null: false
    t.string "scopes", default: "", null: false
    t.boolean "confidential", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true
  end

  create_table "products", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.text "description"
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.string "unit", limit: 50
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.vector "embedding", limit: 768
    t.string "sku", limit: 50
    t.bigint "supplier_id"
    t.string "brand", limit: 100
    t.bigint "category_id"
    t.integer "stock", default: 0, null: false
    t.index ["category_id"], name: "index_products_on_category_id"
    t.index ["name"], name: "index_products_on_name", unique: true
    t.index ["sku"], name: "index_products_on_sku", unique: true, where: "(sku IS NOT NULL)"
    t.index ["supplier_id"], name: "index_products_on_supplier_id"
    t.index ["unit_price"], name: "index_products_on_unit_price"
  end

  create_table "service_record_products", force: :cascade do |t|
    t.bigint "service_record_id", null: false
    t.bigint "product_id", null: false
    t.integer "quantity", default: 1, null: false
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id"], name: "index_service_record_products_on_product_id"
    t.index ["quantity"], name: "index_service_record_products_on_quantity"
    t.index ["service_record_id", "product_id"], name: "index_service_record_products_unique", unique: true
    t.index ["service_record_id"], name: "index_service_record_products_on_service_record_id"
    t.index ["unit_price"], name: "index_service_record_products_on_unit_price"
  end

  create_table "service_record_services", force: :cascade do |t|
    t.bigint "service_record_id", null: false
    t.bigint "service_id", null: false
    t.integer "quantity", default: 1, null: false
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quantity"], name: "index_service_record_services_on_quantity"
    t.index ["service_id"], name: "index_service_record_services_on_service_id"
    t.index ["service_record_id", "service_id"], name: "index_service_record_services_unique", unique: true
    t.index ["service_record_id"], name: "index_service_record_services_on_service_record_id"
    t.index ["unit_price"], name: "index_service_record_services_on_unit_price"
  end

  create_table "service_records", force: :cascade do |t|
    t.date "service_date"
    t.decimal "total_amount", default: "0.0"
    t.text "notes"
    t.integer "mileage"
    t.date "next_service_date"
    t.bigint "customer_id", null: false
    t.bigint "vehicle_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "appointment_id"
    t.index ["appointment_id"], name: "index_service_records_on_appointment_id", unique: true
    t.index ["customer_id"], name: "index_service_records_on_customer_id"
    t.index ["vehicle_id"], name: "index_service_records_on_vehicle_id"
  end

  create_table "service_reminders", force: :cascade do |t|
    t.bigint "service_record_id", null: false
    t.bigint "customer_id", null: false
    t.bigint "vehicle_id", null: false
    t.string "status", default: "pending", null: false
    t.string "channel", default: "whatsapp", null: false
    t.datetime "sent_at"
    t.text "error_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["customer_id"], name: "index_service_reminders_on_customer_id"
    t.index ["service_record_id"], name: "index_service_reminders_on_service_record_id"
    t.index ["vehicle_id", "created_at"], name: "index_service_reminders_on_vehicle_id_and_created_at"
    t.index ["vehicle_id"], name: "index_service_reminders_on_vehicle_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.text "description"
    t.decimal "base_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.vector "embedding", limit: 768
    t.index ["base_price"], name: "index_services_on_base_price"
    t.index ["name"], name: "index_services_on_name", unique: true
  end

  create_table "settings", force: :cascade do |t|
    t.string "lubricentro_name"
    t.string "phone"
    t.string "mobile"
    t.string "address"
    t.decimal "latitude", precision: 10, scale: 7
    t.decimal "longitude", precision: 10, scale: 7
    t.jsonb "opening_hours", default: {}
    t.string "cuit"
    t.string "owner_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.binary "payload", null: false
    t.datetime "created_at", null: false
    t.bigint "channel_hash", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "supplier_phones", force: :cascade do |t|
    t.string "phone", null: false
    t.string "company_name"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["phone"], name: "index_supplier_phones_on_phone", unique: true
  end

  create_table "suppliers", force: :cascade do |t|
    t.string "name", limit: 150, null: false
    t.string "cuit", limit: 20
    t.string "email", limit: 100
    t.string "phone", limit: 30
    t.string "address", limit: 200
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["cuit"], name: "index_suppliers_on_cuit", unique: true, where: "(cuit IS NOT NULL)"
    t.index ["name"], name: "index_suppliers_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "appointments", "customers"
  add_foreign_key "appointments", "vehicles"
  add_foreign_key "budget_items", "budgets"
  add_foreign_key "budgets", "customers"
  add_foreign_key "budgets", "vehicles"
  add_foreign_key "categories", "categories", column: "parent_id"
  add_foreign_key "conversations", "customers"
  add_foreign_key "messages", "conversations"
  add_foreign_key "oauth_access_grants", "oauth_applications", column: "application_id"
  add_foreign_key "oauth_access_tokens", "oauth_applications", column: "application_id"
  add_foreign_key "products", "categories"
  add_foreign_key "products", "suppliers"
  add_foreign_key "service_record_products", "products"
  add_foreign_key "service_record_products", "service_records"
  add_foreign_key "service_record_services", "service_records"
  add_foreign_key "service_record_services", "services"
  add_foreign_key "service_records", "appointments"
  add_foreign_key "service_records", "customers"
  add_foreign_key "service_records", "vehicles"
  add_foreign_key "service_reminders", "customers"
  add_foreign_key "service_reminders", "service_records"
  add_foreign_key "service_reminders", "vehicles"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "vehicles", "customers"
end
