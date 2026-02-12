import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackForm } from "./feedback-form";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  REVIEWED: { label: "Revisada", variant: "default" },
  NEEDS_REVISION: { label: "Necesita revisión", variant: "destructive" },
};

const TYPE_LABELS: Record<string, string> = {
  POESIA: "Poesía",
  CUENTO: "Cuento",
  CANCION: "Canción",
  ESCENA: "Escena",
};

export default async function EntregasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect("/auth/signin");
  const user = await verifyAuth(token);
  if (!user) redirect("/auth/signin");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const submissions = await db.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { name: true, email: true } },
      activity: { select: { title: true, type: true } },
      feedback: { select: { id: true } },
    },
  });

  const pending = submissions.filter((s) => s.status === "PENDING");
  const reviewed = submissions.filter((s) => s.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Entregas de Estudiantes
        </h1>
        <p className="text-muted-foreground">
          Revisa y da feedback a las grabaciones de tus estudiantes.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Revisadas ({reviewed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay entregas pendientes de revisión.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 mt-4">
              {pending.map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed">
          {reviewed.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Aún no has revisado ninguna entrega.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 mt-4">
              {reviewed.map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} showReviewed />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SubmissionData {
  id: string;
  status: string;
  mediaUrl: string;
  mediaType: string | null;
  notes: string | null;
  createdAt: Date;
  student: { name: string | null; email: string | null };
  activity: { title: string; type: string };
  feedback: { id: string }[];
}

function SubmissionCard({
  submission,
  showReviewed,
}: {
  submission: SubmissionData;
  showReviewed?: boolean;
}) {
  const statusConfig = STATUS_CONFIG[submission.status];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              {submission.student.name ?? submission.student.email}
            </CardTitle>
            <CardDescription>
              {submission.activity.title} &middot;{" "}
              {TYPE_LABELS[submission.activity.type]} &middot;{" "}
              {new Date(submission.createdAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </CardDescription>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Media player */}
        {submission.mediaType === "audio" ? (
          <audio controls className="w-full" src={submission.mediaUrl} />
        ) : (
          <video
            controls
            className="w-full rounded-lg max-h-64"
            src={submission.mediaUrl}
          />
        )}

        {submission.notes && (
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Notas del estudiante
            </p>
            <p className="text-sm">{submission.notes}</p>
          </div>
        )}

        {/* Feedback form (only for pending) */}
        {!showReviewed && <FeedbackForm submissionId={submission.id} />}

        {showReviewed && (
          <p className="text-xs text-muted-foreground">
            {submission.feedback.length} comentario
            {submission.feedback.length !== 1 ? "s" : ""} enviado
            {submission.feedback.length !== 1 ? "s" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
