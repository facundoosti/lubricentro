require 'rails_helper'

RSpec.describe 'Zona horaria de la aplicación' do
  it 'usa la hora de Argentina' do
    expect(Time.zone.name).to eq("America/Argentina/Buenos_Aires")
  end

  it 'sigue guardando los datetime en UTC' do
    expect(ActiveRecord.default_timezone).to eq(:utc)
  end
end
