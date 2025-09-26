'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Calendar, TrendingUp } from 'lucide-react'
import { parseISO, format, isValid } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalesByWeekdayProps {
  data: ShopeeOrder[]
}

export function SalesByWeekday({ data }: SalesByWeekdayProps) {
  const weekdayData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    const weekdayMap = new Map<string, { vendas: number; receita: number }>()
    
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    // Inicializar todos os dias da semana
    weekdays.forEach(day => {
      weekdayMap.set(day, { vendas: 0, receita: 0 })
    })
    
    data.forEach(order => {
      const orderDate = parseDate(order["Data de criação do pedido"])
      if (orderDate) {
        const weekday = format(orderDate, 'EEEE')
        const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
        const receita = order["Valor Total"] || 0
        
        // Mapear nomes em inglês para português
        const weekdayMap_pt: { [key: string]: string } = {
          'Monday': 'Segunda',
          'Tuesday': 'Terça', 
          'Wednesday': 'Quarta',
          'Thursday': 'Quinta',
          'Friday': 'Sexta',
          'Saturday': 'Sábado',
          'Sunday': 'Domingo'
        }
        
        const weekdayPt = weekdayMap_pt[weekdayCapitalized] || weekdayCapitalized
        
        const existing = weekdayMap.get(weekdayPt)
        if (existing) {
          weekdayMap.set(weekdayPt, {
            vendas: existing.vendas + 1,
            receita: existing.receita + receita
          })
        }
      }
    })
    
    return weekdays.map(day => ({
      dia: day,
      vendas: weekdayMap.get(day)?.vendas || 0,
      receita: weekdayMap.get(day)?.receita || 0
    }))
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

  const bestDay = weekdayData.reduce((best, current) => 
    current.receita > best.receita ? current : best
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Vendas por Dia da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Melhor dia da semana */}
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">Melhor Dia da Semana</span>
            </div>
            <p className="text-lg font-bold">{bestDay.dia}</p>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Receita</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(bestDay.receita)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendas</p>
                <p className="font-semibold">
                  {formatNumber(bestDay.vendas)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="dia" 
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
