# == Schema Information
#
# Table name: users
#
#  id              :bigint           not null, primary key
#  email           :string           not null
#  name            :string           not null
#  password_digest :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_users_on_email  (email) UNIQUE
#

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }

    it { should validate_presence_of(:name) }

    it 'validates email format' do
      user = build(:user, email: 'not-an-email')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to be_present
    end

    it 'requires password of at least 6 characters on creation' do
      user = build(:user, password: '12345', password_confirmation: '12345')
      expect(user).not_to be_valid
      expect(user.errors[:password]).to be_present
    end

    it 'is valid with password of 6+ characters' do
      user = build(:user, password: '123456', password_confirmation: '123456')
      expect(user).to be_valid
    end
  end

  describe 'has_secure_password' do
    it 'authenticates with correct password' do
      user = create(:user, password: 'password123')
      expect(user.authenticate('password123')).to eq(user)
    end

    it 'does not authenticate with wrong password' do
      user = create(:user, password: 'password123')
      expect(user.authenticate('wrong')).to be_falsy
    end
  end

  describe 'factory' do
    it 'has a valid default factory' do
      expect(build(:user)).to be_valid
    end

    it 'has a valid :with_strong_password trait' do
      expect(build(:user, :with_strong_password)).to be_valid
    end

    it 'has a valid :admin trait' do
      expect(build(:user, :admin)).to be_valid
    end
  end
end
