import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 })

    const products = await db.product.findMany({
      where: { storeId },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { storeId, name, slug, description, price, comparePrice, image, categoryId, isFeatured, isNew, discount, sizes, colors } = body
    if (!storeId || !name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        storeId, name, slug, description: description || '', price,
        comparePrice: comparePrice || null, image: image || '',
        categoryId, isFeatured: isFeatured || false, isNew: isNew || false,
        discount: discount || null, sizes: JSON.stringify(sizes || []), colors: JSON.stringify(colors || []),
      },
      include: { category: { select: { name: true } } },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug ya existe' }, { status: 409 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const db = await getDb()
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice || null
    if (data.image !== undefined) updateData.image = data.image
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isNew !== undefined) updateData.isNew = data.isNew
    if (data.discount !== undefined) updateData.discount = data.discount || null
    if (data.inStock !== undefined) updateData.inStock = data.inStock
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes)
    if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors)

    const product = await db.product.update({ where: { id }, data: updateData, include: { category: { select: { name: true } } } })
    return NextResponse.json(product)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed'
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Slug ya existe' }, { status: 409 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
