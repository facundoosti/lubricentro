# == Schema Information
#
# Table name: product_imports
#
#  id            :bigint           not null, primary key
#  error_details :jsonb            not null
#  errors_count  :integer          default(0), not null
#  imported      :integer          default(0), not null
#  processed     :integer          default(0), not null
#  status        :string           default("queued"), not null
#  total         :integer          default(0), not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  job_id        :string           not null
#
# Indexes
#
#  index_product_imports_on_job_id  (job_id) UNIQUE
#
require 'rails_helper'

RSpec.describe ProductImport, type: :model do
  subject { described_class.new(job_id: "job-1", status: "queued") }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:job_id) }
    it { is_expected.to validate_uniqueness_of(:job_id) }
    it { is_expected.to validate_inclusion_of(:status).in_array(described_class::STATUSES) }
  end

  describe '#payload' do
    it 'uses the same shape as the Action Cable messages' do
      record = described_class.create!(job_id: "job-1", status: "complete", imported: 3, error_details: [ { "row" => 2, "message" => "x" } ], errors_count: 1)
      expect(record.payload).to include(type: "complete", job_id: "job-1", imported: 3, errors_count: 1, errors: [ { "row" => 2, "message" => "x" } ])
    end
  end

  describe 'stale imports' do
    it 'reports a queued/progress import without updates for too long as failed' do
      record = described_class.create!(job_id: "job-2", status: "progress", imported: 7)
      record.update_column(:updated_at, (described_class::STALE_AFTER + 1.minute).ago)
      expect(record.payload).to include(type: "failed", imported: 7)
      expect(record.payload[:errors].last).to include("message" => described_class::STALE_MESSAGE)
    end

    it 'keeps finished imports as they are' do
      record = described_class.create!(job_id: "job-3", status: "complete", imported: 7)
      record.update_column(:updated_at, 1.day.ago)
      expect(record.payload).to include(type: "complete")
    end
  end
end
