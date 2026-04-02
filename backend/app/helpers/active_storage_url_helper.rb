module ActiveStorageUrlHelper
  def self.url_for(attachment)
    return nil if attachment.nil?
    return nil if attachment.respond_to?(:attached?) && !attachment.attached?

    Rails.application.routes.url_helpers.rails_blob_url(attachment)
  end

  def self.urls_for(attachments)
    attachments.map { |a| url_for(a) }.compact
  end
end
