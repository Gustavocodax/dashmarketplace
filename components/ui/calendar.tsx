'use client'

import { useState } from 'react'
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
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Adicionar dias do mês anterior para preencher a primeira semana
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())

  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))

  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availableDates.includes(dateStr)
  }

  const isDateSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate)
  }

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      onDateSelect(isDateSelected(date) ? null : date)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onDateSelect(today)
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0 hover:bg-gray-100"
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
                    ? 'text-gray-700 hover:bg-primary/10 cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
                }
                ${isSelected 
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-md' 
                  : isTodayDate && isAvailable
                    ? 'bg-primary/20 text-primary font-semibold'
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
          className="text-primary hover:text-primary/80"
        >
          Hoje
        </Button>
      </div>
    </div>
  )
}
