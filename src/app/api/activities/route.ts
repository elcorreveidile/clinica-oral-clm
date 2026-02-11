import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    description,
    type,
    content,
    instructions,
    dueDate,
    isPublished,
    culturalHints,
  } = body;

  if (!title || !type || !content) {
    return NextResponse.json(
      { error: "Título, tipo y contenido son obligatorios" },
      { status: 400 }
    );
  }

  const activity = await db.activity.create({
    data: {
      title,
      description: description || null,
      type,
      content,
      instructions: instructions || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      isPublished: isPublished ?? false,
      culturalHints: culturalHints?.length ? culturalHints : undefined,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
