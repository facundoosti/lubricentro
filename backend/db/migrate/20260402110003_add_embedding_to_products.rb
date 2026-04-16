class AddEmbeddingToProducts < ActiveRecord::Migration[8.0]
  def up
    return unless postgresql? && extension_enabled?("vector")

    add_column :products, :embedding, :vector, limit: ENV.fetch("AI_EMBEDDING_DIMENSION")
  end

  def down
    return unless postgresql? && column_exists?(:products, :embedding)

    remove_column :products, :embedding
  end

  private

  def postgresql?
    ActiveRecord::Base.connection.adapter_name == "PostgreSQL"
  end
end
