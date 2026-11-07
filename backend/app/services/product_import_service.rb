require "roo"

class ProductImportService
  COLUMNS = {
    sku: 1,
    name: 2,
    description: 3,
    unit_price: 4,
    unit: 5,
    brand: 6,
    supplier_name: 7,
    stock: 8,
    iva: 9
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
    # fatal: el job lo publica como "failed" (las filas ya guardadas se informan igual)
    { imported: @imported, errors: @errors + [ { row: nil, message: "Error al leer el archivo: #{e.message}" } ], fatal: true }
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
    stock         = row[COLUMNS[:stock] - 1].to_s.strip.presence&.to_i
    iva_cell      = row[COLUMNS[:iva] - 1]
    iva_rate      = parse_iva(iva_cell)

    if name.blank?
      @errors << { row: row_number, message: "El nombre es requerido" }
      return
    end

    if unit_price.nil?
      @errors << { row: row_number, message: "El precio unitario es inválido para '#{name}'" }
      return
    end

    if iva_cell.to_s.strip.present? && iva_rate.nil?
      @errors << { row: row_number, message: "El IVA es inválido para '#{name}' (usá 21 o 10,5)" }
      return
    end

    supplier = find_or_create_supplier(supplier_name) if supplier_name.present?

    product = sku.present? ? Product.find_by(sku: sku) : nil
    product ||= Product.find_by("name ILIKE ?", name)
    product ||= Product.new

    # Las celdas opcionales vacías no pisan datos de productos existentes
    optional = { description: description, unit: unit, brand: brand, supplier: supplier, stock: stock, iva_rate: iva_rate }.compact
    product.assign_attributes(optional.merge(name: name, unit_price: unit_price))
    product.sku = sku if sku.present?

    if product.save
      @imported += 1
    else
      @errors << { row: row_number, message: product.errors.full_messages.join(", ") }
    end
  rescue StandardError => e
    @errors << { row: row_number, message: "Error inesperado: #{e.message}" }
  end

  PROGRESS_EVERY = 20

  def broadcast_progress(processed, total)
    return unless @job_id
    return unless processed == total || (processed % PROGRESS_EVERY).zero?

    ProductImportStatus.publish(@job_id, {
      type: "progress",
      processed: processed,
      total: total,
      imported: @imported,
      errors_count: @errors.size
    })
  rescue StandardError => e
    # El progreso es informativo: si falla, la importación sigue
    Rails.logger.warn("[ProductImportService] no se pudo publicar progreso de #{@job_id}: #{e.message}")
  end

  # Acepta números (celdas numéricas de Excel) y texto en formato argentino
  # ("$90.174,29", "2.227.470,71") o con punto decimal ("5000.50").
  def parse_price(value)
    return value.to_d if value.is_a?(Numeric)

    cleaned = value.to_s.gsub(/[^0-9.,]/, "")
    return nil unless cleaned.match?(/\d/)

    if cleaned.include?(",")
      cleaned = cleaned.delete(".").tr(",", ".")
    elsif cleaned.match?(/\A\d{1,3}(\.\d{3})+\z/)
      cleaned = cleaned.delete(".")
    end

    BigDecimal(cleaned)
  rescue ArgumentError
    nil
  end

  # Acepta 21, "21%", "10,5", "10.5", "10,5%" y celdas numéricas (0.21 / 0.105 si la
  # celda tiene formato de porcentaje). Devuelve nil si está vacía o es inválida.
  def parse_iva(value)
    return nil if value.to_s.strip.blank?

    rate = if value.is_a?(Numeric)
      value.to_d
    else
      cleaned = value.to_s.strip.delete("%").tr(",", ".").strip
      return nil unless cleaned.match?(/\A\d+(\.\d+)?\z/)

      BigDecimal(cleaned)
    end
    rate *= 100 if rate.positive? && rate < 1
    Product::IVA_RATES.find { |r| r == rate }
  end

  def find_or_create_supplier(name)
    Supplier.where("name ILIKE ?", name).first ||
      Supplier.create!(name: name)
  rescue ActiveRecord::RecordInvalid
    Supplier.where("name ILIKE ?", name).first
  end
end
