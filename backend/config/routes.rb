Rails.application.routes.draw do
  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      resources :customers do
        # Nested routes for customer's vehicles
        resources :vehicles, only: [ :index ]
        resources :appointments, only: [ :index ]
      end

      # Main resource routes
      resources :vehicles
      # resources :services
      # resources :products
      # resources :appointments
      # resources :service_records
      # resources :reports, only: [:index]
    end
  end
end
