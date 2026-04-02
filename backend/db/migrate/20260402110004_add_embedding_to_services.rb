class AddEmbeddingToServices < ActiveRecord::Migration[8.0]
  def up
    return unless postgresql? && extension_enabled?("vector")

    add_column :services, :embedding, :vector, limit: 1536
  end

  def down
    return unless postgresql? && column_exists?(:services, :embedding)

    remove_column :services, :embedding
  end

  private

  def postgresql?
    ActiveRecord::Base.connection.adapter_name == "PostgreSQL"
  end
end
