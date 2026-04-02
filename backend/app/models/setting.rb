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
class Setting < ApplicationRecord
  validates :lubricentro_name, length: { maximum: 150 }
  validates :cuit, length: { maximum: 20 }
  validates :owner_name, length: { maximum: 150 }
  validates :phone, length: { maximum: 30 }
  validates :mobile, length: { maximum: 30 }

  # Singleton — always use Setting.instance to read/write
  def self.instance
    first_or_create!
  end
end
