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
class SettingSerializer < Blueprinter::Base
  identifier :id

  fields :lubricentro_name, :phone, :mobile, :address,
         :cuit, :owner_name, :opening_hours, :updated_at

  field :latitude do |setting|
    setting.latitude&.to_s
  end

  field :longitude do |setting|
    setting.longitude&.to_s
  end
end
