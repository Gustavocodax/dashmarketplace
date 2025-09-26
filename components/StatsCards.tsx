'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  data: ShopeeOrder[]
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = useMemo(() => {
    const totalVendas = data.reduce((sum, order) => sum + (order["Valor Total"] || 0), 0)
    const totalPedidos = data.length
    const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0
    
    // Produtos únicos
    const produtosUnicos = new Set(data.map(order => order["Nome do Produto"])).size
    
    // Vendas de hoje (assumindo que os dados são recentes)
    const hoje = new Date().toISOString().split('T')[0]
    const vendasHoje = data.filter(order => 
      order["Data de criação do pedido"]?.startsWith(hoje)
    ).reduce((sum, order) => sum + (order["Valor Total"] || 0), 0)

    return {
      totalVendas,
      totalPedidos,
      ticketMedio,
      produtosUnicos,
      vendasHoje
    }
  }, [data])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalVendas)}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold">
                {formatNumber(stats.totalPedidos)}
              </p>
            </div>
            <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.ticketMedio)}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produtos Únicos</p>
              <p className="text-2xl font-bold">
                {formatNumber(stats.produtosUnicos)}
              </p>
            </div>
            <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
