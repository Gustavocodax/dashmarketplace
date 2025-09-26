'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Palette, Award } from 'lucide-react'

interface VariationRankingProps {
  data: ShopeeOrder[]
}

export function VariationRanking({ data }: VariationRankingProps) {
  const variationRanking = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    const variationMap = new Map<string, { quantidade: number; receita: number; pedidos: number }>()
    
    data.forEach(order => {
      const variacao = order["Nome da variação"] || 'Sem variação'
      const quantidade = order["Quantidade"] || 0
      const receita = order["Valor Total"] || 0
      
      if (variationMap.has(variacao)) {
        const existing = variationMap.get(variacao)!
        variationMap.set(variacao, {
          quantidade: existing.quantidade + quantidade,
          receita: existing.receita + receita,
          pedidos: existing.pedidos + 1
        })
      } else {
        variationMap.set(variacao, {
          quantidade,
          receita,
          pedidos: 1
        })
      }
    })
    
    return Array.from(variationMap.entries())
      .map(([variacao, stats]) => ({
        variacao,
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
          <Palette className="w-5 h-5 text-primary" />
          Ranking de Variações Mais Vendidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {variationRanking.map((item, index) => (
            <div key={`variation-${index}-${item.variacao}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={item.variacao}>
                    {item.variacao}
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
