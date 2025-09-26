'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { Calendar, TrendingUp } from 'lucide-react'
import { parseISO, format, isValid } from 'date-fns'

interface BestDaySalesProps {
  data: ShopeeOrder[]
}

export function BestDaySales({ data }: BestDaySalesProps) {
  const bestDayData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { bestDay: null, topDays: [] }
    }
    
    const dayMap = new Map<string, { vendas: number; pedidos: number; receita: number }>()
    
    data.forEach(order => {
      const orderDate = parseDate(order["Data de criação do pedido"])
      if (orderDate) {
        const dayKey = format(orderDate, 'yyyy-MM-dd')
        const receita = order["Valor Total"] || 0
        
        if (dayMap.has(dayKey)) {
          const existing = dayMap.get(dayKey)!
          dayMap.set(dayKey, {
            vendas: existing.vendas + 1,
            pedidos: existing.pedidos + 1,
            receita: existing.receita + receita
          })
        } else {
          dayMap.set(dayKey, {
            vendas: 1,
            pedidos: 1,
            receita
          })
        }
      }
    })
    
    const sortedDays = Array.from(dayMap.entries())
      .map(([day, stats]) => ({
        data: day,
        ...stats,
        ticketMedio: stats.receita / stats.pedidos
      }))
      .sort((a, b) => b.receita - a.receita)
    
    return {
      bestDay: sortedDays[0],
      topDays: sortedDays.slice(0, 5)
    }
  }, [data])

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

  if (!bestDayData.bestDay) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Melhor Dia de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Melhor Dia de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Melhor dia destacado */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">Melhor Dia</span>
            </div>
            <p className="text-lg font-bold">
              {format(parseISO(bestDayData.bestDay.data), 'dd/MM/yyyy')}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
              <div>
                <p className="text-muted-foreground">Receita</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(bestDayData.bestDay.receita)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Pedidos</p>
                <p className="font-semibold">
                  {formatNumber(bestDayData.bestDay.pedidos)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ticket Médio</p>
                <p className="font-semibold">
                  {formatCurrency(bestDayData.bestDay.ticketMedio)}
                </p>
              </div>
            </div>
          </div>

          {/* Top 5 dias */}
          <div>
            <h4 className="font-medium mb-3">Top 5 Dias</h4>
            <div className="space-y-2">
              {bestDayData.topDays.map((day, index) => (
                <div key={`day-${index}-${day.data}`} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">
                      {format(parseISO(day.data), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(day.receita)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(day.pedidos)} pedidos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
