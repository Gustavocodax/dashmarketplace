'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface StateChartProps {
  data: Array<{ estado: string; vendas: number }>
}

export function StateChart({ data }: StateChartProps) {
  const formatTooltipValue = (value: number) => formatCurrency(value)

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="estado" 
            className="text-xs"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), 'Vendas']}
            labelFormatter={(label) => `Estado: ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Bar 
            dataKey="vendas" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
