class Api::V1::AuthController < ApplicationController
  skip_before_action :doorkeeper_authorize!, only: [ :register, :login ]

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

  def login
    user = User.find_by(email: login_params[:email])

    if user&.authenticate(login_params[:password])
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
        message: "Login exitoso"
      )
    else
      render_json(
        {},
        errors: [ "Email o contraseña incorrectos" ],
        message: "Credenciales inválidas",
        status: :unauthorized
      )
    end
  end

  def verify
    # El token ya fue validado por doorkeeper_authorize!
    # Si llegamos aquí, el token es válido
    render_json(
      {
        user: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email
        }
      },
      message: "Token válido"
    )
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end

  def login_params
    params.require(:auth).permit(:email, :password)
  end

  def create_default_application
    Doorkeeper::Application.create!(
      name: "Lubricentro Web App",
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      scopes: "read write"
    )
  end
end
