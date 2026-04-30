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
class Category < ApplicationRecord
  belongs_to :parent, class_name: "Category", optional: true
  has_many :subcategories, class_name: "Category", foreign_key: :parent_id, dependent: :nullify
  has_many :products, dependent: :nullify

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  scope :roots, -> { where(parent_id: nil) }
  scope :by_name, ->(name) { where("name ILIKE ?", "%#{name}%") }
  scope :ordered, -> { order(:name) }
end
