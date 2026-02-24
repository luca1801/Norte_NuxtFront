# Asset Manager - Sistema de Gerenciamento de Ativos

Sistema completo de gerenciamento de ativos para empresas que alugam equipamentos de audio para eventos e shows artisticos.

## Funcionalidades Implementadas

### Autenticacao & Autorizacao
- Sistema de Login e Cadastro
- Tres tipos de usuarios (Admin, Manager, Operator)
- Persistencia de sessao em cookies HTTP-only (seguranca aumentada)
- Cookie de verificacao `auth_check` para integridade de sessao
- Plugin de autenticacao para restauracao de estado
- Protecao de rotas com middleware
- Usuario de teste: **user: lucas | psw: admin**

### Dashboard
- Cards com estatisticas (Eventos, Equipamentos disponiveis, em uso, em manutencao, danificados)
- Lista de equipamentos com busca e filtros
- Tabela de ultimas 12 movimentacoes
- Modal de detalhes de equipamentos

### Eventos
- Calendario dinamico com multiplas visualizacoes (Mes, Semana, Dia, Lista)
- CRUD completo de eventos
- Visualizacao de eventos programados e ativos
- Detalhes de cada evento com equipamentos associados

### Retirada (Withdrawal)
- Fluxo em 3 etapas
- Selecao de evento
- Scanner QR Code (via camera ou entrada manual)
- Registro automatico com data, hora e usuario
- Historico de retiradas recentes

### Devolucao (Return)
- Fluxo em 3 etapas
- Selecao de evento
- Scanner QR Code (via camera ou entrada manual)
- Status da devolucao (OK, Avariado, Manutencao, Danificado)
- Atualizacao automatica do status
- Historico de devolucoes

### Relatorios Avancados
- Equipamentos fora do estoque
- Equipamentos em manutencao
- Equipamentos mais utilizados (ranking)
- Equipamentos parados ha muito tempo
- Resumo geral com cards principais
- Resumo por evento

### Colaboradores
- Cards com foto e informacoes dos funcionarios
- Campo de pesquisa por nome
- Estatisticas de atividades por colaborador
- Modal de detalhes com historico de transacoes

### Perfil
- Edicao de dados pessoais
- Alteracao de foto/avatar
- Alteracao de senha
- Visualizacao de atividades recentes

### Painel Administrativo
- CRUD de equipamentos (com coluna Evento para status reserved/in_use)
- CRUD de bags (com coluna Evento para status reserved/in_use)
- CRUD de usuarios
- Visualizacao de reservas, retiradas e devolucoes por evento
- Zona de perigo para operacoes criticas
- Acesso restrito a admins

## Tecnologias Utilizadas

- **Nuxt 4** (^4.3.0) - Framework Vue.js com SSR
- **Vue 3** (^3.5.27) - Framework JavaScript reativo
- **Tailwind CSS** - Estilizacao utility-first
- **DaisyUI** - Componentes UI para Tailwind
- **Pinia** - Gerenciamento de estado
- **jsQR** - Leitura de codigos QR
- **TypeScript** - Tipagem estatica
- **Vitest** - Testes unitarios
- **Playwright** - Testes E2E

## Temas Disponiveis

- Light
- Dark
- Acid
- Silk
- Synthwave (padrao)

## Como Executar

1. **Instalar dependencias:**
```bash
npm install
```

2. **Executar em desenvolvimento:**
```bash
npm run dev
```

3. **Build para producao:**
```bash
npm run build
```

4. **Preview da build:**
```bash
npm run preview
```

## Credenciais de Teste

**Administrador:**
- Usuario: `lucas`
- Senha: `admin`

## Testes

O projeto possui uma suite completa de testes.

### Testes Unitarios (Vitest) - 37 testes
```bash
npm run test              # Executar testes
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura
```

### Testes E2E (Playwright) - 2 testes
```bash
npm run test:e2e         # Executar testes E2E
npm run test:e2e:ui      # Interface grafica
npm run test:e2e:debug   # Modo debug
npm run test:e2e:report  # Ver relatorio HTML
```

### Arquivos de Teste
```
tests/
├── unit/
│   └── components/
│       ├── FormInput.test.ts
│       ├── Modal.test.ts
│       ├── StatCard.test.ts
│       ├── FormSelect.test.ts
│       └── FormTextarea.test.ts
├── server/
│   └── api/
│       ├── auth.test.ts
│       ├── equipment.test.ts
│       └── events.test.ts
e2e/
├── auth.spec.ts
└── dashboard.spec.ts
```

## Estrutura do Projeto

```
nuxt-app/
├── app/
│   ├── app.vue                   # Componente raiz
│   ├── components/               # Componentes reutilizaveis
│   ├── composables/              # Logica de dominio
│   │   ├── core/                # Utilitarios core (useApi, useLoading)
│   │   ├── domain/              # Dados de dominio (useEquipment, useEvents, etc)
│   │   └── features/             # Funcionalidades (useWithdrawal, useReturn)
│   ├── layouts/                  # Layouts de pagina
│   ├── middleware/               # Middleware de rotas (auth.ts, admin.ts)
│   ├── pages/                    # Paginas da aplicacao
│   ├── plugins/                  # Plugins Nuxt (auth.ts - restauracao de sessao)
│   ├── services/api/             # Chamadas API
│   ├── stores/                   # Estado global (Pinia)
│   │   ├── auth.ts              # Store de autenticacao
│   │   └── app.ts               # Store de dados da aplicacao
│   ├── types/                    # Tipos TypeScript
│   │   └── index.ts             # Enums e interfaces
│   └── utils/                    # Funcoes utilitarias
├── server/                       # Nitro Server (BFF)
│   ├── api/                     # Endpoints API
│   ├── middleware/               # Middleware do servidor
│   └── utils/                   # Utilitarios do servidor
├── tests/
│   ├── unit/                    # Testes unitarios
│   └── server/                  # Testes de API
├── e2e/                         # Testes E2E
├── assets/
│   └── css/
│       └── main.css             # Estilos globais
├── nuxt.config.ts               # Configuracao Nuxt
├── tailwind.config.js           # Configuracao Tailwind
├── vitest.config.ts             # Configuracao Vitest
├── playwright.config.ts         # Configuracao Playwright
└── package.json                 # Dependencias
```

## Funcionalidades Tecnicas

### Sistema de Autenticacao
- Cookie `auth_token` (HTTP-only) - Token JWT para API
- Cookie `auth_check` (nao-HTTP) - Verificacao de sessao no frontend
- Plugin `auth.ts` - Restaura estado de autenticacao ao iniciar app
- Middleware `auth.ts` - Protege rotas automaticamente
- Middleware `admin.ts` - Restringe acesso a administradores

### Componentes Reutilizaveis
- FormInput, FormSelect, FormTextarea com validacao
- Modal dinamico com slots
- Scanner QR Code funcional

### State Management
- Pinia para gerenciamento de estado global
- Stores separados para autenticacao e dados da aplicacao

### Seguranca
- Middleware de autenticacao
- Middleware de autorizacao (admin)
- Validacao de formularios
- Protecao de rotas

### Responsividade
- Design mobile-first
- Breakpoints: mobile (375px+), tablet (768px), desktop (1366px+)
- Grid adaptavel
- Navegacao responsiva

## Integracao com Backend

Este frontend utiliza o padrao BFF (Backend for Frontend) com Nuxt Nitro como proxy para a API FastAPI.

### Arquitetura BFF

```
Frontend (Vue) → BFF (Nitro Server) → FastAPI Backend
                       ↓
              Cache em memoria (Nitro)
```

### Endpoints BFF Disponiveis

```
/api/auth/          - Autenticacao (login, register, me, logout)
/api/equipment/     - Equipamentos (CRUD completo)
/api/events/        - Eventos (CRUD completo)
/api/reports/       - Relatorios (5 tipos)
/api/bags/         - Bags/Malas (CRUD completo)
/api/transactions/ - Transacoes/Retiradas/Devolucoes
/api/reservations/ - Reservas de equipamentos
/api/users/        - Gerenciamento de usuarios
```

Configure as variaveis de ambiente em `.env`:
```bash
# URL do Backend FastAPI (apenas server-side)
NUXT_BACKEND_URL=http://localhost:8000

# Deixar vazio para modo BFF
NUXT_PUBLIC_API_URL=

NODE_ENV=development
```

## Modelos de Dados

### Equipamento
- id, code, name, category
- status: available | reserved | in_use | maintenance | excluded
- condition: excellent | good | fair | poor | damaged
- bag_id, current_event_id, location, description

### Bag
- id, code, name, description
- status: available | reserved | in_use | excluded
- current_event_id

### Evento
- id, code, name, type, category
- status: planned | confirmed | in_progress | completed | cancelled
- start_date, end_date, owner_id, location

### Transacao
- id, equipment_id, bag_id, event_id, user_id
- transaction_type: withdrawal | return
- status: pending | confirmed | completed | cancelled
- scheduled_date, actual_date, return_condition

### Reserva
- id, equipment_id, bag_id, event_id, reserved_by
- status: active | completed | cancelled
- start_date, end_date

## Proximas Melhorias

- [ ] Notificacoes push
- [ ] Geracao de relatorios em PDF
- [ ] Graficos e visualizacoes avancadas
- [ ] Sistema de mensagens entre usuarios
- [ ] Integracao com APIs de pagamento
- [ ] Upload de fotos de equipamentos
- [ ] Sistema de backup automatico

## Notas Importantes

- O scanner QR Code requer permissao de camera
- Testes E2E requerem a API rodando em localhost:8000
- Dados de teste sao criados automaticamente no banco SQLite

## Contribuindo

Sinta-se livre para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentacao

## Licenca

Este projeto e open source e esta disponivel sob a licenca MIT.

---

Desenvolvido com Nuxt 4 e Tailwind CSS
