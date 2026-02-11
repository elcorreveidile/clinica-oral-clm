"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ACTIVITY_TYPES = [
  { value: "POESIA", label: "Poesía" },
  { value: "CUENTO", label: "Cuento" },
  { value: "CANCION", label: "Canción" },
  { value: "ESCENA", label: "Escena" },
];

export default function NuevaActividadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      content: formData.get("content") as string,
      instructions: formData.get("instructions") as string,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string).toISOString()
        : null,
      isPublished: formData.get("publish") === "on",
      culturalHints: parseCulturalHints(
        formData.get("culturalHints") as string
      ),
    };

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al crear la actividad");
      }

      router.push("/profesor/actividades");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/profesor/actividades"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Volver a actividades
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva Actividad</h1>
        <p className="text-muted-foreground">
          Crea una nueva actividad de inmersión cultural.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la actividad</CardTitle>
          <CardDescription>
            Rellena los campos para crear una nueva actividad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Romance del Prisionero"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de actividad</Label>
                <select
                  id="type"
                  name="type"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción breve</Label>
              <Input
                id="description"
                name="description"
                placeholder="Descripción corta visible en el listado de actividades"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Texto de la actividad (poema, cuento, letra, guión)
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Pega aquí el texto completo de la actividad..."
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="culturalHints">
                Pistas Culturales (Lupa Cultural)
              </Label>
              <Textarea
                id="culturalHints"
                name="culturalHints"
                placeholder={`Una pista por línea con formato "Categoría: Contenido"\nEj:\nFonética: La "rr" vibrante en "prisionero"\nContexto: Romance medieval del siglo XV`}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Una pista por línea: &quot;Categoría: Contenido&quot;
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">
                Instrucciones para la grabación
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="Instrucciones específicas para el estudiante..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha límite (opcional)</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="publish"
                  name="publish"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="publish" className="font-normal">
                  Publicar inmediatamente
                </Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/profesor/actividades">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear actividad"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function parseCulturalHints(raw: string): { category: string; content: string }[] {
  if (!raw.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return { category: "General", content: line };
      return {
        category: line.slice(0, colonIndex).trim(),
        content: line.slice(colonIndex + 1).trim(),
      };
    });
}
