# == Schema Information
#
# Table name: installment_plans
#
#  id                   :bigint           not null, primary key
#  active               :boolean          default(TRUE), not null
#  installments         :integer          not null
#  name                 :string(50)       not null
#  position             :integer          default(0), not null
#  surcharge_percentage :decimal(5, 2)    default(0.0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_installment_plans_on_active_and_position  (active,position)
#
require 'rails_helper'

RSpec.describe InstallmentPlan, type: :model do
  describe 'validations' do
    subject { build(:installment_plan) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(50) }
    it { is_expected.to validate_numericality_of(:installments).only_integer.is_greater_than(1) }
    it { is_expected.to validate_numericality_of(:surcharge_percentage).is_greater_than_or_equal_to(0) }

    it { is_expected.to validate_numericality_of(:installments).is_less_than_or_equal_to(60) }
    it { is_expected.to validate_numericality_of(:surcharge_percentage).is_less_than(1000) }

    it 'acepta 2 y 60 cuotas; rechaza 1, 61 y no enteros' do
      [ 2, 60 ].each { |n| expect(build(:installment_plan, installments: n)).to be_valid }
      [ 1, 61, 2.5 ].each do |n|
        plan = build(:installment_plan, installments: n)
        expect(plan).not_to be_valid
        expect(plan.errors[:installments]).to be_present
      end
    end

    it 'acepta recargo 0 y 999,99; rechaza -0,01 y 1000' do
      [ 0, 999.99 ].each { |v| expect(build(:installment_plan, surcharge_percentage: v)).to be_valid }
      [ -0.01, 1000 ].each do |v|
        plan = build(:installment_plan, surcharge_percentage: v)
        expect(plan).not_to be_valid
        expect(plan.errors[:surcharge_percentage]).to be_present
      end
    end

    it 'arranca activo' do
      expect(described_class.new.active).to be true
    end
  end

  describe 'scopes' do
    it 'active.ordered devuelve los activos por posición' do
      b = create(:installment_plan, position: 2)
      a = create(:installment_plan, position: 1)
      create(:installment_plan, position: 0, active: false)
      expect(described_class.active.ordered).to eq([ a, b ])
    end
  end
end
