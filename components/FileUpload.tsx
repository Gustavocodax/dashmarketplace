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

  const loadExampleData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/data/exemplo-shopee.json')
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de exemplo')
      }
      const data = await response.json()
      onDataLoaded(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de exemplo')
    } finally {
      setIsLoading(false)
    }
  }, [onDataLoaded])

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isLoading ? 'Processando arquivo...' : 'Faça upload dos dados da Shopee'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Arraste e solte seu arquivo CSV, JSON ou XLSX aqui, ou clique para selecionar
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Formatos suportados: CSV, JSON, XLSX</span>
            </div>

            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                variant="outline"
                disabled={isLoading}
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  Selecionar Arquivo
                </label>
              </Button>
              
              <Button
                variant="secondary"
                onClick={loadExampleData}
                disabled={isLoading}
              >
                Carregar Dados de Exemplo
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
