'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCards } from '@/components/StatsCards'
import { ShopeeFilters } from '@/components/ShopeeFilters'
import { OrderTable } from '@/components/OrderTable'
import { OrderCard } from '@/components/OrderCard'
import { ProductsTable } from '@/components/ProductsTable'
import { SalesChart } from '@/components/charts/SalesChart'
import { StateChart } from '@/components/charts/StateChart'
import { ProductChart } from '@/components/charts/ProductChart'
import { StatusChart } from '@/components/charts/StatusChart'
import { ShopeeOrder, FilterOptions } from '@/types/shopee'
import { processShopeeData } from '@/lib/data-processing'

interface DashboardProps {
  data: ShopeeOrder[]
}

export function Dashboard({ data }: DashboardProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [viewMode, setViewMode] = useState<'orders' | 'products' | 'analytics'>('orders')
  const [selectedOrder, setSelectedOrder] = useState<ShopeeOrder | null>(null)

  const metrics = useMemo(() => {
    return processShopeeData(data, filters)
  }, [data, filters])

  const availableStatuses = useMemo(() => {
    return [...new Set(data.map(order => order["Status do pedido"]))].sort()
  }, [data])

  const availableStates = useMemo(() => {
    return [...new Set(data.map(order => order["UF"]))].sort()
  }, [data])

  const availableProducts = useMemo(() => {
    return [...new Set(data.map(order => order["Nome do Produto"]))].sort()
  }, [data])

  const handleViewOrderDetails = (order: ShopeeOrder) => {
    setSelectedOrder(order)
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground">
            Análise de vendas e performance da Shopee
          </p>
        </div>
        <ShopeeFilters
          onFiltersChange={setFilters}
          availableStatuses={availableStatuses}
          availableStates={availableStates}
          availableProducts={availableProducts}
          data={data}
        />
      </div>

      {/* Métricas Principais */}
      <StatsCards data={data} />

      {/* Main Content with Tabs */}
      <div className="bg-card rounded-lg border">
        <div className="border-b p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Análise de Dados
              </h2>
              <p className="text-muted-foreground">
                {data.length} {data.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
              </p>
            </div>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'orders' | 'products' | 'analytics')}>
              <TabsList>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'orders' | 'products' | 'analytics')}>
          <TabsContent value="orders" className="p-6">
            <OrderTable data={data} onViewDetails={handleViewOrderDetails} />
          </TabsContent>

          <TabsContent value="products" className="p-6">
            <ProductsTable data={data} />
          </TabsContent>

          <TabsContent value="analytics" className="p-6">
            <div className="space-y-6">
              {/* Gráficos Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Vendas por Dia</h3>
                  <SalesChart data={metrics.vendasPorDia} />
                </div>
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Status dos Pedidos</h3>
                  <StatusChart data={metrics.statusPedidos} />
                </div>
              </div>

              {/* Gráficos Secundários */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Vendas por Estado</h3>
                  <StateChart data={metrics.vendasPorEstado} />
                </div>
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
                  <ProductChart data={metrics.produtosMaisVendidos} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
