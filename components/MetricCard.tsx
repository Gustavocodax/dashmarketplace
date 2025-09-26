'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percentage'
  icon?: React.ReactNode
}

export function MetricCard({ 
  title, 
  value, 
  previousValue, 
  format = 'currency',
  icon 
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'number':
        return formatNumber(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toString()
    }
  }

  const calculateGrowth = () => {
    if (!previousValue || previousValue === 0) return null
    return ((value - previousValue) / previousValue) * 100
  }

  const growth = calculateGrowth()
  const isPositive = growth !== null && growth > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {growth !== null && (
          <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>{Math.abs(growth).toFixed(1)}% em relação ao período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
