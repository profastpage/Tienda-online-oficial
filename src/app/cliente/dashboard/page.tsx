'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, ChevronRight, Clock, CheckCircle, DollarSign, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'

export default function ClienteDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    async function fetchStats() {
      try {
        const res = await fetch(`/api/customer/orders?userId=${userId}`)
        if (res.ok) {
          const orders = await res.json()
          setStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter((o: { status: string }) =>
              ['pending', 'confirmed', 'preparing', 'shipped'].includes(o.status)
            ).length,
            deliveredOrders: orders.filter((o: { status: string }) => o.status === 'delivered').length,
            totalSpent: orders
              .filter((o: { status: string }) => o.status === 'delivered')
              .reduce((sum: number, o: { total: number }) => sum + o.total, 0),
          })
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  const statCards = [
    { label: 'Total Pedidos', value: stats.totalOrders, icon: ShoppingCart, bg: 'bg-neutral-50', iconColor: 'text-neutral-600' },
    { label: 'En Progreso', value: stats.pendingOrders, icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'Entregados', value: stats.deliveredOrders, icon: CheckCircle, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Total Gastado', value: `S/ ${stats.totalSpent.toFixed(2)}`, icon: DollarSign, bg: 'bg-neutral-50', iconColor: 'text-neutral-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-neutral-900 rounded-2xl p-6 sm:p-8 text-white"
      >
        <h2 className="text-xl sm:text-2xl font-bold">
          ¡Hola, {user?.name?.split(' ')[0] || 'Cliente'}! 👋
        </h2>
        <p className="mt-2 text-neutral-400 text-sm max-w-md">
          Bienvenido a tu panel personal. Aquí puedes ver tus pedidos, gestionar tu perfil y más.
        </p>
        <Link href="/cliente/pedidos">
          <Button className="mt-4 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl h-10 text-sm font-semibold">
            Ver mis pedidos
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Card className="rounded-xl border-neutral-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  {loading ? (
                    <Skeleton className="h-7 w-16 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Link href="/cliente/pedidos">
          <Card className="rounded-xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 text-sm">Mis Pedidos</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Revisa el estado de tus pedidos</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cliente/perfil">
          <Card className="rounded-xl border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                  <UserCircle className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 text-sm">Mi Perfil</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Actualiza tu información personal</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}
