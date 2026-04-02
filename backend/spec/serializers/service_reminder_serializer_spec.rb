require 'rails_helper'

RSpec.describe ServiceReminderSerializer, type: :serializer do
  let(:reminder) { create(:service_reminder, :sent) }

  subject(:result) { ServiceReminderSerializer.render_as_hash(reminder) }

  it 'includes core fields' do
    expect(result).to include(:id, :status, :channel, :error_message, :sent_at, :created_at)
  end

  it 'includes customer association' do
    expect(result[:customer]).to include(:id, :name)
  end

  it 'includes vehicle association' do
    expect(result[:vehicle]).to include(:id, :brand, :model)
  end

  it 'includes service_record info' do
    expect(result[:service_record]).to include(:id, :next_service_date, :service_date)
  end

  it 'formats sent_at as ISO8601' do
    expect(result[:sent_at]).to match(/\d{4}-\d{2}-\d{2}/)
  end

  it 'returns nil sent_at for pending reminder' do
    pending_reminder = create(:service_reminder)
    result = ServiceReminderSerializer.render_as_hash(pending_reminder)
    expect(result[:sent_at]).to be_nil
  end
end
