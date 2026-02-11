import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<string, string> = {
  POESIA: "Poesía",
  CUENTO: "Cuento",
  CANCION: "Canción",
  ESCENA: "Escena",
};

const TYPE_COLORS: Record<string, string> = {
  POESIA: "bg-purple-100 text-purple-800 border-purple-200",
  CUENTO: "bg-blue-100 text-blue-800 border-blue-200",
  CANCION: "bg-amber-100 text-amber-800 border-amber-200",
  ESCENA: "bg-green-100 text-green-800 border-green-200",
};

export default async function EstudiantePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") redirect("/dashboard");

  const activities = await db.activity.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      submissions: {
        where: { studentId: session.user.id },
        select: { id: true, status: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Consultorio del Estudiante
        </h1>
        <p className="text-muted-foreground">
          Bienvenido/a, {session.user.name?.split(" ")[0]}. Aquí encontrarás tus
          actividades de inmersión cultural.
        </p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">No hay actividades disponibles</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tu profesor aún no ha publicado actividades. Vuelve pronto.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activities.map((activity) => {
            const submission = activity.submissions[0];
            const hasSubmitted = !!submission;

            return (
              <Card key={activity.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      className={cn(TYPE_COLORS[activity.type])}
                      variant="outline"
                    >
                      {TYPE_LABELS[activity.type]}
                    </Badge>
                    {hasSubmitted && (
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
                          ? "Revisión"
                          : "Pendiente"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {activity.title}
                  </CardTitle>
                  {activity.description && (
                    <CardDescription className="line-clamp-2">
                      {activity.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="flex items-center justify-between">
                    {activity.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Fecha límite:{" "}
                        {new Date(activity.dueDate).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                    <Link
                      href={`/estudiante/actividad/${activity.id}`}
                      className="ml-auto"
                    >
                      <Button size="sm" variant={hasSubmitted ? "outline" : "default"}>
                        {hasSubmitted ? "Ver entrega" : "Comenzar"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
