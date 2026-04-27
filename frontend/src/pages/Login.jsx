import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/useAuthStore";
import { showAuthSuccess, showAuthError } from "@services/notificationService";
import Button from "@ui/Button";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showAuthSuccess("LOGIN_SUCCESS");
      navigate("/dashboard");
    } catch (error) {
      showAuthError(
        "LOGIN_ERROR",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/logo.svg"
            alt="Killamet Lubricantes"
            className="h-20 w-auto mix-blend-screen"
            style={{
              filter:
                "hue-rotate(240deg) saturate(1.5) brightness(1.1) drop-shadow(0 0 18px rgba(167, 139, 250, 0.55)) drop-shadow(0 0 6px rgba(124, 58, 237, 0.4))",
            }}
          />
        </div>
        <p className="mt-6 text-center text-sm text-secondary">
          Inicia sesión para acceder al sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container border border-outline-variant py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-surface"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
                  placeholder="admin@lubricentro.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface"
              >
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 bg-surface-variant border border-outline-variant rounded-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              variant="primary"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container text-secondary">
                  Sistema de Gestión
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
