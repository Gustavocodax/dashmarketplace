'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Dashboard } from '@/components/Dashboard'
import { ShopeeOrder } from '@/types/shopee'

export default function Home() {
  const [data, setData] = useState<ShopeeOrder[] | null>(null)

  function handleDataLoaded(loadedData: ShopeeOrder[]) {
    setData(loadedData)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {!data ? (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Dashboard Shopee</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Faça upload dos seus dados de vendas da Shopee e visualize métricas 
              de performance, tendências de vendas e análises detalhadas.
            </p>
          </div>
          <FileUpload onDataLoaded={handleDataLoaded} />
        </div>
      ) : (
        <Dashboard data={data} />
      )}
    </main>
  )
}
