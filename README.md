# 🎵 Asset Manager - Sistema de Gerenciamento de Ativos

Sistema completo de gerenciamento de ativos para empresas que alugam equipamentos de áudio para eventos e shows artísticos.

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação & Autorização
- ✅ Sistema de Login e Cadastro
- ✅ Dois tipos de usuários (Admin e Funcionário)
- ✅ Persistência de sessão em localStorage
- ✅ Proteção de rotas com middleware
- ✅ Usuário de teste: **user: admin | psw: admin**

### 📊 Dashboard
- ✅ Cards com estatísticas (Eventos, Equipamentos disponíveis, em uso, em manutenção, danificados)
- ✅ Lista de equipamentos com busca e filtros
- ✅ Tabela de últimas 12 movimentações
- ✅ Modal de detalhes de equipamentos

### 📅 Eventos
- ✅ Calendário dinâmico com múltiplas visualizações (Mês, Semana, Dia, Lista)
- ✅ CRUD completo de eventos
- ✅ Visualização de eventos programados e ativos
- ✅ Detalhes de cada evento com equipamentos associados

### 📤 Retirada (Withdrawal)
- ✅ Fluxo em 3 etapas
- ✅ Seleção de evento
- ✅ Scanner QR Code (via câmera ou entrada manual)
- ✅ Registro automático com data, hora e usuário
- ✅ Histórico de retiradas recentes

### 📥 Devolução (Return)
- ✅ Fluxo em 3 etapas
- ✅ Seleção de evento
- ✅ Scanner QR Code (via câmera ou entrada manual)
- ✅ Status da devolução (OK, Avariado, Manutenção, Danificado)
- ✅ Atualização automática do status
- ✅ Histórico de devoluções

### 📈 Relatórios Avançados
- ✅ Equipamentos fora do estoque
- ✅ Equipamentos em manutenção
- ✅ Equipamentos mais utilizados (ranking)
- ✅ Equipamentos parados há muito tempo
- ✅ Resumo geral com cards principais
- ✅ Resumo por evento

### 👥 Colaboradores
- ✅ Cards com foto e informações dos funcionários
- ✅ Campo de pesquisa por nome
- ✅ Estatísticas de atividades por colaborador
- ✅ Modal de detalhes com histórico de transações

### 👤 Perfil
- ✅ Edição de dados pessoais
- ✅ Alteração de foto/avatar
- ✅ Alteração de senha
- ✅ Visualização de atividades recentes

### ⚙️ Painel Administrativo
- ✅ CRUD de equipamentos
- ✅ CRUD de usuários
- ✅ Configurações do sistema
- ✅ Exportação de dados
- ✅ Zona de perigo para operações críticas
- ✅ Acesso restrito a admins

## 🛠️ Tecnologias Utilizadas

- **Nuxt 4** (^4.3.0) - Framework Vue.js com SSR
- **Vue 3** (^3.5.27) - Framework JavaScript reativo
- **Tailwind CSS** - Estilização utility-first
- **DaisyUI** - Componentes UI para Tailwind
- **Pinia** - Gerenciamento de estado
- **jsQR** - Leitura de códigos QR
- **TypeScript** - Tipagem estática

## 📱 Temas Disponíveis

- Light
- Dark
- Acid
- Silk

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Executar em desenvolvimento:**
```bash
npm run dev
```

3. **Build para produção:**
```bash
npm run build
```

4. **Preview da build:**
```bash
npm run preview
```

## 🔑 Credenciais de Teste

**Administrador:**
- Usuário: `admin`
- Senha: `admin`

**Funcionários (exemplo):**
- Email: `joao@example.com`
- Senha: `123456`

## 📂 Estrutura do Projeto

```
nuxt-app/
├── app/
│   └── app.vue                 # Componente raiz
├── assets/
│   └── css/
│       └── main.css           # Estilos globais
├── components/
│   ├── FormInput.vue          # Input reutilizável
│   ├── FormSelect.vue         # Select reutilizável
│   ├── FormTextarea.vue       # Textarea reutilizável
│   ├── Modal.vue              # Modal reutilizável
│   ├── StatCard.vue           # Card de estatística
│   └── QRScanner.vue          # Scanner QR Code
├── layouts/
│   └── default.vue            # Layout principal
├── middleware/
│   ├── auth.ts                # Middleware de autenticação
│   └── admin.ts               # Middleware de admin
├── pages/
│   ├── index.vue              # Dashboard
│   ├── login.vue              # Login
│   ├── register.vue           # Registro
│   ├── events.vue             # Eventos
│   ├── withdrawal.vue         # Retirada
│   ├── return.vue             # Devolução
│   ├── reports.vue            # Relatórios
│   ├── employees.vue          # Colaboradores
│   ├── profile.vue            # Perfil
│   └── admin.vue              # Painel Admin
├── stores/
│   ├── auth.ts                # Store de autenticação
│   └── app.ts                 # Store da aplicação
├── utils/
│   └── mockData.ts            # Dados de exemplo
├── nuxt.config.ts             # Configuração Nuxt
├── tailwind.config.js         # Configuração Tailwind
└── package.json               # Dependências
```

## 💡 Funcionalidades Técnicas

### Componentes Reutilizáveis
- FormInput, FormSelect, FormTextarea com validação
- Modal dinâmico com slots
- Scanner QR Code funcional

### State Management
- Pinia para gerenciamento de estado global
- Stores separados para autenticação e dados da aplicação

### Segurança
- Middleware de autenticação
- Middleware de autorização (admin)
- Validação de formulários
- Proteção de rotas

### Responsividade
- Design mobile-first
- Breakpoints: mobile (375px+), tablet (768px), desktop (1366px+)
- Grid adaptável
- Navegação responsiva

## 📊 Dados Mock Incluídos

O sistema vem com dados de exemplo pré-carregados:
- 6 usuários (1 admin + 5 funcionários)
- 12 equipamentos variados
- 5 eventos programados
- 5 transações de exemplo

## 🎯 Próximas Melhorias Sugeridas

- [ ] Integração com backend real
- [ ] Notificações push
- [ ] Geração de relatórios em PDF
- [ ] Gráficos e visualizações avançadas
- [ ] Sistema de mensagens entre usuários
- [ ] Integração com APIs de pagamento
- [ ] Upload de fotos de equipamentos
- [ ] Sistema de backup automático

## 📝 Notas Importantes

- Este é um protótipo frontend com dados mockados
- Para produção, conecte com um backend real
- Os dados são salvos apenas no localStorage
- O scanner QR Code requer permissão de câmera

## 🤝 Contribuindo

Este projeto foi criado como um sistema completo de gerenciamento. Sinta-se livre para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

Desenvolvido com ❤️ usando Nuxt 4 e Tailwind CSS

