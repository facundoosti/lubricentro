# == Schema Information
#
# Table name: customers
#
#  id         :integer          not null, primary key
#  name       :string(100)      not null
#  phone      :string(20)
#  email      :string(100)
#  address    :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_customers_on_email  (email) UNIQUE
#  index_customers_on_name   (name)
#

class Customer < ApplicationRecord
  # Relaciones
  has_many :vehicles, dependent: :destroy
  has_many :appointments, dependent: :destroy
  # has_many :service_records, dependent: :destroy

  # Validaciones (siguiendo BD constraints)
  validates :name, presence: true, length: { maximum: 100 }
  validates :phone, length: { maximum: 20 }, allow_blank: true
  validates :email,
    length: { maximum: 100 },
    uniqueness: { case_sensitive: false },
    format: { with: URI::MailTo::EMAIL_REGEXP },
    allow_blank: true
  validates :address, length: { maximum: 255 }, allow_blank: true

  # Scopes útiles
  scope :with_email, -> { where.not(email: [ nil, "" ]) }
  scope :by_name, ->(name) { where("name LIKE ?", "%#{name}%") }

  # Métodos helper
  def display_name
    name.presence || "Cliente ##{id}"
  end

  def contact_info
    [ email, phone ].compact.join(" | ")
  end
end
