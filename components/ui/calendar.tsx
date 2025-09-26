'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CalendarProps {
  selectedDate?: Date | null
  onDateSelect: (date: Date | null) => void
  availableDates?: string[]
  className?: string
}

export function Calendar({ selectedDate, onDateSelect, availableDates = [], className = '' }: CalendarProps) {
  // Memoizar o processamento dos meses disponíveis
  const { firstMonth, lastMonth, availableDatesSet } = useMemo(() => {
    const availableMonths = new Set<string>()
    const datesSet = new Set(availableDates)
    
    availableDates.forEach(dateStr => {
      const date = new Date(dateStr)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      availableMonths.add(monthKey)
    })

    const sortedMonths = Array.from(availableMonths).sort()
    const first = sortedMonths[0] ? new Date(parseInt(sortedMonths[0].split('-')[0]), parseInt(sortedMonths[0].split('-')[1])) : new Date()
    const last = sortedMonths[sortedMonths.length - 1] ? new Date(parseInt(sortedMonths[sortedMonths.length - 1].split('-')[0]), parseInt(sortedMonths[sortedMonths.length - 1].split('-')[1])) : new Date()

    return { firstMonth: first, lastMonth: last, availableDatesSet: datesSet }
  }, [availableDates])

  const [currentMonth, setCurrentMonth] = useState(() => {
    // Se há uma data selecionada e ela tem dados, usar ela
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
      if (availableDatesSet.has(selectedDateStr)) {
        return selectedDate
      }
    }
    // Caso contrário, usar o primeiro mês com dados
    return firstMonth
  })

  // Memoizar os dias do calendário
  const { monthStart, monthEnd, allDays } = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)

    // Adicionar dias do mês anterior para preencher a primeira semana
    const startDate = new Date(start)
    startDate.setDate(startDate.getDate() - start.getDay())

    const endDate = new Date(end)
    endDate.setDate(endDate.getDate() + (6 - end.getDay()))

    return {
      monthStart: start,
      monthEnd: end,
      allDays: eachDayOfInterval({ start: startDate, end: endDate })
    }
  }, [currentMonth])

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const isDateAvailable = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availableDatesSet.has(dateStr)
  }, [availableDatesSet])

  // Verificar se o mês atual tem dados disponíveis
  const currentMonthHasData = useMemo(() => {
    return availableDates.some(dateStr => {
      const date = new Date(dateStr)
      return date.getFullYear() === currentMonth.getFullYear() && 
             date.getMonth() === currentMonth.getMonth()
    })
  }, [availableDates, currentMonth])

  // Garantir que o calendário sempre esteja em um mês com dados
  useEffect(() => {
    if (!currentMonthHasData && availableDates.length > 0) {
      // Se o mês atual não tem dados, navegar para o primeiro mês com dados
      setCurrentMonth(firstMonth)
    }
  }, [currentMonthHasData, availableDates.length, firstMonth])

  const isDateSelected = useCallback((date: Date) => {
    return selectedDate && isSameDay(date, selectedDate)
  }, [selectedDate])

  const handleDateClick = useCallback((date: Date) => {
    if (isDateAvailable(date)) {
      onDateSelect(isDateSelected(date) ? null : date)
    }
  }, [isDateAvailable, isDateSelected, onDateSelect])

  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1)
    
    // Verificar se o mês anterior tem dados disponíveis
    const hasDataInPrevMonth = availableDates.some(dateStr => {
      const date = new Date(dateStr)
      return date.getFullYear() === prevMonth.getFullYear() && 
             date.getMonth() === prevMonth.getMonth()
    })
    
    if (hasDataInPrevMonth) {
      setCurrentMonth(prevMonth)
    }
  }

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1)
    
    // Verificar se o próximo mês tem dados disponíveis
    const hasDataInNextMonth = availableDates.some(dateStr => {
      const date = new Date(dateStr)
      return date.getFullYear() === nextMonth.getFullYear() && 
             date.getMonth() === nextMonth.getMonth()
    })
    
    if (hasDataInNextMonth) {
      setCurrentMonth(nextMonth)
    }
  }

  const goToToday = () => {
    const today = new Date()
    if (isDateAvailable(today)) {
      setCurrentMonth(today)
      onDateSelect(today)
    } else {
      // Se hoje não tem dados, vai para o primeiro mês disponível
      setCurrentMonth(firstMonth)
      // Selecionar a primeira data disponível
      if (availableDates.length > 0) {
        const firstDate = new Date(availableDates[0])
        onDateSelect(firstDate)
      } else {
        onDateSelect(null)
      }
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={!availableDates.some(dateStr => {
              const date = new Date(dateStr)
              const prevMonth = subMonths(currentMonth, 1)
              return date.getFullYear() === prevMonth.getFullYear() && 
                     date.getMonth() === prevMonth.getMonth()
            })}
            className="h-8 w-8 p-0 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            disabled={!availableDates.some(dateStr => {
              const date = new Date(dateStr)
              const nextMonth = addMonths(currentMonth, 1)
              return date.getFullYear() === nextMonth.getFullYear() && 
                     date.getMonth() === nextMonth.getMonth()
            })}
            className="h-8 w-8 p-0 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {currentMonthHasData ? (
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isAvailable = isDateAvailable(day)
            const isSelected = isDateSelected(day)
            const isTodayDate = isToday(day)

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={!isAvailable}
                className={`
                  h-10 w-10 text-sm rounded-lg transition-all duration-200 flex items-center justify-center
                  ${!isCurrentMonth 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : isAvailable 
                      ? 'text-gray-700 hover:bg-orange-100 cursor-pointer' 
                      : 'text-gray-400 cursor-not-allowed'
                  }
                  ${isSelected 
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md' 
                    : isTodayDate && isAvailable
                      ? 'bg-orange-200 text-orange-700 font-semibold'
                      : ''
                  }
                  ${isAvailable && !isSelected ? 'hover:scale-105' : ''}
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <div className="text-center">
            <div className="text-sm">Nenhuma data disponível</div>
            <div className="text-xs text-gray-400 mt-1">neste mês</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateSelect(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          Limpar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-orange-600 hover:text-orange-700"
        >
          Hoje
        </Button>
      </div>
    </div>
  )
}
