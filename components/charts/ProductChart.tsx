'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ProductChartProps {
  data: Array<{ produto: string; quantidade: number; receita: number }>
}

export function ProductChart({ data }: ProductChartProps) {
  const formatTooltipValue = (value: number) => formatCurrency(value)
  const formatProductName = (name: string) => {
    return name.length > 30 ? `${name.substring(0, 30)}...` : name
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="produto" 
            tickFormatter={formatProductName}
            className="text-xs"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            className="text-xs"
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              formatTooltipValue(value), 
              name === 'receita' ? 'Receita' : 'Quantidade'
            ]}
            labelFormatter={(label) => `Produto: ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Bar 
            dataKey="receita" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
