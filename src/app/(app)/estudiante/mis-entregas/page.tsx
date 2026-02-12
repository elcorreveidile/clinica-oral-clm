import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export default async function MisEntregasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect("/auth/signin");
  const user = await verifyAuth(token);
  if (!user) redirect("/auth/signin");
  if (user.role !== "STUDENT") redirect("/dashboard");

  const submissions = await db.submission.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      activity: { select: { id: true, title: true, type: true } },
      feedback: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Entregas</h1>
        <p className="text-muted-foreground">
          Historial de tus entregas y el estado de revisión.
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">Aún no has enviado entregas</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Ve a las actividades para comenzar tu primera práctica.
            </p>
            <Link href="/estudiante">
              <Button>Ver actividades</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const statusConfig = STATUS_CONFIG[sub.status];
            return (
              <Link
                key={sub.id}
                href={`/estudiante/actividad/${sub.activityId}`}
              >
                <Card className="hover:bg-secondary/30 transition-colors">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {sub.activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {TYPE_LABELS[sub.activity.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          &middot;
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {sub.feedback.length > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              &middot;
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {sub.feedback.length} comentario
                              {sub.feedback.length !== 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
