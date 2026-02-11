"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const studentLinks = [
  { href: "/estudiante", label: "Actividades" },
  { href: "/estudiante/mis-entregas", label: "Mis Entregas" },
];

const teacherLinks = [
  { href: "/profesor", label: "Panel" },
  { href: "/profesor/actividades", label: "Actividades" },
  { href: "/profesor/entregas", label: "Entregas" },
  { href: "/profesor/codigos", label: "Códigos" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session?.user) return null;

  const isTeacher = session.user.role === "TEACHER";
  const links = isTeacher ? teacherLinks : studentLinks;
  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        {/* Brand */}
        <Link
          href={isTeacher ? "/profesor" : "/estudiante"}
          className="mr-6 flex items-center gap-2 font-semibold"
        >
          <span className="hidden sm:inline">Clínica CLM</span>
          <span className="sm:hidden">CLM</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === link.href
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User area */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {isTeacher ? "Profesor" : "Estudiante"}
            </p>
          </div>
          <Avatar className="h-8 w-8">
            {session.user.image && (
              <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
            )}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            Salir
          </Button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Separator className="my-2" />
            <button
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground text-left rounded-md hover:bg-secondary/50 transition-colors"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
