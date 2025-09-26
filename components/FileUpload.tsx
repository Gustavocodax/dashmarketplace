'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { parseCSVData, parseXLSXData } from '@/lib/data-processing'

interface FileUploadProps {
  onDataLoaded: (data: ShopeeOrder[]) => void
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      let data: ShopeeOrder[]

      if (file.type === 'application/json') {
        const text = await file.text()
        data = JSON.parse(text)
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text()
        data = parseCSVData(text)
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        const buffer = await file.arrayBuffer()
        data = parseXLSXData(buffer)
      } else {
        throw new Error('Formato de arquivo não suportado. Use CSV, JSON ou XLSX.')
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Arquivo não contém dados válidos.')
      }

      onDataLoaded(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
    } finally {
      setIsLoading(false)
    }
  }, [onDataLoaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  return (
    <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-gray-500/20 backdrop-blur-md">
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
            ${isDragOver ? 'border-gray-400 bg-gray-500/10 scale-105' : 'border-gray-400/50'}
            ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400 hover:bg-gray-500/10'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-gray-500/20">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-200" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-100">
                {isLoading ? 'Processando arquivo...' : 'Faça upload dos seus dados'}
              </h3>
              <p className="text-sm text-gray-200/80 max-w-sm">
                Arraste e solte seu arquivo aqui ou clique para selecionar
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-300/70 bg-gray-500/10 px-3 py-1 rounded-full">
              <FileText className="w-3 h-3" />
              <span>CSV, JSON, XLSX</span>
            </div>

            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            <Button
              asChild
              variant="default"
              size="default"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
              </label>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-300" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
