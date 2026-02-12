import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
import { Button } from "@/components/ui/button";

export default async function ProfesorPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) redirect("/auth/signin");
  const user = await verifyAuth(token);
  if (!user) redirect("/auth/signin");
  if (user.role !== "TEACHER") redirect("/dashboard");

  const [activityCount, pendingSubmissions, totalStudents, recentSubmissions] =
    await Promise.all([
      db.activity.count({ where: { createdBy: user.id } }),
      db.submission.count({ where: { status: "PENDING" } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.submission.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          student: { select: { name: true } },
          activity: { select: { title: true, type: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel del Profesor</h1>
        <p className="text-muted-foreground">
          Bienvenido/a, {user.name?.split(" ")[0]}. Vista general de tu
          clínica.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actividades creadas</CardDescription>
            <CardTitle className="text-3xl">{activityCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/profesor/actividades">
              <Button variant="link" className="px-0 h-auto text-sm">
                Ver actividades &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Entregas pendientes</CardDescription>
            <CardTitle className="text-3xl">{pendingSubmissions}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/profesor/entregas">
              <Button variant="link" className="px-0 h-auto text-sm">
                Revisar entregas &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estudiantes registrados</CardDescription>
            <CardTitle className="text-3xl">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total en la plataforma
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent pending submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Entregas recientes</CardTitle>
          <CardDescription>
            Últimas entregas pendientes de revisión
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay entregas pendientes.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {sub.student.name ?? "Estudiante"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.activity.title} &middot;{" "}
                      {new Date(sub.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Link href={`/profesor/entregas?id=${sub.id}`}>
                    <Button size="sm" variant="outline">
                      Revisar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
