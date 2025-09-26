'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye, Package, MapPin, Calendar, User } from 'lucide-react'

interface OrderCardProps {
  order: ShopeeOrder
  onViewDetails: (order: ShopeeOrder) => void
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'em trânsito':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelado':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate" title={order["Nome do Produto"]}>
              {order["Nome do Produto"]}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {order["ID do pedido"]}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order["Status do pedido"])}`}>
            {order["Status do pedido"]}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações principais */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Qtd:</span>
            <span className="font-medium">{order["Quantidade"]}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Data:</span>
            <span className="font-medium">{formatDate(order["Data de criação do pedido"])}</span>
          </div>
        </div>

        {/* Localização */}
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Entrega:</span>
          <span className="font-medium">{order["UF"]}</span>
        </div>

        {/* Cliente */}
        <div className="flex items-center space-x-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Cliente:</span>
          <span className="font-medium truncate">{order["Nome de usuário (comprador)"]}</span>
        </div>

        {/* Valor */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor Total:</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(order["Valor Total"])}
            </span>
          </div>
        </div>

        {/* Botão de ação */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(order)}
          className="w-full mt-3"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  )
}
