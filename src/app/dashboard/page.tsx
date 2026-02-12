import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect("/auth/signin");
  }

  const user = await verifyAuth(token);

  if (!user) {
    redirect("/auth/signin");
  }

  // Redirigir según el rol
  if (user.role === "TEACHER") {
    redirect("/profesor");
  } else {
    redirect("/estudiante");
  }
}
