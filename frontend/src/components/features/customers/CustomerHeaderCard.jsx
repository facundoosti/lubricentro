import { Edit, Phone, Mail, MapPin, MessageCircle, FileText } from 'lucide-react';
import { buildWhatsAppUrl } from '@utils/whatsapp';

const getInitials = (name = '') =>
  name.split(' ').map((word) => word.charAt(0)).join('').toUpperCase().slice(0, 2);

const contactButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-secondary hover:text-primary hover:border-primary/40 transition-colors';

const ContactRow = ({ icon: Icon, children }) => (
  <p className="flex items-center gap-2 text-sm text-on-surface min-w-0">
    <Icon className="w-4 h-4 shrink-0 text-secondary" />
    <span className="truncate">{children}</span>
  </p>
);

const Missing = ({ children }) => <span className="text-on-surface-variant">{children}</span>;

// Encabezado del perfil: identidad, datos de contacto, contacto rápido y acciones.
const CustomerHeaderCard = ({ customer, onEdit, onNewBudget }) => {
  const whatsappUrl = buildWhatsAppUrl(customer.phone);

  return (
    <section className="p-5 border border-outline-variant rounded-lg bg-surface-container lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start min-w-0">
          <div className="w-20 h-20 shrink-0 rounded-full border-2 border-primary/30 overflow-hidden bg-primary-container/20 flex items-center justify-center">
            {customer.avatar_url ? (
              <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl">{getInitials(customer.name)}</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-start min-w-0 w-full">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold text-on-surface">{customer.name}</h3>
              <p className="text-sm text-on-surface-variant">
                Cliente #{customer.id} · {customer.vehicles_count || 0} vehículos
              </p>
            </div>
            <div className="grid gap-1.5 w-full">
              <ContactRow icon={Phone}>{customer.phone || <Missing>Sin teléfono</Missing>}</ContactRow>
              <ContactRow icon={Mail}>{customer.email || <Missing>Sin email</Missing>}</ContactRow>
              <ContactRow icon={MapPin}>{customer.address || <Missing>Sin dirección</Missing>}</ContactRow>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 lg:items-end">
          <div className="flex items-center gap-2">
            {customer.phone && (
              <a href={`tel:${customer.phone}`} title="Llamar" aria-label="Llamar" className={contactButtonClass}>
                <Phone className="w-4 h-4" />
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                aria-label="WhatsApp"
                className={contactButtonClass}
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {customer.email && (
              <a href={`mailto:${customer.email}`} title="Enviar email" aria-label="Enviar email" className={contactButtonClass}>
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onNewBudget}
              className="flex flex-1 items-center justify-center gap-2 rounded bg-primary-container px-4 py-2.5 text-sm font-bold text-on-primary hover:brightness-110 transition-all sm:flex-none"
            >
              <FileText className="w-4 h-4" />
              Nuevo presupuesto
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-high px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors sm:flex-none"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerHeaderCard;
