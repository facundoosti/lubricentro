require 'rails_helper'

RSpec.describe WhatsAppReminderJob, type: :job do
  let(:customer)       { create(:customer, phone: "+5491112345678", name: "Ana García") }
  let(:vehicle)        { create(:vehicle, :toyota, customer: customer) }
  let(:service_record) { create(:service_record, customer: customer, vehicle: vehicle) }

  before do
    allow(WhatsAppService).to receive(:send_reminder_template)
  end

  describe "#perform" do
    context "envío exitoso" do
      it "crea un ServiceReminder con status pending al inicio" do
        allow(WhatsAppService).to receive(:send_reminder_template) do
          @captured_reminder = ServiceReminder.last
        end

        described_class.perform_now(service_record.id)
        expect(@captured_reminder&.status).to eq("pending")
      end

      it "crea un ServiceReminder vinculado al service_record, customer y vehicle" do
        described_class.perform_now(service_record.id)
        reminder = ServiceReminder.last
        expect(reminder.service_record).to eq(service_record)
        expect(reminder.customer).to eq(customer)
        expect(reminder.vehicle).to eq(vehicle)
      end

      it "llama a WhatsAppService.send_reminder_template con los datos del cliente" do
        expect(WhatsAppService).to receive(:send_reminder_template).with(
          phone:    customer.phone,
          name:     customer.name,
          vehicle:  "#{vehicle.brand} #{vehicle.model}",
          due_date: service_record.next_service_date.strftime("%d/%m/%Y")
        )
        described_class.perform_now(service_record.id)
      end

      it "actualiza el ServiceReminder a status sent" do
        described_class.perform_now(service_record.id)
        reminder = ServiceReminder.last
        expect(reminder.status).to eq("sent")
        expect(reminder.sent_at).to be_present
      end
    end

    context "error al enviar por WhatsApp" do
      # Call `perform` directly to bypass ActiveJob's retry_on error swallowing.
      # `retry_on StandardError` catches the exception in perform_now and reschedules,
      # so we test the business logic (rescue block) via the raw perform method.
      def run_job
        described_class.new.perform(service_record.id)
      end

      before do
        allow(WhatsAppService).to receive(:send_reminder_template)
          .and_raise(RuntimeError, "WhatsApp API error: template not found")
      end

      it "actualiza el ServiceReminder a status failed" do
        expect { run_job }.to raise_error(RuntimeError)
        expect(ServiceReminder.last.status).to eq("failed")
      end

      it "guarda el mensaje de error en error_message" do
        expect { run_job }.to raise_error(RuntimeError)
        expect(ServiceReminder.last.error_message).to include("WhatsApp API error")
      end

      it "re-lanza el error para que Solid Queue haga retry" do
        expect { run_job }.to raise_error(RuntimeError, /WhatsApp API error/)
      end
    end
  end
end
