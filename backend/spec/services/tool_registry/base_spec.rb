require 'rails_helper'

RSpec.describe ToolRegistry::Base do
  let(:conversation) { create(:conversation) }
  let(:arguments) { { query: "test" } }

  describe '.call' do
    it 'instantiates and calls the subclass' do
      subclass = Class.new(described_class) do
        def call = { reply: "ok" }
      end

      result = subclass.call(arguments, conversation)
      expect(result).to eq({ reply: "ok" })
    end
  end

  describe '.tool_name' do
    it 'returns the function name from definition' do
      subclass = Class.new(described_class) do
        DEFINITION = { type: "function", function: { name: "my_tool" } }.freeze
        def self.definition = DEFINITION
      end

      expect(subclass.tool_name).to eq("my_tool")
    end
  end

  describe '.definition' do
    it 'raises NotImplementedError on the base class' do
      expect { described_class.definition }.to raise_error(NotImplementedError)
    end
  end

  describe '#call' do
    it 'raises NotImplementedError on the base class' do
      instance = described_class.new(arguments, conversation)
      expect { instance.call }.to raise_error(NotImplementedError)
    end
  end

  describe '#broadcast_status_update' do
    it 'broadcasts to the inbox channel' do
      instance = described_class.new(arguments, conversation)
      expect(ActionCable.server).to receive(:broadcast).with("inbox", hash_including(conversation_id: conversation.id))
      instance.send(:broadcast_status_update)
    end
  end

  describe '#postgresql?' do
    it 'returns true when using PostgreSQL adapter' do
      instance = described_class.new(arguments, conversation)
      allow(ActiveRecord::Base.connection).to receive(:adapter_name).and_return("PostgreSQL")
      expect(instance.send(:postgresql?)).to be true
    end

    it 'returns false when using other adapters' do
      instance = described_class.new(arguments, conversation)
      allow(ActiveRecord::Base.connection).to receive(:adapter_name).and_return("SQLite")
      expect(instance.send(:postgresql?)).to be false
    end
  end
end
