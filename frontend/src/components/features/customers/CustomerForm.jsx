import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import ImageUpload from '@ui/ImageUpload';
import { useCustomersByPhone } from '@services/customersService';
import { inputClass, labelClass } from '@utils/formStyles';

const EMPTY_CUSTOMER = { name: '', phone: '', email: '', address: '' };

const DuplicatePhoneWarning = ({ customer }) => (
  <p role="status" className="mt-1 flex items-start gap-1.5 text-xs text-on-surface-variant">
    <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0 text-error" />
    <span>
      Ya existe <strong className="text-on-surface">{customer.name}</strong> con este teléfono ·{' '}
      <Link to={`/customers/${customer.id}`} className="text-primary font-medium hover:underline">
        Ver perfil
      </Link>
    </span>
  </p>
);

const CustomerForm = ({ onSubmit, initialData = null, formId = 'customer-form' }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  // Se consulta al salir del campo, no mientras se escribe
  const [phoneToCheck, setPhoneToCheck] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: Object.fromEntries(
      Object.keys(EMPTY_CUSTOMER).map((key) => [key, initialData?.[key] ?? '']),
    ),
  });

  const { data: samePhone = [] } = useCustomersByPhone(phoneToCheck);
  const duplicate = samePhone.find((c) => c.id !== initialData?.id);

  const handleFormSubmit = (data) => {
    const payload = { ...data };
    if (avatarFile) payload.avatar = avatarFile;
    onSubmit(payload);
  };

  const phoneField = register('phone', {
    required: 'El teléfono es requerido',
    pattern: { value: /^[+]?[0-9\s\-()]+$/, message: 'Ingresá un teléfono válido' },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>Nombre completo *</label>
          <input
            {...register('name', {
              required: 'El nombre es requerido',
              minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
            })}
            type="text"
            id="name"
            autoComplete="off"
            className={inputClass(!!errors.name)}
            placeholder="Ej: Juan Pérez"
          />
          {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Teléfono *</label>
          <input
            {...phoneField}
            onBlur={(e) => { phoneField.onBlur(e); setPhoneToCheck(e.target.value.trim()); }}
            type="tel"
            id="phone"
            autoComplete="off"
            className={inputClass(!!errors.phone)}
            placeholder="Ej: 11 5555-1234"
          />
          {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone.message}</p>}
          {!errors.phone && duplicate && <DuplicatePhoneWarning customer={duplicate} />}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            {...register('email', {
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Ingresá un email válido' },
            })}
            type="email"
            id="email"
            className={inputClass(!!errors.email)}
            placeholder="Opcional"
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>Dirección</label>
          <input
            {...register('address')}
            type="text"
            id="address"
            className={inputClass(false)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <details className="group rounded-lg border border-outline-variant">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-on-surface">
          Foto (opcional)
          <ChevronDown className="w-4 h-4 text-on-surface-variant transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-4 pb-4">
          <ImageUpload label="Foto del cliente" currentUrl={initialData?.avatar_url} onChange={setAvatarFile} />
        </div>
      </details>
    </form>
  );
};

export default CustomerForm;
