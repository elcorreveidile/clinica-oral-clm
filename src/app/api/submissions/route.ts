// =============================================================
// Clínica Cultural y Lingüística de Español - Submissions API
// CLM - Universidad de Granada
// =============================================================

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET /api/submissions - Obtener todas las entregas del usuario actual
export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Si es profesor, ver todas las entregas
    // Si es estudiante, solo ver las propias
    const submissions = await db.submission.findMany({
      where: user.role === 'TEACHER' ? {} : { studentId: user.id },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        activity: {
          select: { id: true, title: true, type: true },
        },
        feedback: {
          include: {
            teacher: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// POST /api/submissions - Crear una nueva entrega con subida a Cloudinary
export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parsear el FormData
    const formData = await req.formData()
    const file = formData.get('file') as File
    const activityId = formData.get('activityId') as string
    const notes = formData.get('notes') as string | null
    const mediaType = formData.get('mediaType') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    // Verificar que la actividad existe
    const activity = await db.activity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Convertir el File a buffer para subir a Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determinar el resource type basado en el tipo de archivo
    const resourceType = file.type.startsWith('video/') ? 'video' : 'auto'

    // Subir a Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            folder: 'clinica-clm/submissions',
            public_id: `${user.id}_${activityId}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    const uploadResult = await uploadPromise as { secure_url?: string } | null

    if (!uploadResult?.secure_url) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Crear la entrega en la base de datos
    const submission = await db.submission.upsert({
      where: {
        studentId_activityId: {
          studentId: user.id,
          activityId: activityId,
        },
      },
      update: {
        mediaUrl: uploadResult.secure_url,
        mediaType: mediaType || (file.type.startsWith('video/') ? 'video' : 'audio'),
        notes,
        status: 'PENDING',
        updatedAt: new Date(),
      },
      create: {
        studentId: user.id,
        activityId: activityId,
        mediaUrl: uploadResult.secure_url,
        mediaType: mediaType || (file.type.startsWith('video/') ? 'video' : 'audio'),
        notes,
        status: 'PENDING',
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        activity: {
          select: { id: true, title: true, type: true },
        },
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
