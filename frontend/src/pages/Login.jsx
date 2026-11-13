import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/useAuthStore";
import { showAuthError } from "@services/notificationService";
import Button from "@ui/Button";
import Field from "@ui/Field";
import Input from "@ui/Input";
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
            className="h-20 w-auto dark:mix-blend-screen"
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
            <Field label="Email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lubricentro.com"
              />
            </Field>

            <Field id="password" label="Contraseña">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
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
            </Field>

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
