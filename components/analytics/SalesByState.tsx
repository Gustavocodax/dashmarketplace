'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { MapPin, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalesByStateProps {
  data: ShopeeOrder[]
}

export function SalesByState({ data }: SalesByStateProps) {
  const stateData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    const stateMap = new Map<string, { vendas: number; receita: number; pedidos: number }>()
    
    data.forEach(order => {
      const estado = order["UF"] || 'Não informado'
      const receita = order["Valor Total"] || 0
      
      if (stateMap.has(estado)) {
        const existing = stateMap.get(estado)!
        stateMap.set(estado, {
          vendas: existing.vendas + 1,
          receita: existing.receita + receita,
          pedidos: existing.pedidos + 1
        })
      } else {
        stateMap.set(estado, {
          vendas: 1,
          receita,
          pedidos: 1
        })
      }
    })
    
    return Array.from(stateMap.entries())
      .map(([estado, stats]) => ({
        estado,
        ...stats,
        ticketMedio: stats.receita / stats.pedidos
      }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10)
  }, [data])

  const bestState = stateData[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Vendas por Estado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Melhor estado */}
          {bestState && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">Estado com Maior Receita</span>
              </div>
              <p className="text-lg font-bold">{bestState.estado}</p>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Receita</p>
                  <p className="font-semibold text-primary">
                    {formatCurrency(bestState.receita)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pedidos</p>
                  <p className="font-semibold">
                    {formatNumber(bestState.pedidos)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ticket Médio</p>
                  <p className="font-semibold">
                    {formatCurrency(bestState.ticketMedio)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="estado" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'receita' ? formatCurrency(value) : formatNumber(value),
                    name === 'receita' ? 'Receita' : 'Pedidos'
                  ]}
                />
                <Bar 
                  dataKey="receita" 
                  fill="#FF4806" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranking de estados */}
          <div>
            <h4 className="font-medium mb-3">Ranking de Estados</h4>
            <div className="space-y-2">
              {stateData.slice(0, 5).map((state, index) => (
                <div key={`state-${index}-${state.estado}`} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{state.estado}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(state.receita)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(state.pedidos)} pedidos
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
