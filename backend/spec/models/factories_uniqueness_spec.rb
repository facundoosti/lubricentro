require 'rails_helper'

# Columnas con índice único: la factory no puede depender solo de valores
# aleatorios (Faker/rand), porque se repiten y hacen fallar specs al azar.
# Se fuerza el peor caso (el generador devuelve siempre lo mismo) y las
# factories igual tienen que dar valores distintos.
RSpec.describe 'factories con valores únicos' do
  it 'service genera nombres distintos aunque Faker repita' do
    allow(Faker::Commerce).to receive(:product_name).and_return('Servicio igual')
    names = Array.new(3) { build(:service).name }
    expect(names.uniq.size).to eq(3)
  end

  it 'vehicle genera patentes distintas aunque Faker repita' do
    allow(Faker::Alphanumeric).to receive(:alphanumeric).and_return('abc123')
    plates = Array.new(3) { build(:vehicle).license_plate }
    expect(plates.uniq.size).to eq(3)
  end

  it 'supplier :with_contact genera CUIT distintos aunque rand repita' do
    cuits = Array.new(3) do
      srand(42)
      build(:supplier, :with_contact).cuit
    end
    expect(cuits.uniq.size).to eq(3)
  end
end
