import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, accessCode } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await db.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo electrónico" },
      { status: 409 }
    );
  }

  // Validate access code for student registration
  if (!accessCode) {
    return NextResponse.json(
      { error: "El código de acceso es obligatorio para registrarse" },
      { status: 400 }
    );
  }

  const codeRecord = await db.accessCode.findUnique({
    where: { code: accessCode },
  });

  if (!codeRecord) {
    return NextResponse.json(
      { error: "El código de acceso no es válido" },
      { status: 400 }
    );
  }

  if (codeRecord.isUsed) {
    return NextResponse.json(
      { error: "Este código de acceso ya ha sido utilizado" },
      { status: 400 }
    );
  }

  if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Este código de acceso ha expirado" },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 12);

  // Create user and mark code as used in a transaction
  const user = await db.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        accessCode: accessCode,
        emailVerified: new Date(),
      },
    });

    await tx.accessCode.update({
      where: { id: codeRecord.id },
      data: {
        isUsed: true,
        usedBy: email,
      },
    });

    return newUser;
  });

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name },
    { status: 201 }
  );
}
