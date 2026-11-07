require 'rails_helper'
require 'rake'

RSpec.describe 'customers:normalize_blank_emails' do
  subject(:run_task) do
    Rake::Task['customers:normalize_blank_emails'].reenable
    expect { Rake::Task['customers:normalize_blank_emails'].invoke }.to output(/normalizados: \d+/).to_stdout
  end

  before(:all) { Rails.application.load_tasks unless Rake::Task.task_defined?('customers:normalize_blank_emails') }

  let!(:blank_email) { create(:customer).tap { |c| c.update_column(:email, '') } }
  let!(:spaces_email) { create(:customer).tap { |c| c.update_column(:email, '   ') } }
  let!(:with_email) { create(:customer, email: 'keep@example.com') }

  it 'pasa a NULL los emails vacíos' do
    run_task
    expect(blank_email.reload.email).to be_nil
    expect(spaces_email.reload.email).to be_nil
  end

  it 'no toca los emails con valor' do
    run_task
    expect(with_email.reload.email).to eq('keep@example.com')
  end

  it 'es idempotente' do
    run_task
    run_task
    expect(Customer.where(email: nil)).to contain_exactly(blank_email, spaces_email)
  end
end
