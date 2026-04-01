class RemoveCubeExtension < ActiveRecord::Migration[8.0]
  def up
    disable_extension "cube"
  end

  def down
    enable_extension "cube"
  end
end
