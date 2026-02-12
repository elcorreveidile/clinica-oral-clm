// =============================================================
// Clínica Cultural y Lingüística de Español - Database Seed
// CLM - Universidad de Granada
// =============================================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash contraseñas para usuarios de prueba
  const teacherPassword = await bcrypt.hash('Prueba2024*', 10)
  const adminPassword = await bcrypt.hash('Admin2024*', 10)

  // 1. Crear usuario PROFESOR
  console.log('📚 Creating TEACHER user...')
  const teacher = await prisma.user.upsert({
    where: { email: 'profe@clm.ugr.es' },
    update: {},
    create: {
      email: 'profe@clm.ugr.es',
      name: 'Profe Prueba',
      password: teacherPassword,
      role: 'TEACHER',
    },
  })
  console.log(`   ✅ TEACHER created: ${teacher.email}`)
  console.log(`   🔑 Password: Prueba2024*`)

  // 2. Crear usuario ADMIN
  console.log('🔐 Creating ADMIN user...')
  const admin = await prisma.user.upsert({
    where: { email: 'benitezl@go.ugr.es' },
    update: {},
    create: {
      email: 'benitezl@go.ugr.es',
      name: 'Javier Benítez',
      password: adminPassword,
      role: 'TEACHER',
    },
  })
  console.log(`   ✅ ADMIN created: ${admin.email}`)
  console.log(`   🔑 Password: Admin2024*`)

  // 3. Crear códigos de acceso para estudiantes
  console.log('🔑 Creating AccessCodes for students...')
  const codes = [
    { code: 'CLINICA2024', isUsed: false },
    { code: 'ESPAÑOL2024', isUsed: false },
    { code: 'GRANADA2024', isUsed: false },
  ]

  for (const codeData of codes) {
    const accessCode = await prisma.accessCode.upsert({
      where: { code: codeData.code },
      update: {},
      create: codeData,
    })
    console.log(`   ✅ AccessCode created: ${accessCode.code}`)
  }

  console.log('✨ Database seed completed successfully!')
  console.log('')
  console.log('────────────────────────────────────────────────────────────')
  console.log('📋 CREDENTIALS CREATED:')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`  👨‍🏫 TEACHER:   profe@clm.ugr.es`)
  console.log(`  🔑 Password:  Prueba2024*`)
  console.log(`  🔐 ADMIN:      benitezl@go.ugr.es`)
  console.log(`  🔑 Password:  Admin2024*`)
  console.log(``)
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
