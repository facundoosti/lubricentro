# == Schema Information
#
# Table name: service_record_services
#
#  id                :bigint           not null, primary key
#  quantity          :integer          default(1), not null
#  unit_price        :decimal(10, 2)   not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  service_id        :bigint           not null
#  service_record_id :bigint           not null
#
# Indexes
#
#  index_service_record_services_on_quantity           (quantity)
#  index_service_record_services_on_service_id         (service_id)
#  index_service_record_services_on_service_record_id  (service_record_id)
#  index_service_record_services_on_unit_price         (unit_price)
#  index_service_record_services_unique                (service_record_id,service_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (service_record_id => service_records.id)
#
require 'rails_helper'

RSpec.describe ServiceRecordService, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
