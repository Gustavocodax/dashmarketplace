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
import { ProductRanking } from '@/components/analytics/ProductRanking'
import { VariationRanking } from '@/components/analytics/VariationRanking'
import { BestDaySales } from '@/components/analytics/BestDaySales'
import { SalesByHour } from '@/components/analytics/SalesByHour'
import { SalesByWeekday } from '@/components/analytics/SalesByWeekday'
import { SalesByState } from '@/components/analytics/SalesByState'
import { ABCCurve } from '@/components/analytics/ABCCurve'
import { ShopeeOrder, FilterOptions } from '@/types/shopee'
import { processShopeeData } from '@/lib/data-processing'
import { parseISO, isValid } from 'date-fns'

interface DashboardProps {
  data: ShopeeOrder[]
}

export function Dashboard({ data }: DashboardProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [viewMode, setViewMode] = useState<'orders' | 'products' | 'analytics'>('orders')
  const [selectedOrder, setSelectedOrder] = useState<ShopeeOrder | null>(null)

  // Função para parsear datas
  function parseDate(dateString: string): Date | null {
    if (!dateString || dateString.trim() === '') return null
    
    try {
      const parsed = parseISO(dateString)
      return isValid(parsed) ? parsed : null
    } catch (e) {
      try {
        const parsed = new Date(dateString)
        return isValid(parsed) ? parsed : null
      } catch (e) {
        return null
      }
    }
  }

  // Aplicar filtros aos dados
  const filteredData = useMemo(() => {
    return data.filter(order => {
      // Filtro por busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesSearch = 
          order["Nome do Produto"].toLowerCase().includes(searchLower) ||
          order["ID do pedido"].toLowerCase().includes(searchLower) ||
          order["Nome de usuário (comprador)"].toLowerCase().includes(searchLower) ||
          order["UF"].toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Filtro por data
      if (filters.dataInicio || filters.dataFim) {
        const orderDate = parseDate(order["Data de criação do pedido"])
        if (!orderDate) return false
        
        if (filters.dataInicio && orderDate < filters.dataInicio) return false
        if (filters.dataFim && orderDate > filters.dataFim) return false
      }

      // Filtro por status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(order["Status do pedido"])) return false
      }

      // Filtro por estado
      if (filters.estado && filters.estado.length > 0) {
        if (!filters.estado.includes(order["UF"])) return false
      }

      // Filtro por produto
      if (filters.produto && filters.produto.length > 0) {
        if (!filters.produto.includes(order["Nome do Produto"])) return false
      }

      return true
    })
  }, [data, filters])

  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalVendas: 0,
        totalPedidos: 0,
        ticketMedio: 0,
        taxaConversao: 0,
        vendasPorDia: [],
        vendasPorEstado: [],
        produtosMaisVendidos: [],
        statusPedidos: [],
        receitaPorMes: []
      }
    }
    return processShopeeData(filteredData, {})
  }, [filteredData])

  const availableStatuses = useMemo(() => {
    if (!data || data.length === 0) return []
    return Array.from(new Set(data.map(order => order["Status do pedido"]))).sort()
  }, [data])

  const availableStates = useMemo(() => {
    if (!data || data.length === 0) return []
    return Array.from(new Set(data.map(order => order["UF"]))).sort()
  }, [data])

  const availableProducts = useMemo(() => {
    if (!data || data.length === 0) return []
    return Array.from(new Set(data.map(order => order["Nome do Produto"]))).sort()
  }, [data])

  const handleViewOrderDetails = (order: ShopeeOrder) => {
    setSelectedOrder(order)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Análise de Vendas</h1>
        <p className="text-muted-foreground">
          Análise completa de vendas, produtos e performance da Shopee
        </p>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <ShopeeFilters
          onFiltersChange={setFilters}
          availableStatuses={availableStatuses}
          availableStates={availableStates}
          availableProducts={availableProducts}
          data={data}
        />
        
        {/* Indicador de filtros ativos */}
        {filteredData.length !== data.length && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>
              Filtros ativos: {filteredData.length} de {data.length} pedidos
            </span>
          </div>
        )}
      </div>

      {/* Métricas Principais */}
      <StatsCards data={filteredData} />

      {/* Main Content with Tabs */}
      <div className="bg-card rounded-lg border">
        <div className="border-b p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Análise de Dados
              </h2>
              <p className="text-muted-foreground">
                {filteredData.length} {filteredData.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
                {filteredData.length !== data.length && ` de ${data.length} total`}
              </p>
            </div>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'orders' | 'products' | 'analytics')}>
              <TabsList>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="analytics">Análises</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'orders' | 'products' | 'analytics')}>
            <TabsContent value="orders" className="p-6">
              <OrderTable data={filteredData} onViewDetails={handleViewOrderDetails} />
            </TabsContent>

            <TabsContent value="products" className="p-6">
              <ProductsTable data={filteredData} />
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="space-y-6">
                {/* Análises Principais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProductRanking data={filteredData} />
                  <VariationRanking data={filteredData} />
                </div>

                {/* Análises de Tempo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BestDaySales data={filteredData} />
                  <SalesByHour data={filteredData} />
                </div>

                {/* Análises de Localização */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SalesByWeekday data={filteredData} />
                  <SalesByState data={filteredData} />
                </div>

                {/* Curva ABC */}
                <div className="grid grid-cols-1 gap-6">
                  <ABCCurve data={filteredData} />
                </div>

                {/* Gráficos Tradicionais */}
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
              </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
