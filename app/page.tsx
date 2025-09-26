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
    <main className="min-h-screen relative">
      {!data ? (
        <div className="relative min-h-screen flex items-center justify-center">
          {/* Background SVG */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/img/bg03.svg" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          
          {/* Content */}
          <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Dashboard Shopee</h1>
              <p className="text-base text-white/90 max-w-lg mx-auto drop-shadow-md">
                Faça upload dos seus dados de vendas da Shopee e visualize métricas 
                de performance e análises detalhadas.
              </p>
            </div>
            <div className="flex justify-center">
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <Dashboard data={data} />
        </div>
      )}
    </main>
  )
}
