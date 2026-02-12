import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

function generateCode(): string {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CLM-${new Date().getFullYear()}-${random}`;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "TEACHER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const count = Math.min(Math.max(body.count || 1, 1), 50);
  const expirationDays = body.expirationDays;

  const expiresAt = expirationDays
    ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
    : null;

  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    let code: string;
    let exists = true;

    // Ensure uniqueness
    do {
      code = generateCode();
      const found = await db.accessCode.findUnique({ where: { code } });
      exists = !!found;
    } while (exists);

    await db.accessCode.create({
      data: {
        code,
        expiresAt,
      },
    });

    codes.push(code);
  }

  return NextResponse.json({ codes }, { status: 201 });
}
