import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const activityId = formData.get("activityId") as string;
  const notes = formData.get("notes") as string;

  if (!file || !activityId) {
    return NextResponse.json(
      { error: "Archivo y actividad son obligatorios" },
      { status: 400 }
    );
  }

  // Check activity exists and is published
  const activity = await db.activity.findUnique({
    where: { id: activityId, isPublished: true },
  });

  if (!activity) {
    return NextResponse.json(
      { error: "Actividad no encontrada" },
      { status: 404 }
    );
  }

  // Check no existing submission
  const existing = await db.submission.findUnique({
    where: {
      studentId_activityId: {
        studentId: session.user.id,
        activityId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya has enviado una entrega para esta actividad" },
      { status: 409 }
    );
  }

  // TODO: Upload file to Cloudinary and get the URL
  // For now, store a placeholder URL
  const mediaType = file.type.startsWith("video") ? "video" : "audio";
  const mediaUrl = `/uploads/placeholder-${Date.now()}`;

  const submission = await db.submission.create({
    data: {
      mediaUrl,
      mediaType,
      notes: notes || null,
      studentId: session.user.id,
      activityId,
    },
  });

  return NextResponse.json(submission, { status: 201 });
}
