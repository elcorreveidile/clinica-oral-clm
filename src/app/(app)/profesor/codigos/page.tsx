import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
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
import { GenerateCodeForm } from "./generate-code-form";

export default async function CodigosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") redirect("/dashboard");

  const codes = await db.accessCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const usedCount = codes.filter((c) => c.isUsed).length;
  const availableCount = codes.filter(
    (c) => !c.isUsed && (!c.expiresAt || c.expiresAt > new Date())
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Códigos de Acceso
        </h1>
        <p className="text-muted-foreground">
          Genera y gestiona los códigos de clínica para nuevos estudiantes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total generados</CardDescription>
            <CardTitle className="text-2xl">{codes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disponibles</CardDescription>
            <CardTitle className="text-2xl">{availableCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Usados</CardDescription>
            <CardTitle className="text-2xl">{usedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Generate form */}
      <GenerateCodeForm />

      {/* Codes list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de códigos</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No se han generado códigos aún.
            </p>
          ) : (
            <div className="space-y-2">
              {codes.map((code) => {
                const isExpired =
                  code.expiresAt && code.expiresAt < new Date();

                return (
                  <div
                    key={code.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <code className="rounded bg-secondary px-2 py-1 text-sm font-mono">
                        {code.code}
                      </code>
                      <div className="text-xs text-muted-foreground">
                        {new Date(code.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                        {code.usedBy && (
                          <span className="ml-2">
                            &middot; Usado por {code.usedBy}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        code.isUsed
                          ? "default"
                          : isExpired
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {code.isUsed
                        ? "Usado"
                        : isExpired
                        ? "Expirado"
                        : "Disponible"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
