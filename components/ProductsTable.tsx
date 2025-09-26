'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, TrendingUp, Package, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ProductDetails } from './ProductDetails'

interface ProductsTableProps {
  data: ShopeeOrder[]
}

type SortField = 'produto' | 'quantidade' | 'receita' | 'ticketMedio' | 'pedidos'
type SortDirection = 'asc' | 'desc'

export function ProductsTable({ data }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('receita')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  // Processar dados dos produtos
  const productsData = useMemo(() => {
    const productsMap = new Map<string, {
      produto: string
      quantidade: number
      receita: number
      pedidos: number
      ticketMedio: number
      precoMedio: number
    }>()

    data.forEach(order => {
      const produto = order["Nome do Produto"] || 'Produto não informado'
      const quantidade = order["Quantidade"] || 0
      const receita = order["Valor Total"] || 0
      const precoUnitario = order["Preço acordado"] || 0

      const current = productsMap.get(produto) || {
        produto,
        quantidade: 0,
        receita: 0,
        pedidos: 0,
        ticketMedio: 0,
        precoMedio: 0
      }

      productsMap.set(produto, {
        produto,
        quantidade: current.quantidade + quantidade,
        receita: current.receita + receita,
        pedidos: current.pedidos + 1,
        ticketMedio: current.ticketMedio + receita,
        precoMedio: current.precoMedio + precoUnitario
      })
    })

    // Calcular médias
    const products = Array.from(productsMap.values()).map(product => ({
      ...product,
      ticketMedio: product.pedidos > 0 ? product.ticketMedio / product.pedidos : 0,
      precoMedio: product.quantidade > 0 ? product.precoMedio / product.quantidade : 0
    }))

    return products
  }, [data])

  // Filtrar e ordenar produtos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = productsData

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.produto.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [productsData, searchTerm, sortField, sortDirection])

  // Função para ordenar
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Função para renderizar cabeçalho da tabela
  const renderHeader = (field: SortField, label: string) => (
    <th className="text-left p-3 font-medium">
      <button
        onClick={() => handleSort(field)}
        className="flex items-center space-x-1 hover:text-primary transition-colors"
      >
        <span>{label}</span>
        <ArrowUpDown className="w-3 h-3" />
        {sortField === field && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>
    </th>
  )

  // Calcular totais
  const totals = useMemo(() => {
    return filteredAndSortedProducts.reduce((acc, product) => ({
      quantidade: acc.quantidade + product.quantidade,
      receita: acc.receita + product.receita,
      pedidos: acc.pedidos + product.pedidos
    }), { quantidade: 0, receita: 0, pedidos: 0 })
  }, [filteredAndSortedProducts])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <CardTitle>Análise de Produtos</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedProducts.length} produto(s) encontrado(s)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Barra de busca */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {renderHeader('produto', 'Produto')}
                {renderHeader('quantidade', 'Quantidade')}
                {renderHeader('pedidos', 'Pedidos')}
                {renderHeader('receita', 'Receita Total')}
                {renderHeader('ticketMedio', 'Ticket Médio')}
                <th className="text-left p-3 font-medium">Preço Médio</th>
                <th className="text-left p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProducts.map((product, index) => (
                <tr key={`product-table-${index}-${product.produto}`} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="max-w-xs">
                      <div className="font-medium truncate" title={product.produto}>
                        {product.produto}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{index + 1} no ranking
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span className="font-medium">{formatNumber(product.quantidade)}</span>
                      {index < 3 && (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-medium">{formatNumber(product.pedidos)}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-medium text-green-600">
                      {formatCurrency(product.receita)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-medium">
                      {formatCurrency(product.ticketMedio)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-muted-foreground">
                      {formatCurrency(product.precoMedio)}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedProduct(
                        expandedProduct === product.produto ? null : product.produto
                      )}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Detalhes</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 font-medium">
                <td className="p-3">Total</td>
                <td className="p-3 text-right">{formatNumber(totals.quantidade)}</td>
                <td className="p-3 text-right">{formatNumber(totals.pedidos)}</td>
                <td className="p-3 text-right text-green-600">
                  {formatCurrency(totals.receita)}
                </td>
                <td className="p-3 text-right">
                  {formatCurrency(totals.pedidos > 0 ? totals.receita / totals.pedidos : 0)}
                </td>
                <td className="p-3 text-right">-</td>
                <td className="p-3">-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Detalhes do produto expandido */}
        {expandedProduct && (
          <ProductDetails 
            data={data} 
            productName={expandedProduct} 
          />
        )}

        {/* Resumo dos produtos */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {filteredAndSortedProducts.length}
            </div>
            <div className="text-sm text-muted-foreground">Produtos Únicos</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(totals.quantidade)}
            </div>
            <div className="text-sm text-muted-foreground">Total Vendido</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(totals.pedidos)}
            </div>
            <div className="text-sm text-muted-foreground">Total Pedidos</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totals.receita)}
            </div>
            <div className="text-sm text-muted-foreground">Receita Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
