'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Calendar, ChevronDown, Check, MapPin, Package, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
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
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null)
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

  // Função para parsear datas de forma robusta
  function parseDate(dateString: string): Date | null {
    if (!dateString || dateString.trim() === '') return null
    
    // Limpar a string de data
    const cleanDateString = dateString.trim()
    
    // Tentar parseISO primeiro (mais confiável)
    try {
      const parsed = parseISO(cleanDateString)
      if (isValid(parsed)) {
        return parsed
      }
    } catch (e) {
      // Continuar para outros métodos
    }
    
    // Tentar diferentes formatos de data manualmente
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/, // 2025-07-31 14:30
      /^(\d{4})-(\d{2})-(\d{2})$/, // 2025-07-31
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/, // 31/07/2025 14:30
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // 31/07/2025
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/, // 31/07/2025 14:30:00
    ]
    
    for (const format of formats) {
      const match = cleanDateString.match(format)
      if (match) {
        try {
          let year, month, day, hour = 0, minute = 0, second = 0
          
          if (format.source.includes('\\d{4}-\\d{2}-\\d{2}')) {
            // Formato ISO
            year = parseInt(match[1])
            month = parseInt(match[2]) - 1 // JavaScript months are 0-based
            day = parseInt(match[3])
            if (match[4]) hour = parseInt(match[4])
            if (match[5]) minute = parseInt(match[5])
          } else {
            // Formato brasileiro
            day = parseInt(match[1])
            month = parseInt(match[2]) - 1 // JavaScript months are 0-based
            year = parseInt(match[3])
            if (match[4]) hour = parseInt(match[4])
            if (match[5]) minute = parseInt(match[5])
            if (match[6]) second = parseInt(match[6])
          }
          
          const parsed = new Date(year, month, day, hour, minute, second)
          if (isValid(parsed)) {
            return parsed
          }
        } catch (e) {
          continue
        }
      }
    }
    
    // Fallback: tentar parsear diretamente
    try {
      const parsed = new Date(cleanDateString)
      if (isValid(parsed)) {
        return parsed
      }
    } catch (e) {
      // Último recurso
    }
    
    console.warn(`Não foi possível parsear a data: "${dateString}"`)
    return null
  }

  // Extrair datas disponíveis dos dados
  const availableDates = new Set<string>()
  data.forEach((order, index) => {
    const orderDate = parseDate(order["Data de criação do pedido"])
    if (orderDate) {
      const dateStr = format(orderDate, 'yyyy-MM-dd')
      availableDates.add(dateStr)
      
    } else {
      console.warn(`Não foi possível processar data do pedido ${index + 1}: "${order["Data de criação do pedido"]}"`)
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
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 hover:border-orange-500 hover:bg-orange-500/10"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
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
        <div className="absolute top-full left-0 right-0 mt-3 z-50">
          <Card className="shadow-2xl border bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-orange-500/5 to-orange-500/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Filter className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-800">Filtros Avançados</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-orange-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {/* Filtro de Data */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Período</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">De:</label>
                        <Button
                          variant="outline"
                          onClick={() => setShowCalendar(showCalendar === 'start' ? null : 'start')}
                          className="w-full justify-start text-left font-normal hover:border-orange-500"
                        >
                          {filters.dataInicio ? format(filters.dataInicio, 'dd/MM/yyyy') : 'Selecionar data'}
                        </Button>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Até:</label>
                        <Button
                          variant="outline"
                          onClick={() => setShowCalendar(showCalendar === 'end' ? null : 'end')}
                          className="w-full justify-start text-left font-normal hover:border-orange-500"
                        >
                          {filters.dataFim ? format(filters.dataFim, 'dd/MM/yyyy') : 'Selecionar data'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtro de Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Status do Pedido</h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {availableStatuses.map((status, index) => (
                      <label key={`status-${index}-${status}`} className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status) || false}
                            onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            filters.status?.includes(status) 
                              ? 'bg-orange-500 border-orange-500' 
                              : 'border-gray-300 group-hover:border-orange-500/50'
                          }`}>
                            {filters.status?.includes(status) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="flex-1 text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Estado */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Estado</h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {availableStates.map((estado, index) => (
                      <label key={`estado-${index}-${estado}`} className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={filters.estado?.includes(estado) || false}
                            onChange={(e) => handleArrayFilterChange('estado', estado, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            filters.estado?.includes(estado) 
                              ? 'bg-orange-500 border-orange-500' 
                              : 'border-gray-300 group-hover:border-orange-500/50'
                          }`}>
                            {filters.estado?.includes(estado) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="flex-1 text-gray-700">{estado}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Produto */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Produto</h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {availableProducts.slice(0, 8).map((produto, index) => (
                      <label key={`produto-${index}-${produto}`} className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={filters.produto?.includes(produto) || false}
                            onChange={(e) => handleArrayFilterChange('produto', produto, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            filters.produto?.includes(produto) 
                              ? 'bg-orange-500 border-orange-500' 
                              : 'border-gray-300 group-hover:border-orange-500/50'
                          }`}>
                            {filters.produto?.includes(produto) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="flex-1 text-gray-700 truncate" title={produto}>
                          {produto.length > 20 ? `${produto.substring(0, 20)}...` : produto}
                        </span>
                      </label>
                    ))}
                    {availableProducts.length > 8 && (
                      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg text-center">
                        +{availableProducts.length - 8} produtos adicionais
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendário */}
              {showCalendar && (
                <div className="flex justify-center">
                  <CalendarComponent
                    selectedDate={showCalendar === 'start' ? filters.dataInicio : filters.dataFim}
                    onDateSelect={(date) => {
                      if (showCalendar === 'start') {
                        handleDateRangeChange(date, filters.dataFim || null)
                      } else {
                        handleDateRangeChange(filters.dataInicio || null, date)
                      }
                      setShowCalendar(null)
                    }}
                    availableDates={sortedDates}
                  />
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="text-sm text-gray-500">
                  {hasActiveFilters ? 'Filtros ativos aplicados' : 'Nenhum filtro ativo'}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="px-6 py-2 hover:bg-orange-50 hover:border-orange-500"
                  >
                    Limpar Todos
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 shadow-lg"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}