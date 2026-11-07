namespace :customers do
  desc "Pasa a NULL los emails vacíos de clientes (idempotente)"
  task normalize_blank_emails: :environment do
    count = Customer.where("TRIM(email) = ''").update_all(email: nil, updated_at: Time.current)
    puts "Clientes con email vacío normalizados: #{count}"
  end
end
