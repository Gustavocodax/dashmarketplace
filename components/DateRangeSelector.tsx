'use client'

import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { parseISO, format, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateRangeSelectorProps {
  data: ShopeeOrder[]
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void
  currentStartDate?: Date
  currentEndDate?: Date
}

export function DateRangeSelector({ 
  data, 
  onDateRangeChange, 
  currentStartDate, 
  currentEndDate 
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(currentStartDate || null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(currentEndDate || null)
  
  // Encontrar meses com dados disponíveis
  const monthsWithData = useMemo(() => {
    const months = new Set<string>()
    
    data.forEach(order => {
      const orderDate = parseDate(order["Data de criação do pedido"])
      if (orderDate) {
        months.add(format(orderDate, 'yyyy-MM'))
      }
    })
    
    return Array.from(months).sort()
  }, [data])

  // Definir mês inicial como o primeiro mês com dados
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (monthsWithData.length > 0) {
      const [year, month] = monthsWithData[0].split('-')
      return new Date(parseInt(year), parseInt(month) - 1)
    }
    return new Date()
  })

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
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    
    data.forEach(order => {
      const orderDate = parseDate(order["Data de criação do pedido"])
      if (orderDate) {
        dates.add(format(orderDate, 'yyyy-MM-dd'))
      }
    })
    
    return dates
  }, [data])

  // Encontrar data mínima e máxima
  const dateRange = useMemo(() => {
    const dates = Array.from(availableDates).sort()
    if (dates.length === 0) return { min: new Date(), max: new Date() }
    
    return {
      min: new Date(dates[0]),
      max: new Date(dates[dates.length - 1])
    }
  }, [availableDates])

  // Gerar dias do mês atual
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Verificar se uma data tem dados
  const hasData = (date: Date) => {
    return availableDates.has(format(date, 'yyyy-MM-dd'))
  }

  // Verificar se uma data está selecionada
  const isSelected = (date: Date) => {
    if (!selectedStartDate) return false
    if (!selectedEndDate) return isSameDay(date, selectedStartDate)
    return date >= selectedStartDate && date <= selectedEndDate
  }

  // Verificar se uma data é o início ou fim da seleção
  const isRangeStart = (date: Date) => {
    return selectedStartDate && isSameDay(date, selectedStartDate)
  }

  const isRangeEnd = (date: Date) => {
    return selectedEndDate && isSameDay(date, selectedEndDate)
  }

  // Lidar com clique em uma data
  const handleDateClick = (date: Date) => {
    if (!hasData(date)) return

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Primeira seleção ou nova seleção
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    } else if (selectedStartDate && !selectedEndDate) {
      // Segunda seleção
      if (date < selectedStartDate) {
        setSelectedStartDate(date)
        setSelectedEndDate(selectedStartDate)
      } else {
        setSelectedEndDate(date)
      }
    }
  }

  // Aplicar seleção
  const applySelection = () => {
    onDateRangeChange(selectedStartDate, selectedEndDate)
    setIsOpen(false)
  }

  // Limpar seleção
  const clearSelection = () => {
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    onDateRangeChange(null, null)
    setIsOpen(false)
  }

  // Navegar entre meses (apenas meses com dados)
  const goToPreviousMonth = () => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM')
    const currentIndex = monthsWithData.indexOf(currentMonthStr)
    if (currentIndex > 0) {
      const [year, month] = monthsWithData[currentIndex - 1].split('-')
      setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1))
    }
  }

  const goToNextMonth = () => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM')
    const currentIndex = monthsWithData.indexOf(currentMonthStr)
    if (currentIndex < monthsWithData.length - 1) {
      const [year, month] = monthsWithData[currentIndex + 1].split('-')
      setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1))
    }
  }

  // Verificar se pode navegar
  const canGoPrevious = () => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM')
    return monthsWithData.indexOf(currentMonthStr) > 0
  }

  const canGoNext = () => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM')
    return monthsWithData.indexOf(currentMonthStr) < monthsWithData.length - 1
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Calendar className="w-4 h-4" />
        <span>
          {selectedStartDate && selectedEndDate
            ? `${format(selectedStartDate, 'dd/MM')} - ${format(selectedEndDate, 'dd/MM')}`
            : selectedStartDate
            ? format(selectedStartDate, 'dd/MM/yyyy')
            : 'Selecionar Período'}
        </span>
      </Button>

      {isOpen && (
        <Card className="absolute top-12 left-0 z-50 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Selecionar Período</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de mês */}
            {monthsWithData.length > 1 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês com dados:</label>
                <div className="grid grid-cols-2 gap-2">
                  {monthsWithData.map(monthStr => {
                    const [year, month] = monthStr.split('-')
                    const monthDate = new Date(parseInt(year), parseInt(month) - 1)
                    const isCurrentMonth = format(currentMonth, 'yyyy-MM') === monthStr
                    
                    return (
                      <button
                        key={monthStr}
                        onClick={() => setCurrentMonth(monthDate)}
                        className={`
                          p-2 text-sm rounded border transition-colors
                          ${isCurrentMonth 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background hover:bg-secondary border-border'
                          }
                        `}
                      >
                        {format(monthDate, 'MMM yyyy', { locale: ptBR })}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="font-medium">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h3>
                <p className="text-xs text-muted-foreground">Único mês com dados</p>
              </div>
            )}

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground p-1">
                  {day}
                </div>
              ))}
              {monthDays.map(date => {
                const hasDataForDate = hasData(date)
                const isSelectedDate = isSelected(date)
                const isStartDate = isRangeStart(date)
                const isEndDate = isRangeEnd(date)

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    disabled={!hasDataForDate}
                    className={`
                      p-1 text-xs rounded transition-colors
                      ${hasDataForDate 
                        ? 'hover:bg-primary/20 cursor-pointer' 
                        : 'text-muted-foreground cursor-not-allowed opacity-50'
                      }
                      ${isSelectedDate 
                        ? 'bg-primary text-primary-foreground' 
                        : hasDataForDate 
                        ? 'hover:bg-primary/10' 
                        : ''
                      }
                      ${isStartDate ? 'rounded-l-full' : ''}
                      ${isEndDate ? 'rounded-r-full' : ''}
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>

            {/* Informações do período */}
            <div className="text-xs text-muted-foreground">
              <p>Período disponível: {format(dateRange.min, 'dd/MM/yyyy')} até {format(dateRange.max, 'dd/MM/yyyy')}</p>
              {selectedStartDate && (
                <p>
                  Selecionado: {format(selectedStartDate, 'dd/MM/yyyy')}
                  {selectedEndDate && ` - ${format(selectedEndDate, 'dd/MM/yyyy')}`}
                </p>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearSelection}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                onClick={applySelection}
                className="flex-1"
                disabled={!selectedStartDate}
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
