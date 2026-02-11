// =============================================================
// Clínica Cultural y Lingüística de Español - Database Seed
// CLM - Universidad de Granada
// =============================================================

import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Crear usuario PROFESOR
  console.log('📚 Creating TEACHER user...')
  const teacher = await prisma.user.upsert({
    where: { email: 'profe@clm.ugr.es' },
    update: {},
    create: {
      email: 'profe@clm.ugr.es',
      name: 'Profe Prueba',
      role: Role.TEACHER,
    },
  })
  console.log(`   ✅ TEACHER created: ${teacher.email}`)

  // 2. Crear usuario ADMIN
  console.log('🔐 Creating ADMIN user...')
  const admin = await prisma.user.upsert({
    where: { email: 'benitezl@go.ugr.es' },
    update: {},
    create: {
      email: 'benitezl@go.ugr.es',
      name: 'Javier Benítez',
      role: Role.TEACHER, // ADMIN no existe en el enum, usando TEACHER
    },
  })
  console.log(`   ✅ ADMIN created: ${admin.email}`)

  // 3. Crear código de acceso para estudiantes
  console.log('🔑 Creating AccessCode for students...')
  const accessCode = await prisma.accessCode.upsert({
    where: { code: 'CLINICA2024' },
    update: {},
    create: {
      code: 'CLINICA2024',
      isUsed: false,
    },
  })
  console.log(`   ✅ AccessCode created: ${accessCode.code}`)

  console.log('✨ Database seed completed successfully!')
  console.log('')
  console.log('────────────────────────────────────────────────────────────')
  console.log('📋 CREDENTIALS CREATED:')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`  👨‍🏫 TEACHER:   profe@clm.ugr.es`)
  console.log(`  🔐 ADMIN:      benitezl@go.ugr.es`)
  console.log(`  🔑 CODE:       CLINICA2024`)
  console.log('────────────────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
