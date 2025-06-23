Rails.application.routes.draw do
  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Dashboard route
      get "dashboard/stats", to: "dashboard#stats"

      resources :customers do
        # Nested routes for customer's vehicles
        resources :vehicles, only: [ :index ]
        resources :appointments, only: [ :index ]
        resources :service_records, only: [ :index ]
      end

      # Main resource routes
      resources :vehicles do
        resources :appointments, only: [ :index ]
        resources :service_records, only: [ :index ]
      end

      resources :services
      resources :products
      resources :appointments do
        collection do
          get :upcoming
        end
        member do
          patch :confirm
          patch :complete
          patch :cancel
        end
      end

      resources :service_records do
        collection do
          get :overdue
          get :upcoming
          get :statistics
        end
      end

      # resources :reports, only: [:index]
    end
  end
end
