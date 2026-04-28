RSpec.configure do |config|
  config.before(:each) do
    allow(EmbeddingService).to receive(:generate).and_return(nil)
    allow(GenerateEmbeddingJob).to receive(:perform_later)
  end
end
