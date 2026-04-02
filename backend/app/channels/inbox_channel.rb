class InboxChannel < ApplicationCable::Channel
  def subscribed
    stream_from "inbox"
  end

  def unsubscribed
    stop_all_streams
  end
end
