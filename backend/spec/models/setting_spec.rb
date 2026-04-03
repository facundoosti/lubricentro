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

RSpec.describe Setting, type: :model do
  describe 'validations' do
    subject(:setting) { Setting.instance }

    it { is_expected.to validate_length_of(:lubricentro_name).is_at_most(150) }
    it { is_expected.to validate_length_of(:cuit).is_at_most(20) }
    it { is_expected.to validate_length_of(:owner_name).is_at_most(150) }
    it { is_expected.to validate_length_of(:phone).is_at_most(30) }
    it { is_expected.to validate_length_of(:mobile).is_at_most(30) }
  end

  describe '.instance' do
    it 'returns the singleton setting record' do
      expect(Setting.instance).to be_a(Setting)
    end

    it 'always returns the same record' do
      s1 = Setting.instance
      s2 = Setting.instance
      expect(s1.id).to eq(s2.id)
    end

    it 'creates a record if none exists' do
      Setting.delete_all
      expect { Setting.instance }.to change(Setting, :count).by(1)
    end
  end
end
