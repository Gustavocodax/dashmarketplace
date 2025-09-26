'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderTableProps {
  data: ShopeeOrder[]
  onViewDetails: (order: ShopeeOrder) => void
}

type SortField = 'data' | 'produto' | 'valor' | 'status' | 'cliente'
type SortDirection = 'asc' | 'desc'

export function OrderTable({ data, onViewDetails }: OrderTableProps) {
  const [sortField, setSortField] = useState<SortField>('data')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Ordenar dados
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'data':
          aValue = new Date(a["Data de criação do pedido"]).getTime()
          bValue = new Date(b["Data de criação do pedido"]).getTime()
          break
        case 'produto':
          aValue = a["Nome do Produto"].toLowerCase()
          bValue = b["Nome do Produto"].toLowerCase()
          break
        case 'valor':
          aValue = a["Valor Total"] || 0
          bValue = b["Valor Total"] || 0
          break
        case 'status':
          aValue = a["Status do pedido"].toLowerCase()
          bValue = b["Status do pedido"].toLowerCase()
          break
        case 'cliente':
          aValue = a["Nome de usuário (comprador)"].toLowerCase()
          bValue = b["Nome de usuário (comprador)"].toLowerCase()
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [data, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
        return 'bg-gray-100 text-gray-700'
      case 'em trânsito':
        return 'bg-blue-100 text-blue-700'
      case 'cancelado':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {renderHeader('data', 'Data')}
            {renderHeader('produto', 'Produto')}
            {renderHeader('cliente', 'Cliente')}
            {renderHeader('status', 'Status')}
            {renderHeader('valor', 'Valor')}
            <th className="text-left p-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((order, index) => (
            <tr key={`${order["ID do pedido"]}-${index}`} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-3">
                <div className="text-sm">
                  {formatDate(order["Data de criação do pedido"])}
                </div>
              </td>
              <td className="p-3">
                <div className="max-w-xs">
                  <div className="font-medium truncate" title={order["Nome do Produto"]}>
                    {order["Nome do Produto"]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Qtd: {order["Quantidade"]}
                  </div>
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm">
                  {order["Nome de usuário (comprador)"]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {order["UF"]}
                </div>
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order["Status do pedido"])}`}>
                  {order["Status do pedido"]}
                </span>
              </td>
              <td className="p-3">
                <span className="font-medium text-gray-600">
                  {formatCurrency(order["Valor Total"])}
                </span>
              </td>
              <td className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(order)}
                  className="flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
