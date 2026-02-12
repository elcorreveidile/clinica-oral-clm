import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<string, string> = {
  POESIA: "Poesía",
  CUENTO: "Cuento",
  CANCION: "Canción",
  ESCENA: "Escena",
};

export default async function ActividadesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect("/auth/signin");
  const user = await verifyAuth(token);
  if (!user) redirect("/auth/signin");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const activities = await db.activity.findMany({
    where: { createdBy: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { submissions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Actividades</h1>
          <p className="text-muted-foreground">
            Gestiona las actividades de inmersión cultural.
          </p>
        </div>
        <Link href="/profesor/actividades/nueva">
          <Button>Nueva actividad</Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">
              No has creado actividades aún
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Crea tu primera actividad para que los estudiantes comiencen a
              practicar.
            </p>
            <Link href="/profesor/actividades/nueva">
              <Button>Crear primera actividad</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{activity.title}</p>
                    <Badge variant="outline" className="shrink-0">
                      {TYPE_LABELS[activity.type]}
                    </Badge>
                    {!activity.isPublished && (
                      <Badge variant="secondary" className="shrink-0">
                        Borrador
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {activity._count.submissions} entrega
                      {activity._count.submissions !== 1 ? "s" : ""}
                    </span>
                    <span>&middot;</span>
                    <span>
                      Creada{" "}
                      {new Date(activity.createdAt).toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "short" }
                      )}
                    </span>
                    {activity.dueDate && (
                      <>
                        <span>&middot;</span>
                        <span>
                          Límite:{" "}
                          {new Date(activity.dueDate).toLocaleDateString(
                            "es-ES",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Link href={`/profesor/actividades/${activity.id}`}>
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
