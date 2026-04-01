import { useEffect } from 'react';
import { useAuthStore } from '@stores/useAuthStore';
import { showAuthError } from '@services/notificationService';

const TokenExpiredHandler = () => {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      showAuthError('TOKEN_EXPIRED');
    }
  }, [isAuthenticated, user]);

  return null;
};

export default TokenExpiredHandler;
