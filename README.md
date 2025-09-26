# Dashboard Shopee - Análise de Performance

Um dashboard interativo para análise de dados de vendas da Shopee, construído com Next.js, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- **Upload de Dados**: Suporte para arquivos CSV, JSON e XLSX com dados da Shopee
- **Métricas Principais**: Total de vendas, pedidos, ticket médio e produtos únicos
- **Visualizações Interativas**: Gráficos de vendas por dia, estado, produtos e status
- **Filtros Avançados**: Filtre por data, status, estado e produto
- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Análise Detalhada**: Ranking de produtos e tabelas de performance

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos
- **Framer Motion** - Animações suaves
- **XLSX** - Processamento de arquivos Excel

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd Dash
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

> **Nota**: Este projeto usa NPM como gerenciador de pacotes. Veja [INSTRUCOES_NPM.md](./INSTRUCOES_NPM.md) para comandos detalhados.

## 📊 Como Usar

1. **Faça Upload dos Dados**: 
   - Clique em "Selecionar Arquivo" ou arraste um arquivo CSV/JSON/XLSX
   - O arquivo deve conter dados de vendas da Shopee no formato especificado

2. **Explore o Dashboard**:
   - Visualize métricas principais no topo
   - Use os filtros para analisar períodos específicos
   - Explore gráficos interativos de vendas e performance

3. **Filtros Disponíveis**:
   - **Período**: Filtre por data de início e fim
   - **Status**: Filtre por status dos pedidos
   - **Estado**: Filtre por estado de entrega
   - **Produto**: Filtre por produtos específicos

## 📁 Estrutura do Projeto

```
├── app/                    # App Router do Next.js
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Card, etc.)
│   ├── charts/           # Componentes de gráficos
│   ├── Dashboard.tsx     # Dashboard principal
│   ├── FileUpload.tsx    # Componente de upload
│   ├── FilterPanel.tsx   # Painel de filtros
│   └── MetricCard.tsx    # Card de métricas
├── lib/                  # Utilitários e processamento
│   ├── utils.ts          # Funções utilitárias
│   └── data-processing.ts # Processamento de dados
├── types/                # Definições TypeScript
│   └── shopee.ts         # Tipos dos dados da Shopee
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o projeto em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm start` - Executa o build de produção
- `npm run lint` - Executa o linter ESLint

## 📈 Formato dos Dados

O dashboard espera dados no formato JSON com a seguinte estrutura:

```json
{
  "ID do pedido": "2507011VJTCJ76",
  "Status do pedido": "Concluído",
  "Data de criação do pedido": "2025-07-01 07:30",
  "Valor Total": 58.82,
  "Nome do Produto": "Tênis Esportivo...",
  "UF": "São Paulo",
  // ... outros campos
}
```

## 🎨 Personalização

- **Cores**: Modifique as variáveis CSS em `app/globals.css`
- **Componentes**: Adicione novos componentes em `components/`
- **Gráficos**: Customize visualizações em `components/charts/`
- **Filtros**: Adicione novos filtros em `components/FilterPanel.tsx`

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.