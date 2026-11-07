import { describe, it, expect, beforeEach, vi } from 'vitest';

const authAPI = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
  verifyToken: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
}));

vi.mock('@services/authService', () => ({ default: authAPI }));

// El store se inicializa al importarse: cada test lo importa de cero.
const loadStore = async () => {
  vi.resetModules();
  const { useAuthStore } = await import('@stores/useAuthStore');
  await vi.waitFor(() => expect(useAuthStore.getState().loading).toBe(false));
  return useAuthStore;
};

describe('useAuthStore (inicialización)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin sesión guardada termina de cargar y queda no autenticado', async () => {
    authAPI.getCurrentUser.mockReturnValue(null);
    authAPI.isAuthenticated.mockReturnValue(false);

    const store = await loadStore();

    expect(store.getState()).toMatchObject({ loading: false, isAuthenticated: false, user: null });
    expect(authAPI.verifyToken).not.toHaveBeenCalled();
  });

  it('con token válido queda autenticado con el usuario guardado', async () => {
    const user = { id: 1, email: 'a@b.c' };
    authAPI.getCurrentUser.mockReturnValue(user);
    authAPI.isAuthenticated.mockReturnValue(true);
    authAPI.verifyToken.mockResolvedValue(true);

    const store = await loadStore();

    expect(store.getState()).toMatchObject({ loading: false, isAuthenticated: true, user });
  });

  it('con token inválido limpia la sesión y queda no autenticado', async () => {
    authAPI.getCurrentUser.mockReturnValue({ id: 1 });
    authAPI.isAuthenticated.mockReturnValue(true);
    authAPI.verifyToken.mockResolvedValue(false);

    const store = await loadStore();

    expect(store.getState()).toMatchObject({ loading: false, isAuthenticated: false });
    expect(authAPI.logout).toHaveBeenCalled();
  });

  it('si leer la sesión guardada falla, limpia y queda no autenticado', async () => {
    authAPI.getCurrentUser.mockImplementation(() => {
      throw new SyntaxError('JSON corrupto');
    });

    const store = await loadStore();

    expect(store.getState()).toMatchObject({ loading: false, isAuthenticated: false });
    expect(authAPI.logout).toHaveBeenCalled();
  });

  it('un login hecho mientras se verifica un token viejo no se pierde', async () => {
    const user = { id: 2, email: 'nuevo@b.c' };
    let resolveVerify;
    authAPI.getCurrentUser.mockReturnValue({ id: 1 });
    authAPI.isAuthenticated.mockReturnValue(true);
    authAPI.verifyToken.mockReturnValue(new Promise((r) => { resolveVerify = r; }));
    authAPI.login.mockResolvedValue({ data: { user } });

    vi.resetModules();
    const { useAuthStore } = await import('@stores/useAuthStore');
    await useAuthStore.getState().login('nuevo@b.c', 'secreta');
    resolveVerify(false);
    await vi.waitFor(() => expect(authAPI.verifyToken).toHaveBeenCalled());
    await Promise.resolve();

    expect(useAuthStore.getState()).toMatchObject({ loading: false, isAuthenticated: true, user });
    expect(authAPI.logout).not.toHaveBeenCalled();
  });
});

describe('useAuthStore.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAPI.getCurrentUser.mockReturnValue(null);
    authAPI.isAuthenticated.mockReturnValue(false);
  });

  it('login exitoso deja autenticado y termina de cargar', async () => {
    const user = { id: 1 };
    authAPI.login.mockResolvedValue({ data: { user } });
    const store = await loadStore();

    await store.getState().login('a@b.c', 'secreta');

    expect(store.getState()).toMatchObject({ loading: false, isAuthenticated: true, user });
  });

  it('login fallido propaga el error y no deja la app cargando', async () => {
    authAPI.login.mockRejectedValue(new Error('Credenciales inválidas'));
    const store = await loadStore();

    await expect(store.getState().login('a@b.c', 'mala')).rejects.toThrow('Credenciales inválidas');

    expect(store.getState()).toMatchObject({ loading: false, isAuthenticated: false });
  });
});
