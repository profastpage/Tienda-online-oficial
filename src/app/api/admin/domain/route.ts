import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireStoreOwner } from '@/lib/api-auth'
import { ensureStoreExists, findStoreById, updateStore } from '@/lib/store-helpers'

// Basic domain format validation
const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

function sanitizeDomain(domain: string): string {
  // Strip protocol, trailing slashes, paths, and whitespace
  let clean = domain.trim().toLowerCase()
  clean = clean.replace(/^https?:\/\//, '')
  clean = clean.replace(/\/+$/, '')
  clean = clean.replace(/\/.*$/, '') // Remove any path
  clean = clean.replace(/:\d+$/, '') // Remove port
  return clean
}

export async function GET(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId') || auth.user.storeId

    if (!storeId) {
      return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })
    }

    // Verify ownership
    if (auth.user.role !== 'super-admin' && storeId !== auth.user.storeId) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const store = await ensureStoreExists(db, storeId)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      customDomain: store.customDomain || null,
      domainVerified: store.domainVerified || false,
      domainVerifiedAt: store.domainVerifiedAt || null,
      plan: store.plan,
    })
  } catch (error) {
    console.error('[admin/domain GET]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de dominio' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()

    const storeId = (auth.user.role === 'super-admin' && body.storeId)
      ? body.storeId
      : auth.user.storeId

    if (!storeId) {
      return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })
    }

    const store = await ensureStoreExists(db, storeId)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Only empresarial plan can use custom domains
    if (store.plan !== 'empresarial') {
      return NextResponse.json({
        error: 'El dominio personalizado está disponible solo en el plan Empresarial.',
        requiredPlan: 'empresarial',
      }, { status: 403 })
    }

    const { domain } = body
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'El dominio es obligatorio' }, { status: 400 })
    }

    const cleanDomain = sanitizeDomain(domain)

    if (!DOMAIN_REGEX.test(cleanDomain)) {
      return NextResponse.json({
        error: 'Formato de dominio inválido. Usa el formato: www.mitienda.com',
      }, { status: 400 })
    }

    // Check if another store is already using this domain
    const existingStore = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM Store WHERE customDomain = ${cleanDomain} AND id != ${storeId}
    `
    if (existingStore && existingStore.length > 0) {
      return NextResponse.json({
        error: 'Este dominio ya está siendo usado por otra tienda.',
      }, { status: 409 })
    }

    // Save the domain, reset verification status
    const updatedStore = await updateStore(db, storeId, {
      customDomain: cleanDomain,
      domainVerified: false,
      domainVerifiedAt: null,
    })

    if (updatedStore) {
      console.log('[admin/domain PUT] Domain set:', storeId, cleanDomain)
      return NextResponse.json({
        customDomain: updatedStore.customDomain,
        domainVerified: false,
        domainVerifiedAt: null,
        message: `Dominio ${cleanDomain} configurado correctamente. Sigue las instrucciones de DNS para verificarlo.`,
      })
    }

    return NextResponse.json({ error: 'No se pudo guardar el dominio' }, { status: 500 })
  } catch (error) {
    console.error('[admin/domain PUT]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al guardar dominio' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireStoreOwner(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId') || auth.user.storeId

    if (!storeId) {
      return NextResponse.json({ error: 'No se encontró tienda asociada' }, { status: 400 })
    }

    const store = await findStoreById(db, storeId)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const updatedStore = await updateStore(db, storeId, {
      customDomain: null,
      domainVerified: false,
      domainVerifiedAt: null,
    })

    if (updatedStore) {
      console.log('[admin/domain DELETE] Domain removed:', storeId)
      return NextResponse.json({
        customDomain: null,
        domainVerified: false,
        message: 'Dominio personalizado eliminado correctamente.',
      })
    }

    return NextResponse.json({ error: 'No se pudo eliminar el dominio' }, { status: 500 })
  } catch (error) {
    console.error('[admin/domain DELETE]', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error al eliminar dominio' },
      { status: 500 }
    )
  }
}
