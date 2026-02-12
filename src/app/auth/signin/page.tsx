"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }

      // Login exitoso, redirigir
      if (data.redirectTo) {
        router.push(data.redirectTo);
        router.refresh();
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Clínica Cultural y Lingüística
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Centro de Lenguas Modernas — Universidad de Granada
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo electrónico y contraseña
          </p>

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:ring-2 file:ring-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="tu.correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:ring-2 file:ring-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Credenciales de prueba:</p>
            <p className="mt-2 text-muted-foreground text-xs">
              <strong>profe@clm.ugr.es</strong> / <strong>Prueba2024*</strong>
              <br />
              <strong>benitezl@go.ugr.es</strong> / <strong>Admin2024*</strong>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
