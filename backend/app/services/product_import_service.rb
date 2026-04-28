require "roo"

class ProductImportService
  COLUMNS = {
    sku: 1,
    name: 2,
    description: 3,
    unit_price: 4,
    unit: 5,
    brand: 6,
    supplier_name: 7
  }.freeze

  def initialize(file_path, original_filename, job_id = nil)
    @file_path = file_path
    @original_filename = original_filename
    @job_id = job_id
    @imported = 0
    @errors = []
  end

  def call
    spreadsheet = open_spreadsheet
    total = [ spreadsheet.last_row.to_i - 1, 0 ].max
    process_rows(spreadsheet, total)
    { imported: @imported, errors: @errors }
  rescue Roo::Error, StandardError => e
    { imported: 0, errors: [ "Error al leer el archivo: #{e.message}" ] }
  end

  private

  def open_spreadsheet
    case File.extname(@original_filename).downcase
    when ".xlsx" then Roo::Excelx.new(@file_path)
    when ".xls"  then Roo::Excel.new(@file_path)
    else raise "Formato de archivo no soportado. Use .xlsx o .xls"
    end
  end

  def process_rows(spreadsheet, total)
    spreadsheet.each_with_index do |row, index|
      next if index == 0

      row_number = index + 1
      process_row(row, row_number)
      broadcast_progress(index, total)
    end
  end

  def process_row(row, row_number)
    sku           = row[COLUMNS[:sku] - 1].to_s.strip.presence
    name          = row[COLUMNS[:name] - 1].to_s.strip
    description   = row[COLUMNS[:description] - 1].to_s.strip.presence
    unit_price    = parse_price(row[COLUMNS[:unit_price] - 1])
    unit          = row[COLUMNS[:unit] - 1].to_s.strip.presence
    brand         = row[COLUMNS[:brand] - 1].to_s.strip.presence
    supplier_name = row[COLUMNS[:supplier_name] - 1].to_s.strip.presence

    if name.blank?
      @errors << { row: row_number, message: "El nombre es requerido" }
      return
    end

    if unit_price.nil?
      @errors << { row: row_number, message: "El precio unitario es inválido para '#{name}'" }
      return
    end

    supplier = find_or_create_supplier(supplier_name) if supplier_name.present?

    product = sku.present? ? Product.find_by(sku: sku) : nil
    product ||= Product.find_by("name ILIKE ?", name)
    product ||= Product.new

    product.assign_attributes(
      name: name,
      description: description,
      unit_price: unit_price,
      unit: unit,
      brand: brand,
      supplier: supplier
    )
    product.sku = sku if sku.present?

    if product.save
      @imported += 1
    else
      @errors << { row: row_number, message: product.errors.full_messages.join(", ") }
    end
  rescue StandardError => e
    @errors << { row: row_number, message: "Error inesperado: #{e.message}" }
  end

  def broadcast_progress(processed, total)
    return unless @job_id

    ActionCable.server.broadcast("import_#{@job_id}", {
      type: "progress",
      processed: processed,
      total: total,
      imported: @imported,
      errors_count: @errors.size
    })
  end

  def parse_price(value)
    return nil if value.nil?
    cleaned = value.to_s.gsub(/[^0-9.,]/, "").gsub(",", ".")
    price = cleaned.to_f
    price >= 0 ? price : nil
  rescue
    nil
  end

  def find_or_create_supplier(name)
    Supplier.where("name ILIKE ?", name).first ||
      Supplier.create!(name: name)
  rescue ActiveRecord::RecordInvalid
    Supplier.where("name ILIKE ?", name).first
  end
end
