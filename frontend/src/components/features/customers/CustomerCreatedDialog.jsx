import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Car, User } from 'lucide-react';
import Dialog from '@ui/Dialog';
import Button from '@ui/Button';

// Aviso después de crear un cliente con los siguientes pasos habituales.
// (El toast de sileo admite un solo botón, por eso es un diálogo.)
const CustomerCreatedDialog = ({ customer, onClose }) => {
  const navigate = useNavigate();
  if (!customer) return null;

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog isOpen onClose={onClose} size="sm" className="max-w-sm" showCloseButton={false} ariaLabel="Cliente creado">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-tertiary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-on-surface">Cliente creado</h2>
          <p className="text-sm text-on-surface-variant mt-1">{customer.name}</p>
        </div>
        <div className="flex w-full flex-col gap-2 mt-2">
          <Button onClick={() => go(`/customers/${customer.id}?addVehicle=1`)} startIcon={<Car className="w-4 h-4" />}>
            + Agregar vehículo
          </Button>
          <Button variant="secondary" onClick={() => go(`/customers/${customer.id}`)} startIcon={<User className="w-4 h-4" />}>
            Ver perfil
          </Button>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default CustomerCreatedDialog;
