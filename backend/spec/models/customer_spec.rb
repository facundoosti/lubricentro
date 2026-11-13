# == Schema Information
#
# Table name: customers
#
#  id           :bigint           not null, primary key
#  address      :text
#  cuit         :string(13)
#  email        :string(100)
#  invoice_type :string(2)
#  name         :string(100)      not null
#  phone        :string(20)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_customers_on_email  (email) UNIQUE
#  index_customers_on_name   (name)
#
require 'rails_helper'

RSpec.describe Customer, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_length_of(:phone).is_at_most(20) }
    it { is_expected.to validate_length_of(:email).is_at_most(100) }

    it 'validates email uniqueness case-insensitively' do
      create(:customer, email: 'taken@example.com')
      duplicate = build(:customer, email: 'TAKEN@example.com')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to be_present
    end

    it 'validates email format when present' do
      customer = build(:customer, email: 'not-an-email')
      expect(customer).not_to be_valid
      expect(customer.errors[:email]).to be_present
    end

    it 'allows blank email' do
      customer = build(:customer, email: nil)
      expect(customer).to be_valid
    end
  end

  describe 'normalización' do
    it 'guarda el email vacío como nil' do
      expect(build(:customer, email: '   ').email).to be_nil
    end

    it 'guarda el email en minúsculas y sin espacios' do
      expect(build(:customer, email: ' Juan@Example.COM ').email).to eq('juan@example.com')
    end

    it 'quita los espacios del teléfono' do
      expect(build(:customer, phone: '  11 5555-1234 ').phone).to eq('11 5555-1234')
    end

    it 'permite dos clientes sin email' do
      create(:customer, email: '')
      second = create(:customer, email: '')
      expect(second).to be_persisted
      expect(Customer.where(email: nil).count).to eq(2)
    end
  end

  describe 'associations' do
    it { is_expected.to have_many(:vehicles).dependent(:destroy) }
    it { is_expected.to have_many(:appointments).dependent(:destroy) }
    it { is_expected.to have_many(:service_records).dependent(:destroy) }
  end

  describe '#display_name' do
    context 'when customer has a name' do
      let(:customer) { build(:customer, name: 'Juan Perez') }

      it 'returns the name' do
        expect(customer.display_name).to eq('Juan Perez')
      end
    end

    context 'when name is blank' do
      let(:customer) { Customer.new(id: 42) }

      it 'returns fallback with id' do
        expect(customer.display_name).to eq('Cliente #42')
      end
    end
  end

  describe '#contact_info' do
    context 'when both email and phone are present' do
      let(:customer) { build(:customer, email: 'test@example.com', phone: '1122334455') }

      it 'returns both joined by pipe' do
        expect(customer.contact_info).to eq('test@example.com | 1122334455')
      end
    end

    context 'when only email is present' do
      let(:customer) { build(:customer, email: 'test@example.com', phone: nil) }

      it 'returns only email' do
        expect(customer.contact_info).to eq('test@example.com')
      end
    end

    context 'when neither is present' do
      let(:customer) { build(:customer, email: nil, phone: nil) }

      it 'returns empty string' do
        expect(customer.contact_info).to eq('')
      end
    end
  end

  describe 'scopes' do
    let!(:customer_with_email) { create(:customer, email: 'with@email.com') }
    let!(:customer_without_email) { create(:customer, email: nil) }

    describe '.with_email' do
      it 'returns only customers with email' do
        expect(Customer.with_email).to include(customer_with_email)
        expect(Customer.with_email).not_to include(customer_without_email)
      end
    end

    describe '.by_name' do
      let!(:carlos) { create(:customer, name: 'Carlos Lopez') }

      it 'filters by name case-insensitively' do
        expect(Customer.by_name('carlos')).to include(carlos)
        expect(Customer.by_name('LOPEZ')).to include(carlos)
      end
    end

    describe '.by_email' do
      it 'filters by email' do
        expect(Customer.by_email('with@email')).to include(customer_with_email)
      end
    end

    describe '.by_search' do
      let!(:maria) { create(:customer, name: 'Maria Lopez', email: 'maria@test.com') }

      it 'matches by name' do
        expect(Customer.by_search('Maria')).to include(maria)
      end

      it 'matches by email' do
        expect(Customer.by_search('maria@test')).to include(maria)
      end

      it 'matches by phone comparing only digits' do
        juan = create(:customer, name: 'Juan Perez', phone: '11 5555-1234')
        expect(Customer.by_search('1155551234')).to include(juan)
        expect(Customer.by_search('5555-12')).to include(juan)
      end

      it 'does not match phones when the term is not phone-like' do
        juan = create(:customer, name: 'Juan Perez', email: 'juan@test.com', phone: '11 5555-1234')
        expect(Customer.by_search('ABC123')).not_to include(juan)
      end
    end

    describe '.by_phone' do
      let!(:juan) { create(:customer, phone: '1155551234') }
      let!(:other) { create(:customer, phone: '1155559999') }

      it 'matches by the last 10 digits' do
        expect(Customer.by_phone('+54 9 11 5555-1234')).to contain_exactly(juan)
      end

      it 'returns nothing for a blank phone' do
        expect(Customer.by_phone('--')).to be_empty
      end
    end
  end

  describe 'datos fiscales' do
    it 'normaliza un CUIT de 11 dígitos sin guiones' do
      expect(build(:customer, cuit: '20284561234').cuit).to eq('20-28456123-4')
    end

    it 'acepta un CUIT ya formateado' do
      expect(build(:customer, cuit: '20-28456123-4')).to be_valid
    end

    it 'rechaza un CUIT inválido' do
      customer = build(:customer, cuit: '123')
      expect(customer).not_to be_valid
      expect(customer.errors[:cuit]).to be_present
    end

    it 'guarda un CUIT vacío como nil' do
      expect(build(:customer, cuit: '  ').cuit).to be_nil
    end

    it 'acepta los tipos de factura A, B, C y CF' do
      %w[A B C CF].each { |t| expect(build(:customer, invoice_type: t)).to be_valid }
    end

    it 'normaliza el tipo de factura a mayúsculas' do
      expect(build(:customer, invoice_type: 'b').invoice_type).to eq('B')
    end

    it 'rechaza un tipo de factura inválido' do
      customer = build(:customer, invoice_type: 'Z')
      expect(customer).not_to be_valid
      expect(customer.errors[:invoice_type]).to be_present
    end
  end
end
