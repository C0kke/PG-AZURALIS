import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No se recibió token de autenticación.");
      setTimeout(() => navigate("/", { replace: true }), 2000);
      return;
    }

    localStorage.setItem("token", token);

    refreshUser()
      .then(() => {
        navigate("/", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        setError("Error al verificar tu cuenta. Por favor intenta de nuevo.");
        setTimeout(() => navigate("/", { replace: true }), 2000);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      {error ? (
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fa8fb5] mx-auto" />
          <p className="text-gray-600 text-sm">Iniciando sesión con Google...</p>
        </div>
      )}
    </div>
  );
}
