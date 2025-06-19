# Pagy initializer file (8.0.0)
# See https://ddnexus.github.io/pagy/how-to#configure-pagy for more options

# Default configuration
Pagy::DEFAULT[:size] = [ 1, 4, 4, 1 ]  # Navigation bar size
Pagy::DEFAULT[:page_param] = :page     # Page parameter name
Pagy::DEFAULT[:items] = 20             # Items per page
Pagy::DEFAULT[:max_items] = 100        # Maximum items per page

# Enable overflow handling
Pagy::DEFAULT[:overflow] = :last_page  # Redirect to last page if page is out of range

# API-friendly configuration
require "pagy/extras/metadata"
require "pagy/extras/overflow"
