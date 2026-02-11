"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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

const ERROR_MESSAGES: Record<string, string> = {
  AccessCodeRequired:
    "Debes introducir un Código de Clínica para registrarte.",
  InvalidAccessCode:
    "El Código de Clínica no es válido. Verifica con tu profesor.",
  AccessCodeUsed: "Este Código de Clínica ya ha sido utilizado.",
  AccessCodeExpired: "Este Código de Clínica ha expirado.",
  OAuthAccountNotLinked:
    "Ya existe una cuenta con ese correo. Inicia sesión con el proveedor original.",
  Default: "Ocurrió un error al iniciar sesión. Inténtalo de nuevo.",
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const errorMessage = errorParam
    ? ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default
    : null;

  const handleSignIn = (provider: string) => {
    if (!accessCode.trim()) return;

    setLoading(provider);

    // Store access code in cookie before OAuth redirect
    document.cookie = `clinic-access-code=${encodeURIComponent(
      accessCode.trim()
    )}; path=/; max-age=600; SameSite=Lax`;

    signIn(provider, { callbackUrl: "/dashboard" });
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

        {/* Sign-in Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Acceder</CardTitle>
            <CardDescription className="text-center">
              Introduce tu código de clínica y elige cómo iniciar sesión
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error message */}
            {errorMessage && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Access code field */}
            <div className="space-y-2">
              <Label htmlFor="accessCode">Código de Clínica</Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Ej: CLM-2025-XXXX"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Código proporcionado por tu profesor. Obligatorio para nuevos
                registros.
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Continuar con
                </span>
              </div>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 gap-3"
                onClick={() => handleSignIn("google")}
                disabled={!accessCode.trim() || loading !== null}
              >
                {loading === "google" ? (
                  <LoadingSpinner />
                ) : (
                  <GoogleIcon />
                )}
                Continuar con Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 gap-3"
                onClick={() => handleSignIn("apple")}
                disabled={!accessCode.trim() || loading !== null}
              >
                {loading === "apple" ? (
                  <LoadingSpinner />
                ) : (
                  <AppleIcon />
                )}
                Continuar con Apple
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="w-full text-center text-xs text-muted-foreground">
              Si ya tienes cuenta, el código no se volverá a validar.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
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
