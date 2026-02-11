# Clinica Cultural y Linguistica de Espanol

Herramienta digital para el **Centro de Lenguas Modernas (CLM)** de la Universidad de Granada.

Implementa la metodologia propia **"Clinica Cultural y Linguistica"**, que trata al estudiante como un "paciente linguistico" al que se le diagnostica y trata para mejorar su produccion oral en espanol mediante inmersion cultural profunda. Dirigida especificamente a estudiantes universitarios asiaticos.

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Estilos | Tailwind CSS + Shadcn/UI |
| Backend | API Routes de Next.js |
| Base de datos | PostgreSQL (Railway) + Prisma ORM |
| Autenticacion | NextAuth.js (Google, Apple) |
| Media | Cloudinary (video/audio) |
| Hosting | Vercel |

## Modelo de datos

```
User (TEACHER / STUDENT)
  ├── accessCode          → Codigo unico del profesor para registrarse
  ├── nativeLanguage      → Idioma nativo del paciente
  └── spanishLevel        → Nivel de espanol

AccessCode                → Codigos generados por el profesor (uso unico)

Activity (POESIA / CUENTO / CANCION / ESCENA)
  ├── content             → Texto de la actividad
  ├── culturalHints       → JSON: fonetica, traduccion, contexto cultural
  └── instructions        → Instrucciones para la grabacion

Submission
  ├── mediaUrl            → Video/audio del estudiante (Cloudinary)
  ├── status              → PENDING / REVIEWED / NEEDS_REVISION
  └── @@unique(student + activity)

Feedback ("Tratamiento")
  ├── comment             → Correccion escrita del profesor
  ├── audioUrl            → Audio de respuesta del profesor (Cloudinary)
  └── pronunciation / fluency / culturalUse → Puntuacion 1-5
```

## Inicio rapido

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd clinica-oral-clm
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Configurar base de datos
npx prisma db push

# 4. Ejecutar en desarrollo
npm run dev
```

## Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion (genera Prisma + Next.js) |
| `npm run lint` | Linting con ESLint |
| `npm run db:push` | Sincronizar schema con la base de datos |
| `npm run db:studio` | Abrir Prisma Studio (GUI de la BD) |

## Variables de entorno

Ver `.env.example` para la lista completa. Requiere:

- `DATABASE_URL` — PostgreSQL connection string (Railway)
- `NEXTAUTH_URL` + `NEXTAUTH_SECRET` — NextAuth.js
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — OAuth Google
- `APPLE_ID` + `APPLE_TEAM_ID` + `APPLE_PRIVATE_KEY` + `APPLE_KEY_ID` — OAuth Apple
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` — Cloudinary

## Estructura del proyecto

```
src/
├── app/
│   ├── api/auth/[...nextauth]/   → NextAuth route handler
│   ├── globals.css               → Tailwind + Shadcn CSS variables
│   ├── layout.tsx                → Root layout (lang="es")
│   └── page.tsx                  → Landing page
├── components/ui/                → Componentes Shadcn/UI
├── lib/
│   ├── auth.ts                   → Configuracion NextAuth
│   ├── db.ts                     → Prisma client singleton
│   └── utils.ts                  → Utilidad cn() para clases
├── hooks/                        → Custom React hooks
└── types/
    └── next-auth.d.ts            → Type augmentations (role, accessCode)
prisma/
└── schema.prisma                 → Schema completo de la BD
```
