# Database Cleaner configuration for RSpec
require 'database_cleaner/active_record'

RSpec.configure do |config|
  # Configuration for Database Cleaner
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end
