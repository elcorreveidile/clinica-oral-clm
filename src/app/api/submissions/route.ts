import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";

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

  // Upload file to Cloudinary
  const mediaType = file.type.startsWith("video") ? "video" : "audio";
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let mediaUrl: string;
  try {
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video", // Cloudinary uses "video" for both audio and video
            folder: `clinica-clm/submissions/${session.user.id}`,
            allowed_formats: [
              "mp3",
              "mp4",
              "wav",
              "webm",
              "ogg",
              "m4a",
              "mov",
            ],
          },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Upload failed"));
            else resolve(result);
          }
        );
        stream.end(buffer);
      }
    );
    mediaUrl = result.secure_url;
  } catch {
    return NextResponse.json(
      { error: "Error al subir el archivo. Inténtalo de nuevo." },
      { status: 500 }
    );
  }

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
