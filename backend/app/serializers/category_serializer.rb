# == Schema Information
#
# Table name: categories
#
#  id          :bigint           not null, primary key
#  description :text
#  name        :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  parent_id   :bigint
#
# Indexes
#
#  index_categories_on_name       (name) UNIQUE
#  index_categories_on_parent_id  (parent_id)
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => categories.id)
#
class CategorySerializer < Blueprinter::Base
  identifier :id
  fields :name, :description, :parent_id
end
