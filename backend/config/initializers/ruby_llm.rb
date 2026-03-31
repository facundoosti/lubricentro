# RubyLLM configuration for embeddings generation
# Using custom OpenAI-compatible endpoint with Qwen3-Embedding-8B model

require 'ruby_llm'

RubyLLM.configure do |config|
  # Configure OpenAI API with custom endpoint
  config.openai_api_key = ENV.fetch('OPENAI_API_KEY', 'not-needed')
  config.openai_api_base = ENV.fetch('OPENAI_API_BASE', 'http://192.168.0.5:1234/v1')
  
  # Set default embedding model
  config.default_embedding_model = 'text-embedding-qwen3-embedding-8b'
end
