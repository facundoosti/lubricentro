class ApplicationController < ActionController::API
  # Include Pagy backend functionality
  include Pagy::Backend

  # Doorkeeper authentication
  before_action :doorkeeper_authorize!

  private

  # Custom pagy metadata for API responses
  def pagy_metadata(pagy)
    {
      current_page: pagy.page,
      per_page: pagy.items,
      total_count: pagy.count,
      total_pages: pagy.pages,
      prev_page: pagy.prev,
      next_page: pagy.next,
      first_page: 1,
      last_page: pagy.pages
    }
  end

  # Helper method to safely parse per_page parameter with max_items limit
  def safe_per_page(per_page_param)
    per_page = per_page_param&.to_i || Pagy::DEFAULT[:items]
    [ per_page, Pagy::DEFAULT[:max_items] ].min
  end

  def render_json(data = {}, message: nil, errors: nil, status: :ok)
    # Extract errors from data if present (fallback to parameter)
    errors ||= data.delete(:errors) if data.is_a?(Hash) && data.key?(:errors)

    # Add pagination to data if available
    if defined?(@pagy) && @pagy
      data = data.merge(pagination: pagy_metadata(@pagy)) if data.is_a?(Hash)
    end

    response_body = {
      success: status.in?(%i[created ok])
    }

    # Only add data if it's not empty
    response_body[:data] = data unless data.empty?

    # Add message at root level
    response_body[:message] = message if message.present?

    # Add errors at root level
    response_body[:errors] = errors if errors.present?

    render json: response_body, status: status
  end

  # Current user from Doorkeeper
  def current_user
    @current_user ||= User.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
  end
end
