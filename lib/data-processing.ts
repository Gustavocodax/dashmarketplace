import { ShopeeOrder, DashboardMetrics, FilterOptions } from '@/types/shopee'
import { format, parseISO, startOfDay, endOfDay, isValid } from 'date-fns'
import * as XLSX from 'xlsx'

export function processShopeeData(orders: ShopeeOrder[], filters?: FilterOptions): DashboardMetrics {
  // Verificação de segurança
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return {
      totalVendas: 0,
      totalPedidos: 0,
      ticketMedio: 0,
      taxaConversao: 0,
      vendasPorDia: [],
      vendasPorEstado: [],
      produtosMaisVendidos: [],
      statusPedidos: [],
      receitaPorMes: []
    }
  }
  
  let filteredOrders = orders

  // Função para parsear datas de forma robusta
  function parseDate(dateString: string): Date | null {
    if (!dateString || dateString.trim() === '') return null
    
    // Tentar diferentes formatos de data
    const formats = [
      'yyyy-MM-dd HH:mm',
      'yyyy-MM-dd',
      'dd/MM/yyyy HH:mm',
      'dd/MM/yyyy',
      'MM/dd/yyyy HH:mm',
      'MM/dd/yyyy'
    ]
    
    for (const formatStr of formats) {
      try {
        const parsed = parseISO(dateString)
        if (isValid(parsed)) return parsed
      } catch (e) {
        continue
      }
    }
    
    // Fallback: tentar parsear diretamente
    try {
      const parsed = new Date(dateString)
      return isValid(parsed) ? parsed : null
    } catch (e) {
      return null
    }
  }

  // Aplicar filtros
  if (filters) {
    if (filters.dataInicio || filters.dataFim) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = parseDate(order["Data de criação do pedido"])
        if (!orderDate) return false
        
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
  const totalVendas = filteredOrders.reduce((sum, order) => sum + (Number(order["Valor Total"]) || 0), 0)
  const totalPedidos = filteredOrders.length
  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0

  // Vendas por dia
  const vendasPorDiaMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const orderDate = parseDate(order["Data de criação do pedido"])
    if (orderDate) {
      const date = format(orderDate, 'yyyy-MM-dd')
      const current = vendasPorDiaMap.get(date) || 0
      vendasPorDiaMap.set(date, current + (Number(order["Valor Total"]) || 0))
    }
  })
  const vendasPorDia = Array.from(vendasPorDiaMap.entries())
    .map(([data, vendas]) => ({ data, vendas }))
    .sort((a, b) => a.data.localeCompare(b.data))

  // Vendas por estado
  const vendasPorEstadoMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const estado = order["UF"] || 'Não informado'
    const current = vendasPorEstadoMap.get(estado) || 0
    vendasPorEstadoMap.set(estado, current + (Number(order["Valor Total"]) || 0))
  })
  const vendasPorEstado = Array.from(vendasPorEstadoMap.entries())
    .map(([estado, vendas]) => ({ estado, vendas }))
    .sort((a, b) => b.vendas - a.vendas)

  // Produtos mais vendidos
  const produtosMap = new Map<string, { quantidade: number; receita: number }>()
  filteredOrders.forEach(order => {
    const produto = order["Nome do Produto"] || 'Produto não informado'
    const current = produtosMap.get(produto) || { quantidade: 0, receita: 0 }
    produtosMap.set(produto, {
      quantidade: current.quantidade + (order["Quantidade"] || 0),
      receita: current.receita + (Number(order["Valor Total"]) || 0)
    })
  })
  const produtosMaisVendidos = Array.from(produtosMap.entries())
    .map(([produto, data]) => ({ produto, ...data }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10)

  // Status dos pedidos
  const statusMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const status = order["Status do pedido"] || 'Status não informado'
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })
  const statusPedidos = Array.from(statusMap.entries())
    .map(([status, quantidade]) => ({ status, quantidade }))

  // Receita por mês
  const receitaPorMesMap = new Map<string, number>()
  filteredOrders.forEach(order => {
    const orderDate = parseDate(order["Data de criação do pedido"])
    if (orderDate) {
      const mes = format(orderDate, 'yyyy-MM')
      const current = receitaPorMesMap.get(mes) || 0
      receitaPorMesMap.set(mes, current + (Number(order["Valor Total"]) || 0))
    }
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
          // Limpar valor e converter para número
          const cleanValue = value.toString().replace(/[^\d.,-]/g, '').replace(',', '.')
          order[header] = parseFloat(cleanValue) || 0
        } else {
          order[header] = value || ''
        }
      })
      
      return order as ShopeeOrder
    })
}

export function parseXLSXData(buffer: ArrayBuffer): ShopeeOrder[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Converter para JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  if (jsonData.length < 2) {
    throw new Error('Arquivo Excel não contém dados suficientes')
  }
  
  const headers = jsonData[0] as string[]
  const rows = jsonData.slice(1) as any[][]
  
  return rows
    .filter(row => row.some(cell => cell !== undefined && cell !== ''))
    .map(row => {
      const order: any = {}
      
      headers.forEach((header, index) => {
        const value = row[index] || ''
        
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
          if (typeof value === 'number') {
            order[header] = value
          } else {
            // Limpar valor e converter para número
            const cleanValue = value?.toString().replace(/[^\d.,-]/g, '').replace(',', '.') || '0'
            order[header] = parseFloat(cleanValue) || 0
          }
        } else {
          order[header] = value?.toString() || ''
        }
      })
      
      return order as ShopeeOrder
    })
}
