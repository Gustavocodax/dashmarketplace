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
    
    // Limpar a string de data
    const cleanDateString = dateString.trim()
    
    // Tentar parseISO primeiro (mais confiável)
    try {
      const parsed = parseISO(cleanDateString)
      if (isValid(parsed)) {
        return parsed
      }
    } catch (e) {
      // Continuar para outros métodos
    }
    
    // Tentar diferentes formatos de data manualmente
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/, // 2025-07-31 14:30
      /^(\d{4})-(\d{2})-(\d{2})$/, // 2025-07-31
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/, // 31/07/2025 14:30
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // 31/07/2025
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/, // 31/07/2025 14:30:00
    ]
    
    for (const format of formats) {
      const match = cleanDateString.match(format)
      if (match) {
        try {
          let year, month, day, hour = 0, minute = 0, second = 0
          
          if (format.source.includes('\\d{4}-\\d{2}-\\d{2}')) {
            // Formato ISO
            year = parseInt(match[1])
            month = parseInt(match[2]) - 1 // JavaScript months are 0-based
            day = parseInt(match[3])
            if (match[4]) hour = parseInt(match[4])
            if (match[5]) minute = parseInt(match[5])
          } else {
            // Formato brasileiro
            day = parseInt(match[1])
            month = parseInt(match[2]) - 1 // JavaScript months are 0-based
            year = parseInt(match[3])
            if (match[4]) hour = parseInt(match[4])
            if (match[5]) minute = parseInt(match[5])
            if (match[6]) second = parseInt(match[6])
          }
          
          const parsed = new Date(year, month, day, hour, minute, second)
          if (isValid(parsed)) {
            return parsed
          }
        } catch (e) {
          continue
        }
      }
    }
    
    // Fallback: tentar parsear diretamente
    try {
      const parsed = new Date(cleanDateString)
      if (isValid(parsed)) {
        return parsed
      }
    } catch (e) {
      // Último recurso
    }
    
    console.warn(`Não foi possível parsear a data: "${dateString}"`)
    return null
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
  filteredOrders.forEach((order, index) => {
    const orderDate = parseDate(order["Data de criação do pedido"])
    if (orderDate) {
      const date = format(orderDate, 'yyyy-MM-dd')
      const current = vendasPorDiaMap.get(date) || 0
      const valor = Number(order["Valor Total"]) || 0
      vendasPorDiaMap.set(date, current + valor)
      
      // Log para debug - mostrar dados do dia 31
      if (date.includes('31')) {
        console.log(`Dia 31 encontrado - Pedido ${index + 1}: ${date} - R$ ${valor}`)
      }
    } else {
      console.warn(`Não foi possível processar data do pedido ${index + 1}: "${order["Data de criação do pedido"]}"`)
    }
  })
  
  const vendasPorDia = Array.from(vendasPorDiaMap.entries())
    .map(([data, vendas]) => ({ data, vendas }))
    .sort((a, b) => a.data.localeCompare(b.data))
  
  console.log('Vendas por dia processadas:', vendasPorDia)

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
  try {
    const workbook = XLSX.read(buffer, { 
      type: 'array',
      cellDates: true, // Importar datas como objetos Date
      cellNF: false,   // Não formatar números
      cellText: false  // Não converter para texto
    })
    
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      throw new Error('Nenhuma planilha encontrada no arquivo')
    }
    
    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) {
      throw new Error('Planilha não pôde ser lida')
    }
    
    // Converter para JSON com configurações otimizadas
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '', // Valor padrão para células vazias
      raw: false  // Processar valores
    })
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Arquivo Excel não contém dados suficientes')
    }
    
    const headers = jsonData[0] as string[]
    if (!headers || headers.length === 0) {
      throw new Error('Cabeçalhos não encontrados na planilha')
    }
    
    const rows = jsonData.slice(1) as any[][]
    
    console.log(`Processando ${rows.length} linhas de dados...`)
    
    const processedOrders = rows
      .filter((row, index) => {
        // Filtrar linhas vazias ou com dados insuficientes
        const hasData = row && row.some(cell => 
          cell !== undefined && 
          cell !== null && 
          cell !== '' && 
          cell.toString().trim() !== ''
        )
        
        if (!hasData) {
          console.warn(`Linha ${index + 2} ignorada: sem dados válidos`)
        }
        
        return hasData
      })
      .map((row, index) => {
        try {
          const order: any = {}
          
          headers.forEach((header, headerIndex) => {
            if (!header || header.trim() === '') {
              console.warn(`Cabeçalho vazio na coluna ${headerIndex + 1}`)
              return
            }
            
            const value = row[headerIndex]
            const cleanHeader = header.trim()
            
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
                 'Taxa de serviço', 'Total global', 'Valor estimado do frete', 'CEP'].includes(cleanHeader)) {
              
              if (typeof value === 'number') {
                order[cleanHeader] = value
              } else if (value instanceof Date) {
                // Se for uma data, manter como string no formato ISO
                order[cleanHeader] = value.toISOString()
              } else {
                // Limpar valor e converter para número
                const cleanValue = value?.toString().replace(/[^\d.,-]/g, '').replace(',', '.') || '0'
                order[cleanHeader] = parseFloat(cleanValue) || 0
              }
            } else {
              // Para campos de texto, incluindo datas
              if (value instanceof Date) {
                // Converter data para string no formato ISO
                order[cleanHeader] = value.toISOString()
              } else {
                order[cleanHeader] = value?.toString() || ''
              }
            }
          })
          
          return order as ShopeeOrder
        } catch (error) {
          console.error(`Erro ao processar linha ${index + 2}:`, error)
          return null
        }
      })
      .filter(order => order !== null) // Remover linhas com erro
    
    console.log(`${processedOrders.length} pedidos processados com sucesso`)
    return processedOrders
    
  } catch (error) {
    console.error('Erro ao processar arquivo XLSX:', error)
    throw new Error(`Erro ao processar arquivo Excel: ${error.message}`)
  }
}
