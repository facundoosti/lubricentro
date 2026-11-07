# == Schema Information
#
# Table name: customers
#
#  id         :bigint           not null, primary key
#  address    :text
#  email      :string(100)
#  name       :string(100)      not null
#  phone      :string(20)
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
  has_many :service_records, dependent: :destroy
  has_one_attached :avatar

  # Email vacío → NULL para no chocar con el índice único de customers.email
  normalizes :email, with: ->(email) { email.strip.downcase.presence }
  normalizes :phone, with: ->(phone) { phone.strip.presence }

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
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :by_email, ->(email) { where("email ILIKE ?", "%#{email}%") }
  scope :by_search, ->(term) {
    like = "%#{sanitize_sql_like(term.to_s)}%"
    digits = term.to_s.gsub(/\D/, "")
    # Solo se busca por teléfono si el término parece uno ("ABC123" no matchea teléfonos con 123)
    if term.to_s.match?(/\A[\d\s+\-().]+\z/) && digits.length >= 3
      where("name ILIKE :like OR email ILIKE :like OR regexp_replace(phone, '\\D', '', 'g') LIKE :digits",
            like: like, digits: "%#{digits}%")
    else
      where("name ILIKE :like OR email ILIKE :like", like: like)
    end
  }
  # Igualdad por los últimos 10 dígitos, para tolerar prefijos como +54 9
  scope :by_phone, ->(phone) {
    digits = phone.to_s.gsub(/\D/, "").last(10)
    next none if digits.blank?

    where("right(regexp_replace(phone, '\\D', '', 'g'), 10) = ?", digits)
  }

  # Métodos helper
  def display_name
    name.presence || "Cliente ##{id}"
  end

  def contact_info
    [ email, phone ].compact.join(" | ")
  end
end
