'use client'

import { useState } from 'react'
import { Package, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { parseISO, format, isValid } from 'date-fns'

interface ProductDetailsProps {
  data: ShopeeOrder[]
  productName: string
}

export function ProductDetails({ data, productName }: ProductDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Filtrar dados do produto específico
  const productData = data.filter(order => 
    order["Nome do Produto"] === productName
  )

  if (productData.length === 0) return null

  // Calcular estatísticas do produto
  const stats = {
    totalVendas: productData.reduce((sum, order) => sum + (order["Valor Total"] || 0), 0),
    totalQuantidade: productData.reduce((sum, order) => sum + (order["Quantidade"] || 0), 0),
    totalPedidos: productData.length,
    ticketMedio: 0,
    precoMedio: 0,
    primeiraVenda: '',
    ultimaVenda: '',
    estados: new Set<string>(),
    status: new Map<string, number>()
  }

  // Calcular médias
  stats.ticketMedio = stats.totalPedidos > 0 ? stats.totalVendas / stats.totalPedidos : 0
  stats.precoMedio = stats.totalQuantidade > 0 
    ? productData.reduce((sum, order) => sum + (order["Preço acordado"] || 0), 0) / stats.totalQuantidade 
    : 0

  // Encontrar primeira e última venda
  const vendasComData = productData
    .map(order => ({
      data: order["Data de criação do pedido"],
      valor: order["Valor Total"] || 0
    }))
    .filter(venda => venda.data)
    .sort((a, b) => a.data.localeCompare(b.data))

  if (vendasComData.length > 0) {
    stats.primeiraVenda = formatDate(vendasComData[0].data)
    stats.ultimaVenda = formatDate(vendasComData[vendasComData.length - 1].data)
  }

  // Coletar estados e status
  productData.forEach(order => {
    if (order["UF"]) stats.estados.add(order["UF"])
    
    const status = order["Status do pedido"] || 'Não informado'
    stats.status.set(status, (stats.status.get(status) || 0) + 1)
  })

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <CardTitle className="text-lg">Detalhes do Produto</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Expandir'}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {productName}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(stats.totalVendas)}
              </div>
              <div className="text-sm text-muted-foreground">Receita Total</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">
                {formatNumber(stats.totalQuantidade)}
              </div>
              <div className="text-sm text-muted-foreground">Quantidade</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600">
                {formatNumber(stats.totalPedidos)}
              </div>
              <div className="text-sm text-muted-foreground">Pedidos</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-600">
                {formatCurrency(stats.ticketMedio)}
              </div>
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Período de vendas */}
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Período de Vendas</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primeira venda:</span>
                  <span className="font-medium">{stats.primeiraVenda || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última venda:</span>
                  <span className="font-medium">{stats.ultimaVenda || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço médio:</span>
                  <span className="font-medium">{formatCurrency(stats.precoMedio)}</span>
                </div>
              </div>
            </div>

            {/* Distribuição geográfica */}
            <div>
              <h4 className="font-medium mb-3">Estados de Venda</h4>
              <div className="space-y-1">
                {Array.from(stats.estados).map(estado => (
                  <div key={estado} className="flex justify-between text-sm">
                    <span>{estado}</span>
                    <span className="text-muted-foreground">
                      {productData.filter(order => order["UF"] === estado).length} pedido(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status dos pedidos */}
          <div>
            <h4 className="font-medium mb-3">Status dos Pedidos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from(stats.status.entries()).map(([status, count]) => (
                <div key={status} className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="font-medium">{count}</div>
                  <div className="text-xs text-muted-foreground">{status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de vendas */}
          <div>
            <h4 className="font-medium mb-3">Histórico de Vendas</h4>
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {vendasComData.map((venda, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(venda.data)}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(venda.valor)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
