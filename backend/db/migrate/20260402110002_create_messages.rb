class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.references :conversation, null: false, foreign_key: true
      t.string :direction, null: false   # inbound | outbound
      t.string :sender_type              # customer | bot | agent
      t.text :body, null: false
      t.string :whatsapp_message_id      # Meta ID for deduplication
      t.datetime :received_at

      t.timestamps
    end

    add_index :messages, :whatsapp_message_id, unique: true, where: "whatsapp_message_id IS NOT NULL"
  end
end
