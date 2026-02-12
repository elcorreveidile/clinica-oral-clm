import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SubmissionForm } from "./submission-form";

const TYPE_LABELS: Record<string, string> = {
  POESIA: "Poesía",
  CUENTO: "Cuento",
  CANCION: "Canción",
  ESCENA: "Escena",
};

interface CulturalHint {
  category: string;
  content: string;
}

export default async function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect("/auth/signin");
  const user = await verifyAuth(token);
  if (!user) redirect("/auth/signin");
  if (user.role !== "STUDENT") redirect("/dashboard");

  const activity = await db.activity.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      submissions: {
        where: { studentId: user.id },
        include: {
          feedback: {
            include: { teacher: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!activity) notFound();

  const submission = activity.submissions[0];
  const culturalHints = (activity.culturalHints as CulturalHint[] | null) ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/estudiante"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Volver a actividades
      </Link>

      {/* Activity header */}
      <div className="space-y-2">
        <Badge variant="outline">{TYPE_LABELS[activity.type]}</Badge>
        <h1 className="text-2xl font-bold tracking-tight">{activity.title}</h1>
        {activity.description && (
          <p className="text-muted-foreground">{activity.description}</p>
        )}
        {activity.dueDate && (
          <p className="text-sm text-muted-foreground">
            Fecha límite:{" "}
            {new Date(activity.dueDate).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Texto de la actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {activity.content}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Hints - "Lupa Cultural" */}
      {culturalHints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lupa Cultural</CardTitle>
            <CardDescription>
              Pistas culturales y lingüísticas para tu práctica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {culturalHints.map((hint, i) => (
              <div key={i} className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {hint.category}
                </p>
                <p className="text-sm">{hint.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {activity.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {activity.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Submission section */}
      {submission ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tu Entrega</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    submission.status === "REVIEWED"
                      ? "default"
                      : submission.status === "NEEDS_REVISION"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {submission.status === "REVIEWED"
                    ? "Revisada"
                    : submission.status === "NEEDS_REVISION"
                    ? "Necesita revisión"
                    : "Pendiente de revisión"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Enviada el{" "}
                  {new Date(submission.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>

              {/* Media player */}
              {submission.mediaType === "audio" ? (
                <audio controls className="w-full" src={submission.mediaUrl} />
              ) : (
                <video
                  controls
                  className="w-full rounded-lg"
                  src={submission.mediaUrl}
                />
              )}

              {submission.notes && (
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Tus notas
                  </p>
                  <p className="text-sm">{submission.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback - "Tratamiento" */}
          {submission.feedback.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Tratamiento del Profesor
              </h3>
              {submission.feedback.map((fb) => (
                <Card key={fb.id}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {fb.teacher.name ?? "Profesor"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(fb.createdAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>

                    <p className="text-sm whitespace-pre-wrap">{fb.comment}</p>

                    {fb.audioUrl && (
                      <audio controls className="w-full" src={fb.audioUrl} />
                    )}

                    {(fb.pronunciation || fb.fluency || fb.culturalUse) && (
                      <div className="flex gap-4 text-sm">
                        {fb.pronunciation && (
                          <div>
                            <span className="text-muted-foreground">
                              Pronunciación:
                            </span>{" "}
                            <span className="font-medium">
                              {fb.pronunciation}/5
                            </span>
                          </div>
                        )}
                        {fb.fluency && (
                          <div>
                            <span className="text-muted-foreground">
                              Fluidez:
                            </span>{" "}
                            <span className="font-medium">{fb.fluency}/5</span>
                          </div>
                        )}
                        {fb.culturalUse && (
                          <div>
                            <span className="text-muted-foreground">
                              Uso cultural:
                            </span>{" "}
                            <span className="font-medium">
                              {fb.culturalUse}/5
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Enviar tu grabación</h2>
          <SubmissionForm activityId={activity.id} />
        </div>
      )}
    </div>
  );
}
