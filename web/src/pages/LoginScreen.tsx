import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CancerRibbon } from "../components/CancerRibbon";
import LogoUniversidad from "../assets/logo_ucn.svg?react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("google_error") === "1") {
      setError(
        "No se pudo iniciar sesión con Google. Por favor intenta de nuevo."
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    // Prevenir recarga de página si viene de un form submit
    if (e) {
      e.preventDefault();
    }

    // Limpiar error previo
    setError("");

    // Validación de campos vacíos
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);

      // Después del login exitoso, navegar a la raíz
      // HomePage detectará isAuthenticated y redirigirá al dashboard correcto
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);

      // Manejo específico de errores del backend
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message;

        if (status === 401) {
          setError(
            "Correo o contraseña incorrectos. Por favor verifica tus credenciales."
          );
        } else if (status === 404) {
          setError("Usuario no encontrado. ¿Necesitas registrarte?");
        } else if (status === 403) {
          setError("Tu cuenta está bloqueada. Contacta al administrador.");
        } else if (status === 500) {
          setError("Error en el servidor. Por favor intenta más tarde.");
        } else {
          setError(
            message || "Error al iniciar sesión. Por favor intenta nuevamente."
          );
        }
      } else if (err.request) {
        // Error de red - no hay respuesta del servidor
        setError(
          "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        );
      } else {
        // Otro tipo de error
        setError(
          err.message || "Error inesperado. Por favor intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-4">
          {/* LOGOS */}
          <div className="flex items-center justify-center space-x-3">
            <CancerRibbon className="text-[#ff6299]" size="lg" />
            <LogoUniversidad className="w-12 h-12 " />
          </div>
          {/* SUBTITULO */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">
              Ficha Médica Portátil
            </h1>
            <p className="text-sm text-gray-600 text-center">
              Universidad Católica del Norte
            </p>
          </div>
        </div>
        {/* LOGIN FORM */}
        <Card>
          <CardHeader className="flex items-center justify-center">
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Accede a tu información médica de forma segura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              {/*Correo Electrónico*/}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ficha_medica@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Limpiar error al escribir
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className={error && !password ? "border-red-300" : ""}
                />
              </div>
              {/*Contraseña*/}
              <div className="space-y-2 pt-4">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Limpiar error al escribir
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    className={error && email ? "border-red-300" : ""}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {/*Mensaje de error*/}
              {error && (
                <Alert className="mt-4 bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {/* Forgot password link */}
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              {/*Botón para iniciar sesión*/}
              <div className="space-y-2 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="outline"
                  className="w-full bg-[#fa8fb5] hover:bg-[#dd6d94]"
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </div>
              {/* Separador */}
              <div className="flex items-center gap-3 pt-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">o</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Botón Continuar con Google */}
              <div className="pt-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    window.location.href = `${BACKEND_URL}/auth/google`;
                  }}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {/* Logo de Google */}
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continuar con Google
                </button>
              </div>

              {/* Enlace a registro */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-[#fa8fb5] hover:text-[#dd6d94] font-medium hover:underline transition-colors"
                    disabled={isLoading}
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer*/}
        <div className="text-center text-sm text-gray-500">
          <p>Sistema desarrollado para mejorar la atención oncológica.</p>
          <p className="mt-1">© 2025 Azuralis</p>
        </div>
      </div>
    </div>
  );
}
