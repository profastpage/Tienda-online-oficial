'use client'

import { useState } from 'react'
import { useViewStore } from '@/stores/view-store'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, ShoppingBag, TrendingUp, Settings, LogOut, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function SuperAdminPanel() {
  const { setView } = useViewStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    { label: 'Tiendas Activas', value: '523', change: '+12%', icon: Store },
    { label: 'Usuarios Totales', value: '1,847', change: '+8%', icon: Users },
    { label: 'Ingresos Mensual', value: 'S/45,230', change: '+23%', icon: TrendingUp },
    { label: 'Productos Totales', value: '12,456', change: '+5%', icon: ShoppingBag },
  ]

  const recentStores = [
    { name: 'Urban Style', plan: 'Premium', status: 'Activa', products: 24 },
    { name: 'TechStore', plan: 'Pro', status: 'Activa', products: 18 },
    { name: 'NaturalShop', plan: 'Básico', status: 'Activa', products: 8 },
    { name: 'ModaStyle', plan: 'Premium', status: 'Pendiente', products: 0 },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 flex h-14 items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px]">SUPER ADMIN</Badge>
            <span className="text-sm font-bold text-neutral-900">Panel de Administración</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="text-neutral-500">
            <LogOut className="w-4 h-4 mr-1" /> Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-neutral-400" />
                  <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['dashboard', 'tiendas', 'usuarios', 'configuración'].map((tab) => (
            <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab)} className="capitalize whitespace-nowrap text-xs">
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tiendas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentStores.map((store) => (
                    <div key={store.name} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                          <Store className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{store.name}</p>
                          <p className="text-xs text-neutral-500">{store.products} productos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[10px] ${store.plan === 'Premium' ? 'bg-amber-100 text-amber-700' : store.plan === 'Pro' ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-100 text-neutral-600'}`}>
                          {store.plan}
                        </Badge>
                        <Badge variant="secondary" className={`text-[10px] ${store.status === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {store.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab !== 'dashboard' && (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">Sección &ldquo;{activeTab}&rdquo; en desarrollo</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
