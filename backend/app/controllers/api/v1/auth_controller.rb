class Api::V1::AuthController < ApplicationController
  skip_before_action :doorkeeper_authorize!, only: [ :register ]

  def register
    user = User.new(user_params)

    if user.save
      # Crear o obtener aplicación OAuth
      application = Doorkeeper::Application.first || create_default_application

      # Crear token JWT usando Doorkeeper
      access_token = Doorkeeper::AccessToken.create!(
        resource_owner_id: user.id,
        application_id: application.id,
        expires_in: Doorkeeper.configuration.access_token_expires_in,
        scopes: Doorkeeper.configuration.default_scopes
      )

      render_json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          token: access_token.token,
          token_type: "Bearer",
          expires_in: access_token.expires_in
        },
        message: "Usuario creado exitosamente"
      )
    else
      render_json(
        {},
        errors: user.errors.full_messages,
        message: "Error al crear usuario",
        status: :unprocessable_entity
      )
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end

  def create_default_application
    Doorkeeper::Application.create!(
      name: "Lubricentro Web App",
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      scopes: "read write"
    )
  end
end
