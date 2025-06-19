class ApplicationController < ActionController::API
  # Include Pagy backend functionality
  include Pagy::Backend

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
end
