"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, accessCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta.");
        setLoading(false);
        return;
      }

      router.push("/auth/signin?registered=1");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Clínica Cultural y Lingüística
          </h1>
          <p className="text-sm text-muted-foreground">
            Centro de Lenguas Modernas — Universidad de Granada
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Crear cuenta</CardTitle>
            <CardDescription className="text-center">
              Regístrate con tu correo electrónico y código de clínica
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCode">Código de Clínica</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Ej: CLINICA2024"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Código proporcionado por tu profesor para registrarte.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : "Crear cuenta"}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="w-full text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
