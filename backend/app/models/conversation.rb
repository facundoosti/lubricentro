# == Schema Information
#
# Table name: conversations
#
#  id              :bigint           not null, primary key
#  label           :string
#  last_message_at :datetime
#  status          :string           default("bot"), not null
#  whatsapp_phone  :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  customer_id     :bigint
#
# Indexes
#
#  index_conversations_on_customer_id     (customer_id)
#  index_conversations_on_status          (status)
#  index_conversations_on_whatsapp_phone  (whatsapp_phone) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => customers.id)
#
class Conversation < ApplicationRecord
  STATUSES = %w[bot needs_human supplier resolved].freeze

  belongs_to :customer, optional: true
  has_many :messages, dependent: :destroy

  validates :whatsapp_phone, presence: true, uniqueness: true
  validates :status, inclusion: { in: STATUSES }

  scope :by_status, ->(status) { where(status: status) if status.present? }
  scope :recent, -> { order(last_message_at: :desc) }
  scope :with_last_message, -> { includes(:messages) }

  def bot?       = status == "bot"
  def needs_human? = status == "needs_human"
  def supplier?  = status == "supplier"
  def resolved?  = status == "resolved"
end
