require "rails_helper"
require Rails.root.join("db/migrate/20261111130001_migrate_service_record_items_data")
require Rails.root.join("db/migrate/20261111130002_drop_service_record_products_and_services")

# Recrea las tablas viejas (down del drop) dentro de la transacción del spec, carga filas
# y corre la migración de datos. El DDL de Postgres es transaccional: todo se revierte al final.
RSpec.describe MigrateServiceRecordItemsData do
  let(:connection) { ActiveRecord::Base.connection }
  let(:customer) { create(:customer) }
  let(:vehicle) { create(:vehicle, customer: customer) }
  let(:record) { create(:service_record, customer: customer, vehicle: vehicle) }
  let(:service) { create(:service, name: "Cambio de aceite") }
  let(:product) { create(:product, name: "Filtro") }

  def migrate(migration, direction)
    ActiveRecord::Migration.suppress_messages { migration.new.migrate(direction) }
  end

  def insert_old(table, fk, id, quantity, unit_price)
    connection.execute(<<~SQL)
      INSERT INTO #{table} (service_record_id, #{fk}, quantity, unit_price, created_at, updated_at)
      VALUES (#{record.id}, #{id}, #{quantity}, #{unit_price}, NOW(), NOW())
    SQL
  end

  def table_exists?(name)
    connection.table_exists?(name)
  end

  before do
    migrate(DropServiceRecordProductsAndServices, :down)
  end

  context "con varios servicios y productos" do
    let(:services) { [ create(:service, name: "Alineación"), create(:service, name: "Balanceo") ] }
    let(:products) { [ create(:product, name: "Aceite"), create(:product, name: "Filtro de aire") ] }

    before do
      # Intercalados a propósito: el orden final debe ser servicios primero, cada grupo por id de origen.
      insert_old("service_record_products", "product_id", products[0].id, 1, 100)
      insert_old("service_record_services", "service_id", services[0].id, 1, 200)
      insert_old("service_record_products", "product_id", products[1].id, 1, 300)
      insert_old("service_record_services", "service_id", services[1].id, 1, 400)
      migrate(described_class, :up)
    end

    it "numera las posiciones 0..3 sin huecos, servicios primero" do
      items = record.reload.items.to_a
      expect(items.map { |i| [ i.position, i.description ] }).to eq([
        [ 0, "Alineación" ], [ 1, "Balanceo" ], [ 2, "Aceite" ], [ 3, "Filtro de aire" ]
      ])
    end
  end

  context "con un nombre de producto de más de 500 caracteres" do
    before do
      # El límite actual de products.name es 500: se amplía solo dentro de la transacción del spec.
      connection.change_column :products, :name, :string, limit: 600
      connection.execute("UPDATE products SET name = '#{"N" * 550}' WHERE id = #{product.id}")
      insert_old("service_record_products", "product_id", product.id, 1, 100)
      migrate(described_class, :up)
    end

    it "recorta la descripción a 500 caracteres" do
      expect(record.reload.items.first.description).to eq("N" * 500)
    end
  end

  describe "guard del drop de las tablas viejas" do
    before { insert_old("service_record_services", "service_id", service.id, 1, 8_000) }

    it "aborta el up sin borrar las tablas si faltan ítems" do
      expect { migrate(DropServiceRecordProductsAndServices, :up) }
        .to raise_error(ActiveRecord::MigrationError, /no se borran/)
      expect(table_exists?("service_record_services")).to be(true)
      expect(table_exists?("service_record_products")).to be(true)
    end

    it "borra las tablas cuando todos los ítems se copiaron" do
      migrate(described_class, :up)
      migrate(DropServiceRecordProductsAndServices, :up)
      expect(table_exists?("service_record_services")).to be(false)
      expect(table_exists?("service_record_products")).to be(false)
    end
  end

  context "con un servicio y un producto" do
    before do
      record.update_column(:total_amount, 14_000)
      # El producto se inserta antes que el servicio: el orden final igual debe ser servicios primero.
      insert_old("service_record_products", "product_id", product.id, 2, 3_000)
      insert_old("service_record_services", "service_id", service.id, 1, 8_000)
      migrate(described_class, :up)
    end

    it "copia cada fila como ítem sin IVA, servicios primero" do
      items = record.reload.items.to_a
      expect(items.map { |i| [ i.position, i.description, i.quantity, i.unit_price, i.iva_rate, i.total ] }).to eq([
        [ 0, "Cambio de aceite", 1, 8_000, nil, 8_000 ],
        [ 1, "Filtro", 2, 3_000, nil, 6_000 ]
      ])
      expect(items.map { |i| [ i.service_id, i.product_id ] }).to eq([ [ service.id, nil ], [ nil, product.id ] ])
    end

    it "no cambia el total_amount de la atención, ni al volver a guardarla" do
      expect(record.reload.total_amount).to eq(14_000)
      record.save!
      expect(record.reload.total_amount).to eq(14_000)
    end

    it "el down reagrupa por catálogo en las tablas viejas" do
      create(:service_record_item, service_record: record, product: product, description: "Filtro", quantity: 1, unit_price: 6_000)
      create(:service_record_item, service_record: record, description: "Texto libre", quantity: 1, unit_price: 100)
      migrate(described_class, :down)

      products = connection.select_rows("SELECT product_id, quantity, unit_price FROM service_record_products")
      services = connection.select_rows("SELECT service_id, quantity, unit_price FROM service_record_services")
      expect(products).to eq([ [ product.id, 3, BigDecimal("4000") ] ])
      expect(services).to eq([ [ service.id, 1, BigDecimal("8000") ] ])
      expect(ServiceRecordItem.count).to eq(0)
    end
  end
end
