import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Clínica Cultural y Lingüística
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Centro de Lenguas Modernas — Universidad de Granada
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Herramienta de inmersión cultural para la mejora de la producción oral
          en español.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
