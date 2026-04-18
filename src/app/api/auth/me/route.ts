import { NextResponse } from 'next/server'
import { getAuthUser, signToken } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Generate a fresh token for the client to use in subsequent API calls
    const token = await signToken({
      userId: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
    })

    // CRITICAL FIX: Return FULL user profile data from DB
    // Previously only returned id, email, role, storeId, token — missing name, phone, address, avatar, storeName, storeSlug
    // This caused profile data to be lost on session refresh/hydration
    if (authUser.role === 'super-admin') {
      // Super-admin doesn't have a StoreUser record in the DB
      return NextResponse.json({
        id: authUser.userId,
        email: authUser.email,
        name: process.env.SUPER_ADMIN_NAME || 'Super Administrador',
        phone: '',
        address: '',
        role: authUser.role,
        storeId: authUser.storeId,
        storeName: 'Super Admin',
        storeSlug: 'super-admin',
        avatar: '',
        token,
      })
    }

    // For regular admin/customer users, fetch complete profile from DB
    try {
      const db = await getDb()
      const user = await db.storeUser.findUnique({
        where: { id: authUser.userId },
        include: { store: { select: { name: true, slug: true } } },
      })

      if (user) {
        return NextResponse.json({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role,
          storeId: user.storeId,
          storeName: user.store.name,
          storeSlug: user.store.slug,
          avatar: user.avatar || '',
          twoFactorEnabled: user.twoFactorEnabled,
          token,
        })
      }
    } catch (dbError) {
      console.warn('[auth/me] DB lookup failed, returning JWT data only:', dbError instanceof Error ? dbError.message : dbError)
    }

    // Fallback: return data from JWT token (may not have latest profile updates)
    return NextResponse.json({
      id: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      storeId: authUser.storeId,
      token,
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
