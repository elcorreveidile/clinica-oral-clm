"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function FeedbackForm({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [fluency, setFluency] = useState("");
  const [culturalUse, setCulturalUse] = useState("");
  const [status, setStatus] = useState("REVIEWED");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Dar feedback
      </Button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          comment,
          pronunciation: pronunciation ? parseInt(pronunciation) : null,
          fluency: fluency ? parseInt(fluency) : null,
          culturalUse: culturalUse ? parseInt(culturalUse) : null,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar el feedback");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border p-4 bg-secondary/20"
    >
      <p className="text-sm font-semibold">Tratamiento</p>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`comment-${submissionId}`}>Comentario</Label>
        <Textarea
          id={`comment-${submissionId}`}
          placeholder="Escribe tu feedback detallado..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="grid gap-3 grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Pronunciación (1-5)</Label>
          <select
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fluidez (1-5)</Label>
          <select
            value={fluency}
            onChange={(e) => setFluency(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Uso cultural (1-5)</Label>
          <select
            value={culturalUse}
            onChange={(e) => setCulturalUse(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Estado tras revisión</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`status-${submissionId}`}
              value="REVIEWED"
              checked={status === "REVIEWED"}
              onChange={(e) => setStatus(e.target.value)}
              className="h-4 w-4"
            />
            Aprobada
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`status-${submissionId}`}
              value="NEEDS_REVISION"
              checked={status === "NEEDS_REVISION"}
              onChange={(e) => setStatus(e.target.value)}
              className="h-4 w-4"
            />
            Necesita revisión
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={loading || !comment.trim()}>
          {loading ? "Enviando..." : "Enviar feedback"}
        </Button>
      </div>
    </form>
  );
}
