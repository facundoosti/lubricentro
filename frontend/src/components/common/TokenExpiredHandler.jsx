import { useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useNotificationService } from '@services/notificationService';

const TokenExpiredHandler = () => {
  const { user, isAuthenticated } = useAuth();
  const notification = useNotificationService();

  useEffect(() => {
    // Verificar si el usuario está autenticado pero no hay datos de usuario
    // Esto puede indicar que el token expiró
    if (isAuthenticated && !user) {
      notification.showAuthError('TOKEN_EXPIRED');
    }
  }, [isAuthenticated, user, notification]);

  return null; // Este componente no renderiza nada
};

export default TokenExpiredHandler; 