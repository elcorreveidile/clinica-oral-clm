import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfesorPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/auth/signin");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel del Profesor</h1>
            <p className="text-muted-foreground">
              Bienvenido, {session.user.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/api/auth/signout"
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/profesor/actividades"
            className="rounded-lg border p-6 transition-colors hover:bg-accent"
          >
            <h2 className="text-xl font-semibold">Actividades</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crear y gestionar actividades de poesía, cuentos, canciones y escenas
            </p>
          </Link>

          <Link
            href="/profesor/entregas"
            className="rounded-lg border p-6 transition-colors hover:bg-accent"
          >
            <h2 className="text-xl font-semibold">Entregas</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ver y calificar las entregas de los estudiantes
            </p>
          </Link>

          <Link
            href="/profesor/codigos"
            className="rounded-lg border p-6 transition-colors hover:bg-accent"
          >
            <h2 className="text-xl font-semibold">Códigos de Acceso</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Generar códigos para que los estudiantes se registren
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
