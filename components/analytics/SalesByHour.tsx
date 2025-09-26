'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Clock, BarChart3 } from 'lucide-react'
import { parseISO, format, isValid } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalesByHourProps {
  data: ShopeeOrder[]
}

export function SalesByHour({ data }: SalesByHourProps) {
  const hourlyData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    const hourMap = new Map<number, { vendas: number; receita: number }>()
    
    // Inicializar todas as horas com 0
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, { vendas: 0, receita: 0 })
    }
    
    data.forEach(order => {
      const orderDate = parseDate(order["Data de criação do pedido"])
      if (orderDate) {
        const hour = orderDate.getHours()
        const receita = order["Valor Total"] || 0
        
        const existing = hourMap.get(hour)
        if (existing) {
          hourMap.set(hour, {
            vendas: existing.vendas + 1,
            receita: existing.receita + receita
          })
        }
      }
    })
    
    return Array.from(hourMap.entries())
      .map(([hour, stats]) => ({
        hora: `${hour.toString().padStart(2, '0')}:00`,
        vendas: stats.vendas,
        receita: stats.receita
      }))
      .sort((a, b) => parseInt(a.hora) - parseInt(b.hora))
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

  const bestHour = hourlyData.reduce((best, current) => 
    current.receita > best.receita ? current : best
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Vendas por Horário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Melhor horário */}
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">Melhor Horário</span>
            </div>
            <p className="text-lg font-bold">{bestHour.hora}</p>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Receita</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(bestHour.receita)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendas</p>
                <p className="font-semibold">
                  {formatNumber(bestHour.vendas)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hora" 
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
                    name === 'receita' ? 'Receita' : 'Vendas'
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
        </div>
      </CardContent>
    </Card>
  )
}
