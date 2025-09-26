'use client'

import { useState, useMemo } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterOptions, ShopeeOrder } from '@/types/shopee'
import { parseISO, format, isValid } from 'date-fns'
import { DateRangeSelector } from './DateRangeSelector'

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void
  availableStatuses: string[]
  availableStates: string[]
  availableProducts: string[]
  data: ShopeeOrder[]
}

export function FilterPanel({ 
  onFiltersChange, 
  availableStatuses, 
  availableStates, 
  availableProducts,
  data
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isOpen, setIsOpen] = useState(false)

  // Função para parsear datas de forma robusta
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

  // Extrair datas disponíveis dos dados
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    
    data.forEach(order => {
      const orderDate = parseDate(order["Data de criação do pedido"])
      if (orderDate) {
        dates.add(format(orderDate, 'yyyy-MM-dd'))
      }
    })
    
    return Array.from(dates).sort()
  }, [data])

  // Encontrar data mínima e máxima
  const dateRange = useMemo(() => {
    if (availableDates.length === 0) return { min: '', max: '' }
    
    return {
      min: availableDates[0],
      max: availableDates[availableDates.length - 1]
    }
  }, [availableDates])

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
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="relative">
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

      {isOpen && (
        <Card className="absolute top-12 left-0 z-50 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtro de Data */}
            <div className="space-y-3">
              <h4 className="font-medium">Período</h4>
              <div className="text-xs text-muted-foreground mb-2">
                Período disponível: {dateRange.min} até {dateRange.max}
              </div>
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
                      className="rounded"
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
                      className="rounded"
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
                      className="rounded"
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

            {/* Botão Limpar */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
