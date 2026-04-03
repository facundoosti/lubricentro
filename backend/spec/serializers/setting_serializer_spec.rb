# == Schema Information
#
# Table name: settings
#
#  id               :bigint           not null, primary key
#  address          :string
#  cuit             :string
#  latitude         :decimal(10, 7)
#  longitude        :decimal(10, 7)
#  lubricentro_name :string
#  mobile           :string
#  opening_hours    :jsonb
#  owner_name       :string
#  phone            :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
require 'rails_helper'

RSpec.describe SettingSerializer, type: :serializer do
  let(:setting) do
    Setting.instance.tap do |s|
      s.update!(
        lubricentro_name: "Lubricentro Test",
        phone: "011-1234-5678",
        latitude: -34.6037,
        longitude: -58.3816
      )
    end
  end

  subject(:result) { SettingSerializer.render_as_hash(setting) }

  it 'includes all fields' do
    expect(result).to include(
      :id, :lubricentro_name, :phone, :mobile, :address,
      :cuit, :owner_name, :opening_hours, :updated_at
    )
  end

  it 'returns latitude as string' do
    expect(result[:latitude]).to be_a(String)
  end

  it 'returns longitude as string' do
    expect(result[:longitude]).to be_a(String)
  end

  it 'returns nil latitude when not set' do
    setting.update!(latitude: nil)
    result = SettingSerializer.render_as_hash(setting)
    expect(result[:latitude]).to be_nil
  end
end
