"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GenerateCodeForm() {
  const router = useRouter();
  const [count, setCount] = useState("5");
  const [expirationDays, setExpirationDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedCodes([]);

    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: parseInt(count),
          expirationDays: expirationDays ? parseInt(expirationDays) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar códigos");
      }

      const data = await res.json();
      setGeneratedCodes(data.codes);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generar nuevos códigos</CardTitle>
        <CardDescription>
          Los códigos se asignan a nuevos estudiantes durante el registro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="count">Cantidad</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expDays">
                Días de validez (vacío = sin caducidad)
              </Label>
              <Input
                id="expDays"
                type="number"
                min="1"
                max="365"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Generando..." : "Generar códigos"}
          </Button>
        </form>

        {/* Show generated codes */}
        {generatedCodes.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Códigos generados ({generatedCodes.length})
              </p>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Copiar todos
              </Button>
            </div>
            <div className="rounded-lg bg-secondary p-3 font-mono text-sm space-y-1">
              {generatedCodes.map((code) => (
                <div key={code}>{code}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
