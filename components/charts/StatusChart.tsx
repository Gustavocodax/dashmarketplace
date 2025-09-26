'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface StatusChartProps {
  data: Array<{ status: string; quantidade: number }>
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'concluído':
      return '#6B7280' // cinza
    case 'cancelado':
      return '#FF4806' // laranja
    case 'em trânsito':
      return '#3B82F6' // azul
    default:
      return '#9CA3AF' // cinza claro
  }
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, quantidade }) => `${status}: ${quantidade}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="quantidade"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Quantidade']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
