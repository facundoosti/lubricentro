class EnablePgvector < ActiveRecord::Migration[8.0]
  def up
    return unless postgresql?

    begin
      enable_extension "vector"
    rescue ActiveRecord::StatementInvalid => e
      raise unless e.message.include?("not available")

      say "WARNING: pgvector extension is not installed on this PostgreSQL server. " \
          "RAG/semantic search will be disabled. Install pgvector and re-run migrations to enable it."
    end
  end

  def down
    return unless postgresql?

    disable_extension "vector" if extension_enabled?("vector")
  end

  private

  def postgresql?
    ActiveRecord::Base.connection.adapter_name == "PostgreSQL"
  end
end
