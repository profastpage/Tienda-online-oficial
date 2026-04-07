import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin, verifyStoreOwnership } from '@/lib/api-auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    // Verify store ownership before update
    const ownership = await verifyStoreOwnership(request, 'paymentMethod', id)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    const body = await request.json()
    const { type, name, isActive, qrCode, accountNumber, accountHolder, bankName, sortOrder } = body

    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (name !== undefined) updateData.name = name
    if (isActive !== undefined) updateData.isActive = isActive
    if (qrCode !== undefined) updateData.qrCode = qrCode
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber
    if (accountHolder !== undefined) updateData.accountHolder = accountHolder
    if (bankName !== undefined) updateData.bankName = bankName
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    const method = await db.paymentMethod.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(method)
  } catch {
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    // Verify store ownership before delete
    const ownership = await verifyStoreOwnership(request, 'paymentMethod', id)
    if (!ownership.authorized) return ownership.error

    const db = await getDb()
    await db.paymentMethod.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
  }
}
