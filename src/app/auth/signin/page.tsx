"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // OAuth handlers
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (_err) {
      setError("Error al iniciar sesión con Google");
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("apple", { callbackUrl: "/dashboard" });
    } catch (_err) {
      setError("Error al iniciar sesión con Apple");
      setIsLoading(false);
    }
  };

  // Email/Password handler
  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (_err) {
      setError("Error al conectar con el servidor");
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

        {!showPasswordForm ? (
          // OAuth buttons
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona un proveedor para continuar
            </p>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.87-2.6-2.3-4.53h2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13 1.43.35 2.09V7.07H2.18C1.43 8.55 3.99 3.47 2.18 7.07l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 4.251 0c.87.0 1.3 2.5-1.3V7.07l3.66 2.84c.87-2.6 3.3-4.53z"
                />
              </svg>
              Continuar con Google
            </button>

            <button
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.31.05-2.09-.79-3.29-.79-1.53 0-2 .77-.79 3.14-.79.93.65.03 2.26-1.07 3.81-.91 1.31.05-2.3 1.32-3.12.96.03 2.21-.64 2.91-1.47z" />
                <path d="M12 5.38c.69-.83 1.16-1.99 1.03-.04-2.22.67-2.94 1.5-.69.8-1.13 1.98-1 3.12.96.03 2.21-.64 2.91-1.47z" />
              </svg>
              Continuar con Apple
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-muted-foreground hover:underline"
              >
                O continuar con email y contraseña
              </button>
            </div>
          </div>
        ) : (
          // Email/Password form
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

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="text-sm text-muted-foreground hover:underline"
              >
                Volver a opciones de OAuth
              </button>
            </div>

            <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">¿No tienes cuenta?</p>
              <p className="mt-2 text-muted-foreground">
                Estudiantes: Usa el código proporcionado por tu profesor
                <br />
                Profesores: Contacta al administrador
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
