'use client'

import { useState, useMemo } from 'react'
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/MetricCard'
import { FilterPanel } from '@/components/FilterPanel'
import { SalesChart } from '@/components/charts/SalesChart'
import { StateChart } from '@/components/charts/StateChart'
import { ProductChart } from '@/components/charts/ProductChart'
import { StatusChart } from '@/components/charts/StatusChart'
import { ProductsTable } from '@/components/ProductsTable'
import { ShopeeOrder, FilterOptions } from '@/types/shopee'
import { processShopeeData } from '@/lib/data-processing'

interface DashboardProps {
  data: ShopeeOrder[]
}

export function Dashboard({ data }: DashboardProps) {
  const [filters, setFilters] = useState<FilterOptions>({})

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
        <FilterPanel
          onFiltersChange={setFilters}
          availableStatuses={availableStatuses}
          availableStates={availableStates}
          availableProducts={availableProducts}
          data={data}
        />
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Vendas"
          value={metrics.totalVendas}
          format="currency"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricCard
          title="Total de Pedidos"
          value={metrics.totalPedidos}
          format="number"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <MetricCard
          title="Ticket Médio"
          value={metrics.ticketMedio}
          format="currency"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          title="Produtos Únicos"
          value={metrics.produtosMaisVendidos.length}
          format="number"
          icon={<Package className="w-4 h-4" />}
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={metrics.vendasPorDia} />
          </CardContent>
        </Card>

        {/* Status dos Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart data={metrics.statusPedidos} />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <StateChart data={metrics.vendasPorEstado} />
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductChart data={metrics.produtosMaisVendidos} />
          </CardContent>
        </Card>
      </div>

      {/* Tabela Completa de Produtos */}
      <ProductsTable data={data} />
    </div>
  )
}
