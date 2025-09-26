export interface ShopeeOrder {
  "ID do pedido": string;
  "Status do pedido": string;
  "Cancelar Motivo": string;
  "Status da Devolução / Reembolso": string;
  "Número de rastreamento": string;
  "Opção de envio": string;
  "Método de envio": string;
  "Data prevista de envio": string;
  "Tempo de Envio": string;
  "Data de criação do pedido": string;
  "Hora do pagamento do pedido": string;
  "Nº de referência do SKU principal": string;
  "Nome do Produto": string;
  "Número de referência SKU": string;
  "Nome da variação": string;
  "Preço original": number;
  "Preço acordado": number;
  "Quantidade": number;
  "Returned quantity": number;
  "Subtotal do produto": number;
  "Desconto do vendedor": number;
  "Desconto do vendedor__1": number;
  "Reembolso Shopee": number;
  "Peso total SKU": number;
  "Número de produtos pedidos": number;
  "Peso total do pedido": number;
  "Código do Cupom": string;
  "Cupom do vendedor": number;
  "Seller Absorbed Coin Cashback": number;
  "Cupom Shopee": number;
  "Indicador da Leve Mais por Menos": string;
  "Desconto Shopee da Leve Mais por Menos": number;
  "Desconto da Leve Mais por Menos do vendedor": number;
  "Compensar Moedas Shopee": number;
  "Total descontado Cartão de Crédito": number;
  "Valor Total": number;
  "Taxa de envio pagas pelo comprador": number;
  "Desconto de Frete Aproximado": number;
  "Taxa de Envio Reversa": number;
  "Taxa de transação": number;
  "Taxa de comissão": number;
  "Taxa de serviço": number;
  "Total global": number;
  "Valor estimado do frete": number;
  "Nome de usuário (comprador)": string;
  "Nome do destinatário": string;
  "Telefone": string;
  "CPF do Comprador": string;
  "Endereço de entrega": string;
  "Cidade": string;
  "Bairro": string;
  "Cidade__1": string;
  "UF": string;
  "País": string;
  "CEP": number;
  "Observação do comprador": string;
  "Hora completa do pedido": string;
  "Nota": string;
}

export interface DashboardMetrics {
  totalVendas: number;
  totalPedidos: number;
  ticketMedio: number;
  taxaConversao: number;
  vendasPorDia: Array<{ data: string; vendas: number }>;
  vendasPorEstado: Array<{ estado: string; vendas: number }>;
  produtosMaisVendidos: Array<{ produto: string; quantidade: number; receita: number }>;
  statusPedidos: Array<{ status: string; quantidade: number }>;
  receitaPorMes: Array<{ mes: string; receita: number }>;
}

export interface FilterOptions {
  dataInicio?: Date;
  dataFim?: Date;
  status?: string[];
  estado?: string[];
  produto?: string[];
}
