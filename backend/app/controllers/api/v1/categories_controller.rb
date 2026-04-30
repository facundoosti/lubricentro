class Api::V1::CategoriesController < ApplicationController
  def index
    @categories = Category.all
    @categories = @categories.by_name(params[:search]) if params[:search].present?
    @categories = @categories.ordered

    render_json({ categories: CategorySerializer.render_as_hash(@categories) })
  end
end
