'use client'

import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterOptions, ShopeeOrder } from '@/types/shopee'
import { DateRangeSelector } from './DateRangeSelector'

interface ShopeeFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  availableStatuses: string[]
  availableStates: string[]
  availableProducts: string[]
  data: ShopeeOrder[]
}

export function ShopeeFilters({ 
  onFiltersChange, 
  availableStatuses, 
  availableStates, 
  availableProducts,
  data
}: ShopeeFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    const newFilters = {
      ...filters,
      dataInicio: startDate,
      dataFim: endDate
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleArrayFilterChange = (
    field: 'status' | 'estado' | 'produto',
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[field] || []
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    const newFilters = {
      ...filters,
      [field]: newArray.length > 0 ? newArray : undefined
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {}
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    setSearchTerm('')
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar produtos, pedidos ou clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Painel de filtros */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros Avançados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtro de Data */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Período</span>
              </h4>
              <DateRangeSelector
                data={data}
                onDateRangeChange={handleDateRangeChange}
                currentStartDate={filters.dataInicio}
                currentEndDate={filters.dataFim}
              />
            </div>

            {/* Filtro de Status */}
            <div className="space-y-3">
              <h4 className="font-medium">Status do Pedido</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {availableStatuses.map(status => (
                  <label key={status} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Estado */}
            <div className="space-y-3">
              <h4 className="font-medium">Estado</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {availableStates.map(estado => (
                  <label key={estado} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.estado?.includes(estado) || false}
                      onChange={(e) => handleArrayFilterChange('estado', estado, e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>{estado}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Produto */}
            <div className="space-y-3">
              <h4 className="font-medium">Produto</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {availableProducts.slice(0, 10).map(produto => (
                  <label key={produto} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.produto?.includes(produto) || false}
                      onChange={(e) => handleArrayFilterChange('produto', produto, e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="truncate" title={produto}>
                      {produto.length > 30 ? `${produto.substring(0, 30)}...` : produto}
                    </span>
                  </label>
                ))}
                {availableProducts.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    +{availableProducts.length - 10} produtos adicionais
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
