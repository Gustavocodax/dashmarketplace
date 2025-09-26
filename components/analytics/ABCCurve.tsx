'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts'

interface ABCCurveProps {
  data: ShopeeOrder[]
}

export function ABCCurve({ data }: ABCCurveProps) {
  const abcData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    
    const productMap = new Map<string, { quantidade: number; receita: number }>()
    
    data.forEach(order => {
      const produto = order["Nome do Produto"]
      const quantidade = order["Quantidade"] || 0
      const receita = order["Valor Total"] || 0
      
      if (productMap.has(produto)) {
        const existing = productMap.get(produto)!
        productMap.set(produto, {
          quantidade: existing.quantidade + quantidade,
          receita: existing.receita + receita
        })
      } else {
        productMap.set(produto, { quantidade, receita })
      }
    })
    
    const products = Array.from(productMap.entries())
      .map(([produto, stats]) => ({ produto, ...stats }))
      .sort((a, b) => b.receita - a.receita)
    
    const totalReceita = products.reduce((sum, p) => sum + p.receita, 0)
    
    let cumulativeReceita = 0
    return products.map((product, index) => {
      cumulativeReceita += product.receita
      const percentage = (product.receita / totalReceita) * 100
      const cumulativePercentage = (cumulativeReceita / totalReceita) * 100
      
      let category = 'C'
      if (cumulativePercentage <= 80) category = 'A'
      else if (cumulativePercentage <= 95) category = 'B'
      
      return {
        ...product,
        percentage,
        cumulativePercentage,
        category,
        rank: index + 1
      }
    })
  }, [data])

  const categoryStats = useMemo(() => {
    const stats = { A: 0, B: 0, C: 0 }
    abcData.forEach(item => {
      stats[item.category as keyof typeof stats]++
    })
    return stats
  }, [abcData])

  const topProducts = abcData.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Curva ABC de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estatísticas das Categorias */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-semibold text-primary">Categoria A</span>
              </div>
              <p className="text-lg font-bold">{categoryStats.A} produtos</p>
              <p className="text-sm text-muted-foreground">80% da receita</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                <span className="font-semibold">Categoria B</span>
              </div>
              <p className="text-lg font-bold">{categoryStats.B} produtos</p>
              <p className="text-sm text-muted-foreground">15% da receita</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                <span className="font-semibold">Categoria C</span>
              </div>
              <p className="text-lg font-bold">{categoryStats.C} produtos</p>
              <p className="text-sm text-muted-foreground">5% da receita</p>
            </div>
          </div>

          {/* Gráfico da Curva ABC */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="rank" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
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
                    name === 'receita' ? formatCurrency(value) : `${value.toFixed(1)}%`,
                    name === 'receita' ? 'Receita' : 'Percentual Acumulado'
                  ]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="receita" 
                  fill="#FF4806" 
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulativePercentage" 
                  stroke="#FF4806" 
                  strokeWidth={2}
                  dot={{ fill: '#FF4806', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Produtos */}
          <div>
            <h4 className="font-medium mb-3">Top 10 Produtos (Curva ABC)</h4>
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div key={`abc-${index}-${product.produto}`} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium truncate max-w-xs" title={product.produto}>
                      {product.produto}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.category === 'A' ? 'bg-primary/10 text-primary' :
                      product.category === 'B' ? 'bg-muted text-muted-foreground' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(product.receita)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.cumulativePercentage.toFixed(1)}% acumulado
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
