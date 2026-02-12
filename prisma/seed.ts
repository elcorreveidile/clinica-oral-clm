// =============================================================
// Clínica Cultural y Lingüística de Español - Database Seed
// CLM - Universidad de Granada
// =============================================================

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Crear códigos de acceso para estudiantes
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
  console.log('📋 ACCESS CODES CREATED:')
  console.log('────────────────────────────────────────────────────────────')
  console.log(`  🔑 CLINICA2024`)
  console.log(`  🔑 ESPAÑOL2024`)
  console.log(`  🔑 GRANADA2024`)
  console.log('────────────────────────────────────────────────────────────')
  console.log('')
  console.log('👨‍🏫 TEACHERS: Use your @ugr.es or @go.ugr.es email')
  console.log('👨‍🎓 STUDENTS: Register with any email, then use a code')
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
