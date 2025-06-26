# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  name            :string           not null
#  email           :string           not null
#  password_digest :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_users_on_email  (email) UNIQUE
#

class User < ApplicationRecord
  has_secure_password

  # Validaciones
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }

  # Doorkeeper associations
  has_many :access_grants, class_name: "Doorkeeper::AccessGrant",
                          foreign_key: :resource_owner_id,
                          dependent: :delete_all
  has_many :access_tokens, class_name: "Doorkeeper::AccessToken",
                          foreign_key: :resource_owner_id,
                          dependent: :delete_all
end
