'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Trophy, TrendingUp } from 'lucide-react'

interface ProductRankingProps {
  data: ShopeeOrder[]
}

export function ProductRanking({ data }: ProductRankingProps) {
  const productRanking = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    const productMap = new Map<string, { quantidade: number; receita: number; pedidos: number }>()
    
    data.forEach(order => {
      const produto = order["Nome do Produto"]
      const quantidade = order["Quantidade"] || 0
      const receita = order["Valor Total"] || 0
      
      if (productMap.has(produto)) {
        const existing = productMap.get(produto)!
        productMap.set(produto, {
          quantidade: existing.quantidade + quantidade,
          receita: existing.receita + receita,
          pedidos: existing.pedidos + 1
        })
      } else {
        productMap.set(produto, {
          quantidade,
          receita,
          pedidos: 1
        })
      }
    })
    
    return Array.from(productMap.entries())
      .map(([produto, stats]) => ({
        produto,
        ...stats,
        ticketMedio: stats.receita / stats.pedidos
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Ranking de Produtos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productRanking.map((item, index) => (
            <div key={`product-${index}-${item.produto}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={item.produto}>
                    {item.produto.length > 40 ? `${item.produto.substring(0, 40)}...` : item.produto}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(item.pedidos)} pedidos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatNumber(item.quantidade)} unidades
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.receita)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
