class ImportChannel < ApplicationCable::Channel
  def subscribed
    stream_from "import_#{params[:job_id]}"
  end

  def unsubscribed
    stop_all_streams
  end
end
