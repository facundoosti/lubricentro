require "roo"

class ProductImportService
  COLUMNS = {
    sku: 1,
    name: 2,
    description: 3,
    unit_price: 4,
    unit: 5,
    supplier_name: 6
  }.freeze

  def initialize(file)
    @file = file
    @imported = 0
    @errors = []
  end

  def call
    spreadsheet = open_spreadsheet
    process_rows(spreadsheet)
    { imported: @imported, errors: @errors }
  rescue Roo::Error, StandardError => e
    { imported: 0, errors: [ "Error al leer el archivo: #{e.message}" ] }
  end

  private

  def open_spreadsheet
    case File.extname(@file.original_filename).downcase
    when ".xlsx" then Roo::Excelx.new(@file.tempfile.path)
    when ".xls"  then Roo::Excel.new(@file.tempfile.path)
    else raise "Formato de archivo no soportado. Use .xlsx o .xls"
    end
  end

  def process_rows(spreadsheet)
    spreadsheet.each_with_index do |row, index|
      next if index == 0 # skip header

      row_number = index + 1
      process_row(row, row_number)
    end
  end

  def process_row(row, row_number)
    sku          = row[COLUMNS[:sku] - 1].to_s.strip.presence
    name         = row[COLUMNS[:name] - 1].to_s.strip
    description  = row[COLUMNS[:description] - 1].to_s.strip.presence
    unit_price   = parse_price(row[COLUMNS[:unit_price] - 1])
    unit         = row[COLUMNS[:unit] - 1].to_s.strip.presence
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
      supplier: supplier
    )
    product.sku = sku if sku.present?
    product.skip_embedding = true

    if product.save
      @imported += 1
    else
      @errors << { row: row_number, message: product.errors.full_messages.join(", ") }
    end
  rescue StandardError => e
    @errors << { row: row_number, message: "Error inesperado: #{e.message}" }
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
