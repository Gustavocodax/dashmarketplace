'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesChartProps {
  data: Array<{ data: string; vendas: number }>
}

export function SalesChart({ data }: SalesChartProps) {
  
  const formatTooltipValue = (value: number) => formatCurrency(value)
  const formatXAxisLabel = (tickItem: string) => {
    // Garantir que a data seja parseada corretamente
    let date: Date
    if (tickItem.includes('-')) {
      // Formato ISO: 2025-07-31
      const [year, month, day] = tickItem.split('-').map(Number)
      date = new Date(year, month - 1, day) // month é 0-based
    } else {
      date = new Date(tickItem)
    }
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="data" 
            tickFormatter={formatXAxisLabel}
            className="text-xs"
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), 'Vendas']}
            labelFormatter={(label) => `Data: ${formatXAxisLabel(label)}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="vendas" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
