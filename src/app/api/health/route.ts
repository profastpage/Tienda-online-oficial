import { checkDbHealth } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const dbHealth = await checkDbHealth()

    // Check environment variables
    const envVars = {
      DATABASE_URL: Boolean(process.env.DATABASE_URL) ? 'SET' : 'MISSING',
      TURSO_URL: Boolean(process.env.TURSO_URL) ? 'SET' : 'NOT SET',
      DATABASE_AUTH_TOKEN: Boolean(process.env.DATABASE_AUTH_TOKEN) ? 'SET' : 'NOT SET',
      JWT_SECRET: Boolean(process.env.JWT_SECRET) ? 'SET' : 'MISSING',
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) ? 'SET' : 'NOT SET',
      CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY) ? 'SET' : 'NOT SET',
      CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET) ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'not set',
    }

    const allRequired = [
      envVars.DATABASE_URL === 'SET',
      envVars.JWT_SECRET === 'SET',
      envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME === 'SET',
      envVars.CLOUDINARY_API_KEY === 'SET',
      envVars.CLOUDINARY_API_SECRET === 'SET',
    ]

    const allOk = dbHealth.status === 'healthy' && allRequired.every(Boolean)

    return NextResponse.json({
      status: allOk ? 'ok' : 'error',
      database: dbHealth,
      environment: envVars,
      issues: [
        ...(!allRequired.every(Boolean)
          ? ['Faltan variables de entorno requeridas. Revisa: ' +
             Object.entries(envVars)
               .filter(([, v]) => v === 'MISSING' || v === 'NOT SET')
               .map(([k]) => k)
               .join(', ')]
          : []),
        ...(dbHealth.status === 'error' ? ['La conexion a la base de datos falla. Verifica TURSO_URL y DATABASE_AUTH_TOKEN'] : []),
        ...(dbHealth.details.includes('NONE')
          ? ['Las tablas no existen en la base de datos. Ejecuta /api/init-db para crearlas']
          : []),
      ],
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: { status: 'error', mode: 'unknown', details: String(error) },
      environment: { error: 'Could not check environment' },
      issues: ['Error critico al verificar la salud del sistema'],
    })
  }
}
