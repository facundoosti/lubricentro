module ToolRegistry
  class Base
    def self.call(arguments, conversation)
      new(arguments, conversation).call
    end

    def self.tool_name
      definition.dig(:function, :name)
    end

    def self.definition
      raise NotImplementedError, "#{name} must define .definition"
    end

    def initialize(arguments, conversation)
      @arguments    = arguments
      @conversation = conversation
    end

    def call
      raise NotImplementedError, "#{self.class.name} must implement #call"
    end

    private

    def broadcast_status_update
      ActionCable.server.broadcast("inbox", {
        conversation_id: @conversation.id,
        status:          @conversation.status
      })
    end

    def postgresql?
      ActiveRecord::Base.connection.adapter_name == "PostgreSQL"
    end
  end
end
