Rails.application.routes.draw do
  devise_for :users
  use_doorkeeper
  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # WhatsApp webhook — no auth required
  namespace :webhooks do
    get  "whatsapp", to: "whatsapp#verify"
    post "whatsapp", to: "whatsapp#receive"
  end

  # ActionCable
  mount ActionCable.server => "/cable"

  # API routes
  namespace :api do
    namespace :v1 do
      # Auth routes
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      get "auth/verify", to: "auth#verify"

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

      resources :budgets

      resource :setting, only: [ :show, :update ]

      resources :conversations, only: [ :index, :show ] do
        member do
          patch :resolve
          patch :assign_human
        end
        resources :messages, only: [ :create ]
      end

      resources :service_records do
        collection do
          get :overdue
          get :upcoming
          get :statistics
        end
      end

      resources :service_reminders, only: [ :index ] do
        collection do
          get :statistics
        end
      end

      # resources :reports, only: [:index]
    end
  end
end
