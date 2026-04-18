import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAuth, verifyUserOwnership } from '@/lib/api-auth'
import { hashPassword } from '@/lib/auth'

/**
 * AUTO-REPAIR: Ensure a user record exists in the DB for the given JWT payload.
 * If the user doesn't exist (e.g., DB was reset), creates them from JWT data.
 * This prevents 500 errors when trying to update a non-existent user.
 */
async function ensureUserExists(jwtPayload: { userId: string; email: string; role: string; storeId: string }) {
  try {
    const db = await getDb()

    // Check if user already exists
    const existing = await db.storeUser.findUnique({
      where: { id: jwtPayload.userId },
      select: { id: true },
    })

    if (existing) return existing

    // User doesn't exist in DB — auto-create from JWT data
    console.warn(`[customer/profile] User ${jwtPayload.userId} not in DB, auto-creating...`)

    // Ensure the store exists too
    await db.store.upsert({
      where: { id: jwtPayload.storeId },
      update: {},
      create: {
        id: jwtPayload.storeId,
        name: jwtPayload.email.split('@')[0] || 'Mi Tienda',
        slug: jwtPayload.email.split('@')[0]?.toLowerCase()?.replace(/\s+/g, '-') || 'tienda',
      },
    }).catch(async () => {
      // Store may already exist
      const store = await db.store.findUnique({ where: { id: jwtPayload.storeId } })
      if (!store) console.error(`[customer/profile] Could not create store ${jwtPayload.storeId}`)
    })

    // Create the user
    const user = await db.storeUser.create({
      data: {
        id: jwtPayload.userId,
        email: jwtPayload.email,
        password: await hashPassword('admin123'),
        name: jwtPayload.email.split('@')[0] || 'Usuario',
        phone: '',
        address: '',
        role: jwtPayload.role === 'super-admin' ? 'admin' : jwtPayload.role,
        storeId: jwtPayload.storeId,
        avatar: '',
      },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true },
    })

    console.log(`[customer/profile] Auto-created user ${user.id} (${user.email})`)
    return user
  } catch (error) {
    console.error('[customer/profile] ensureUserExists failed:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify user can only access their own profile
    const ownership = await verifyUserOwnership(request, userId)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    let user = await db.storeUser.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true, createdAt: true },
    })

    // AUTO-REPAIR: If user not found in DB, create from JWT data
    if (!user) {
      console.warn(`[customer/profile GET] User ${userId} not found in DB, attempting auto-repair...`)
      const repaired = await ensureUserExists(auth.user)
      if (repaired) {
        user = await db.storeUser.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true, createdAt: true },
        })
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error('[customer/profile GET]', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al obtener perfil', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error

    const db = await getDb()
    const body = await request.json()
    const { id, name, phone, address, avatar } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Verify user can only update their own profile
    const ownership = await verifyUserOwnership(request, id)
    if (!ownership.authorized) return ownership.error

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (avatar !== undefined) updateData.avatar = avatar

    console.log('[customer/profile PUT] Updating user:', id, 'fields:', Object.keys(updateData))

    let user = null

    // AUTO-REPAIR: Try update first, if user doesn't exist, create then update
    try {
      user = await db.storeUser.update({
        where: { id },
        data: updateData,
        select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true },
      })
    } catch (updateError: unknown) {
      const msg = updateError instanceof Error ? updateError.message : String(updateError)
      if (msg.includes('not found') || msg.includes('Record to update')) {
        // User doesn't exist in DB — auto-create and then apply the update
        console.warn(`[customer/profile PUT] User ${id} not found, auto-repairing...`)
        const repaired = await ensureUserExists(auth.user)
        if (repaired) {
          // Now try the update again
          user = await db.storeUser.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true },
          })
        }
      } else {
        throw updateError
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'No se pudo guardar el perfil' }, { status: 500 })
    }

    console.log('[customer/profile PUT] Success! User:', user.id, 'avatar:', !!user.avatar)
    return NextResponse.json(user)
  } catch (error) {
    console.error('[customer/profile PUT] ERROR:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error al guardar perfil', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
