class Api::V1::SettingsController < ApplicationController
  def show
    @setting = Setting.instance
    render_json(SettingSerializer.render_as_hash(@setting))
  end

  def update
    @setting = Setting.instance
    if @setting.update(setting_params)
      render_json(SettingSerializer.render_as_hash(@setting), message: "Configuración actualizada exitosamente")
    else
      render_json({}, message: "Error al actualizar la configuración", errors: @setting.errors.full_messages, status: :unprocessable_entity)
    end
  end

  private

  def setting_params
    params.require(:setting).permit(
      :lubricentro_name, :phone, :mobile, :address,
      :latitude, :longitude, :cuit, :owner_name,
      opening_hours: {}
    )
  end
end
