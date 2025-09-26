'use client'

import { X, Package, User, MapPin, CreditCard, Truck, Calendar, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopeeOrder } from '@/types/shopee'
import { formatCurrency, formatDate } from '@/lib/utils'
import { parseISO, format, isValid } from 'date-fns'

interface OrderDetailsProps {
  order: ShopeeOrder
  onClose: () => void
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
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

  const formatDateString = (dateString: string) => {
    if (!dateString) return 'Não informado'
    
    try {
      const date = parseISO(dateString)
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy HH:mm')
      }
    } catch (e) {
      // Fallback para outros formatos
    }
    
    return dateString
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Pedido
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Informações Básicas */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="w-5 h-5 text-orange-600" />
                <span>Informações do Pedido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID do Pedido</label>
                  <p className="text-sm text-gray-900 font-mono">{order["ID do pedido"]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order["Status do pedido"])}`}>
                      {order["Status do pedido"]}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                  <p className="text-sm text-gray-900">{formatDateString(order["Data de criação do pedido"])}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hora do Pagamento</label>
                  <p className="text-sm text-gray-900">{formatDateString(order["Hora do pagamento do pedido"])}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Rastreamento</label>
                  <p className="text-sm text-gray-900 font-mono">{order["Número de rastreamento"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Método de Envio</label>
                  <p className="text-sm text-gray-900">{order["Método de envio"] || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Produto */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="w-5 h-5 text-orange-600" />
                <span>Produto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome do Produto</label>
                <p className="text-sm text-gray-900 mt-1">{order["Nome do Produto"]}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Variação</label>
                  <p className="text-sm text-gray-900">{order["Nome da variação"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantidade</label>
                  <p className="text-sm text-gray-900">{order["Quantidade"] || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Peso Total</label>
                  <p className="text-sm text-gray-900">{order["Peso total do pedido"] || 0} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span>Informações Financeiras</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Preço Original</label>
                  <p className="text-sm text-gray-900">{formatCurrency(order["Preço original"] || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Preço Acordado</label>
                  <p className="text-sm text-gray-900">{formatCurrency(order["Preço acordado"] || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subtotal do Produto</label>
                  <p className="text-sm text-gray-900">{formatCurrency(order["Subtotal do produto"] || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Desconto do Vendedor</label>
                  <p className="text-sm text-gray-900">{formatCurrency(order["Desconto do vendedor"] || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Taxa de Envio</label>
                  <p className="text-sm text-gray-900">{formatCurrency(order["Taxa de envio pagas pelo comprador"] || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor Total</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(order["Valor Total"] || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="w-5 h-5 text-orange-600" />
                <span>Informações do Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome de Usuário</label>
                  <p className="text-sm text-gray-900">{order["Nome de usuário (comprador)"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome do Destinatário</label>
                  <p className="text-sm text-gray-900">{order["Nome do destinatário"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-sm text-gray-900">{order["Telefone"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CPF do Comprador</label>
                  <p className="text-sm text-gray-900">{order["CPF do Comprador"] || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Entrega */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span>Endereço de Entrega</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Endereço</label>
                  <p className="text-sm text-gray-900">{order["Endereço de entrega"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bairro</label>
                  <p className="text-sm text-gray-900">{order["Bairro"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cidade</label>
                  <p className="text-sm text-gray-900">{order["Cidade__1"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado (UF)</label>
                  <p className="text-sm text-gray-900">{order["UF"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CEP</label>
                  <p className="text-sm text-gray-900">{order["CEP"] || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">País</label>
                  <p className="text-sm text-gray-900">{order["País"] || 'Não informado'}</p>
                </div>
              </div>
              {order["Observação do comprador"] && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observação do Comprador</label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {order["Observação do comprador"]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="border">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>Informações Adicionais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Prevista de Envio</label>
                  <p className="text-sm text-gray-900">{formatDateString(order["Data prevista de envio"])}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tempo de Envio</label>
                  <p className="text-sm text-gray-900">{formatDateString(order["Tempo de Envio"])}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hora Completa do Pedido</label>
                  <p className="text-sm text-gray-900">{formatDateString(order["Hora completa do pedido"])}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Opção de Envio</label>
                  <p className="text-sm text-gray-900">{order["Opção de envio"] || 'Não informado'}</p>
                </div>
              </div>
              {order["Cancelar Motivo"] && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Motivo do Cancelamento</label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-red-50 rounded-lg text-red-700">
                    {order["Cancelar Motivo"]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose} className="px-6 py-2 border">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
