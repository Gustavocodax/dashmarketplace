# 🚀 Instruções de Instalação com NPM

## 📦 Instalação e Execução

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

### 3. Build de Produção
```bash
npm run build
npm start
```

### 4. Linting
```bash
npm run lint
```

## 🔧 Comandos Úteis

### Limpar Cache do NPM
```bash
npm cache clean --force
```

### Verificar Dependências
```bash
npm list
```

### Atualizar Dependências
```bash
npm update
```

### Instalar Dependência Específica
```bash
npm install nome-do-pacote
```

## 📁 Estrutura de Arquivos NPM

Após a instalação, você terá:
```
📁 node_modules/     # Dependências instaladas
📄 package-lock.json # Lock file do NPM
📄 package.json      # Configurações do projeto
```

## ⚠️ Notas Importantes

- **package-lock.json**: Mantenha este arquivo no controle de versão
- **node_modules/**: Nunca commite esta pasta (já está no .gitignore)
- **Cache**: O NPM cria cache em `~/.npm/`

## 🆚 Diferenças entre NPM e PNPM

| Aspecto | NPM | PNPM |
|---------|-----|------|
| Instalação | `npm install` | `pnpm install` |
| Execução | `npm run dev` | `pnpm dev` |
| Build | `npm run build` | `pnpm build` |
| Cache | `~/.npm/` | `~/.pnpm-store/` |
| Velocidade | Padrão | Mais rápido |
| Espaço | Maior | Menor (links simbólicos) |

## 🎯 Para este Projeto

Use sempre os comandos NPM:
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start

# Linting
npm run lint
```

## 🔍 Troubleshooting

### Erro de Permissão
```bash
sudo npm install -g npm@latest
```

### Limpar Tudo e Reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

### Verificar Versão
```bash
npm --version
node --version
```
