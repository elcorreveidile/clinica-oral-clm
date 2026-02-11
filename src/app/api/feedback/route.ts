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
  const { submissionId, comment, pronunciation, fluency, culturalUse, status } =
    body;

  if (!submissionId || !comment) {
    return NextResponse.json(
      { error: "Entrega y comentario son obligatorios" },
      { status: 400 }
    );
  }

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return NextResponse.json(
      { error: "Entrega no encontrada" },
      { status: 404 }
    );
  }

  // Create feedback and update submission status in a transaction
  const [feedback] = await db.$transaction([
    db.feedback.create({
      data: {
        comment,
        pronunciation: pronunciation ?? null,
        fluency: fluency ?? null,
        culturalUse: culturalUse ?? null,
        submissionId,
        teacherId: session.user.id,
      },
    }),
    db.submission.update({
      where: { id: submissionId },
      data: { status: status || "REVIEWED" },
    }),
  ]);

  return NextResponse.json(feedback, { status: 201 });
}
