class CreateConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :conversations do |t|
      t.references :customer, foreign_key: true, null: true
      t.string :whatsapp_phone, null: false
      t.string :status, null: false, default: "bot"
      t.string :label
      t.datetime :last_message_at

      t.timestamps
    end

    add_index :conversations, :whatsapp_phone, unique: true
    add_index :conversations, :status
  end
end
