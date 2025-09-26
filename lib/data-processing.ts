import { ShopeeOrder, DashboardMetrics, FilterOptions } from '@/types/shopee'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'

export function processShopeeData(orders: ShopeeOrder[], filters?: FilterOptions): DashboardMetrics {
  let filteredOrders = orders

  // Aplicar filtros
  if (filters) {
    if (filters.dataInicio || filters.dataFim) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = parseISO(order["Data de criação do pedido"])
        if (filters.dataInicio && orderDate < startOfDay(filters.dataInicio)) return false
        if (filters.dataFim && orderDate > endOfDay(filters.dataFim)) return false
        return true
      })
    }

    if (filters.status && filters.status.length > 0) {
      filteredOrders = filteredOrders.filter(order => 
        filters.status!.includes(order["Status do pedido"])
      )
    }

    if (filters.estado && filters.estado.length > 0) {
      filteredOrders = filteredOrders.filter(order => 
        filters.estado!.includes(order["UF"])
      )
    }

    if (filters.produto && filters.produto.length > 0) {
      filteredOrders = filteredOrders.filter(order => 
        filters.produto!.some(produto => 
          order["Nome do Produto"].toLowerCase().includes(produto.toLowerCase())
        )
      )
    }
  }

  // Calcular métricas básicas
  const totalVendas = filteredOrders.reduce((sum, order) => sum + order["Valor Total"], 0)
  const totalPedidos = filteredOrders.length
  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0

  // Vendas por dia
  const vendasPorDiaMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const date = format(parseISO(order["Data de criação do pedido"]), 'yyyy-MM-dd')
    const current = vendasPorDiaMap.get(date) || 0
    vendasPorDiaMap.set(date, current + order["Valor Total"])
  })
  const vendasPorDia = Array.from(vendasPorDiaMap.entries())
    .map(([data, vendas]) => ({ data, vendas }))
    .sort((a, b) => a.data.localeCompare(b.data))

  // Vendas por estado
  const vendasPorEstadoMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const estado = order["UF"]
    const current = vendasPorEstadoMap.get(estado) || 0
    vendasPorEstadoMap.set(estado, current + order["Valor Total"])
  })
  const vendasPorEstado = Array.from(vendasPorEstadoMap.entries())
    .map(([estado, vendas]) => ({ estado, vendas }))
    .sort((a, b) => b.vendas - a.vendas)

  // Produtos mais vendidos
  const produtosMap = new Map<string, { quantidade: number; receita: number }>()
  filteredOrders.forEach(order => {
    const produto = order["Nome do Produto"]
    const current = produtosMap.get(produto) || { quantidade: 0, receita: 0 }
    produtosMap.set(produto, {
      quantidade: current.quantidade + order["Quantidade"],
      receita: current.receita + order["Valor Total"]
    })
  })
  const produtosMaisVendidos = Array.from(produtosMap.entries())
    .map(([produto, data]) => ({ produto, ...data }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10)

  // Status dos pedidos
  const statusMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const status = order["Status do pedido"]
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })
  const statusPedidos = Array.from(statusMap.entries())
    .map(([status, quantidade]) => ({ status, quantidade }))

  // Receita por mês
  const receitaPorMesMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const mes = format(parseISO(order["Data de criação do pedido"]), 'yyyy-MM')
    const current = receitaPorMesMap.get(mes) || 0
    receitaPorMesMap.set(mes, current + order["Valor Total"])
  })
  const receitaPorMes = Array.from(receitaPorMesMap.entries())
    .map(([mes, receita]) => ({ mes, receita }))
    .sort((a, b) => a.mes.localeCompare(b.mes))

  return {
    totalVendas,
    totalPedidos,
    ticketMedio,
    taxaConversao: 0, // Seria calculado com dados de visitantes
    vendasPorDia,
    vendasPorEstado,
    produtosMaisVendidos,
    statusPedidos,
    receitaPorMes
  }
}

export function parseCSVData(csvText: string): ShopeeOrder[] {
  const lines = csvText.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const order: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        // Converter valores numéricos
        if (['Preço original', 'Preço acordado', 'Quantidade', 'Returned quantity', 
             'Subtotal do produto', 'Desconto do vendedor', 'Desconto do vendedor__1',
             'Reembolso Shopee', 'Peso total SKU', 'Número de produtos pedidos',
             'Peso total do pedido', 'Cupom do vendedor', 'Seller Absorbed Coin Cashback',
             'Cupom Shopee', 'Desconto Shopee da Leve Mais por Menos',
             'Desconto da Leve Mais por Menos do vendedor', 'Compensar Moedas Shopee',
             'Total descontado Cartão de Crédito', 'Valor Total',
             'Taxa de envio pagas pelo comprador', 'Desconto de Frete Aproximado',
             'Taxa de Envio Reversa', 'Taxa de transação', 'Taxa de comissão',
             'Taxa de serviço', 'Total global', 'Valor estimado do frete', 'CEP'].includes(header)) {
          order[header] = parseFloat(value) || 0
        } else {
          order[header] = value
        }
      })
      
      return order as ShopeeOrder
    })
}
