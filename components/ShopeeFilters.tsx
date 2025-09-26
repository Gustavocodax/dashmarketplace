'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterOptions, ShopeeOrder } from '@/types/shopee'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    const newFilters = {
      ...filters,
      dataInicio: startDate || undefined,
      dataFim: endDate || undefined
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

  // Função para parsear datas
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
  const availableDates = new Set<string>()
  data.forEach(order => {
    const orderDate = parseDate(order["Data de criação do pedido"])
    if (orderDate) {
      availableDates.add(format(orderDate, 'yyyy-MM-dd'))
    }
  })

  const sortedDates = Array.from(availableDates).sort()

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Barra de busca e botão de filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produtos, pedidos ou clientes..."
            value={searchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value
              setSearchTerm(newSearchTerm)
              
              const newFilters = {
                ...filters,
                searchTerm: newSearchTerm.trim() || undefined
              }
              onFiltersChange(newFilters)
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
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
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Painel de filtros - Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtros Avançados</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Filtro de Data */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Período</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Datas disponíveis: {sortedDates.length}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">De:</label>
                        <input
                          type="date"
                          value={filters.dataInicio ? format(filters.dataInicio, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null
                            handleDateRangeChange(date, filters.dataFim || null)
                          }}
                          min={sortedDates[0]}
                          max={sortedDates[sortedDates.length - 1]}
                          className="w-full p-2 text-xs border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Até:</label>
                        <input
                          type="date"
                          value={filters.dataFim ? format(filters.dataFim, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null
                            handleDateRangeChange(filters.dataInicio || null, date)
                          }}
                          min={sortedDates[0]}
                          max={sortedDates[sortedDates.length - 1]}
                          className="w-full p-2 text-xs border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtro de Status */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Status do Pedido</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableStatuses.map((status, index) => (
                      <label key={`status-${index}-${status}`} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={filters.status?.includes(status) || false}
                          onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="flex-1">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Estado */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Estado</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableStates.map((estado, index) => (
                      <label key={`estado-${index}-${estado}`} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={filters.estado?.includes(estado) || false}
                          onChange={(e) => handleArrayFilterChange('estado', estado, e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="flex-1">{estado}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Produto */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Produto</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableProducts.slice(0, 10).map((produto, index) => (
                      <label key={`produto-${index}-${produto}`} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={filters.produto?.includes(produto) || false}
                          onChange={(e) => handleArrayFilterChange('produto', produto, e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="flex-1 truncate" title={produto}>
                          {produto.length > 25 ? `${produto.substring(0, 25)}...` : produto}
                        </span>
                      </label>
                    ))}
                    {availableProducts.length > 10 && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                        +{availableProducts.length - 10} produtos adicionais
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Limpar Todos
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}