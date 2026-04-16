module ToolRegistry
  def self.all
    [
      ToolRegistry::ClassifyIntent,
      ToolRegistry::EscalateToHuman,
      ToolRegistry::CheckPrices,
      ToolRegistry::CheckAvailableSlots,
      ToolRegistry::ScheduleAppointment
    ]
  end

  def self.definitions
    all.map(&:definition)
  end

  def self.dispatch(tool_call, conversation)
    handler = all.find { |t| t.tool_name == tool_call[:name] }
    handler&.call(tool_call[:arguments], conversation)
  end
end
