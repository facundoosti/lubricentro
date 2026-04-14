module ToolRegistry
  def self.all
    [
      ToolRegistry::ClasificarIntencion,
      ToolRegistry::DerivarAHumano,
      ToolRegistry::ConsultarPrecios,
      ToolRegistry::ConsultarTurnosDisponibles,
      ToolRegistry::AgendarTurno
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
