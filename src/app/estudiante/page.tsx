import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function EstudiantePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect("/auth/signin");
  }

  const user = await verifyAuth(token);

  if (!user) {
    redirect("/auth/signin");
  }

  // Obtener información adicional del usuario (accessCode)
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { accessCode: true },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel del Estudiante</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user.name}
            </p>
          </div>
          <div className="flex gap-2">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>

        {!dbUser?.accessCode && (
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="text-lg font-semibold text-yellow-900">
              Código de acceso requerido
            </h2>
            <p className="mt-2 text-sm text-yellow-800">
              Debes ingresar un código de acceso proporcionado por tu profesor para
              continuar.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/estudiante/mis-entregas"
            className="rounded-lg border p-6 transition-colors hover:bg-accent"
          >
            <h2 className="text-xl font-semibold">Mis Entregas</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ver el historial de tus entregas y el feedback recibido
            </p>
          </Link>

          <div className="rounded-lg border p-6 opacity-50">
            <h2 className="text-xl font-semibold">Actividades Disponibles</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Próximamente: Lista de actividades para practicar
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
