# 🗺️ Guia de Rotas do Asset Manager

## Rotas Públicas

### `/login`
- **Descrição**: Página de login do sistema
- **Acesso**: Público
- **Funcionalidades**:
  - Login com email/usuário e senha
  - Link para registro
  - Credenciais de teste visíveis

### `/register`
- **Descrição**: Página de registro de novos usuários
- **Acesso**: Público
- **Funcionalidades**:
  - Cadastro de novo funcionário
  - Validação de formulário
  - Login automático após registro

---

## Rotas Protegidas (Requer Autenticação)

### `/` (Dashboard)
- **Descrição**: Página principal do sistema
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - 4 cards de estatísticas principais
  - Tabela de últimas 12 movimentações
  - Lista completa de equipamentos com busca e filtros
  - Modal de detalhes de equipamentos

### `/events`
- **Descrição**: Gerenciamento de eventos
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - Calendário com 4 visualizações (Mês, Semana, Dia, Lista)
  - Criar novo evento
  - Editar evento existente
  - Excluir evento
  - Visualizar detalhes do evento
  - Navegação entre períodos

### `/withdrawal`
- **Descrição**: Fluxo de retirada de equipamentos
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - Passo 1: Seleção de evento
  - Passo 2: Scanner QR Code ou entrada manual
  - Passo 3: Confirmação com condição do equipamento
  - Histórico de retiradas recentes
  - Modal de sucesso

### `/return`
- **Descrição**: Fluxo de devolução de equipamentos
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - Passo 1: Seleção de evento
  - Passo 2: Scanner QR Code ou entrada manual
  - Passo 3: Confirmação com status da devolução
  - Histórico de devoluções recentes
  - Modal de sucesso

### `/reports`
- **Descrição**: Relatórios avançados do sistema
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - 4 cards de resumo
  - 5 tipos de relatórios em abas:
    - Equipamentos fora do estoque
    - Equipamentos em manutenção
    - Equipamentos mais utilizados
    - Equipamentos parados
    - Relatório por evento

### `/employees`
- **Descrição**: Lista de colaboradores
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - Grid de cards com foto e informações
  - Busca por nome/email/departamento
  - Estatísticas de atividades
  - Modal de detalhes com histórico

### `/profile`
- **Descrição**: Perfil do usuário logado
- **Acesso**: Usuários autenticados
- **Middleware**: `auth`
- **Funcionalidades**:
  - Edição de informações pessoais
  - Alteração de avatar
  - Alteração de senha
  - Estatísticas pessoais
  - Histórico de atividades

---

## Rotas Administrativas (Requer Admin)

### `/admin`
- **Descrição**: Painel administrativo
- **Acesso**: Apenas administradores
- **Middleware**: `auth`, `admin`
- **Funcionalidades**:
  - 3 abas principais:
    1. **Equipamentos**: CRUD completo
    2. **Usuários**: CRUD completo
    3. **Configurações**: 
       - Preferências gerais
       - Zona de perigo (reset, export)

---

## Redirecionamentos Automáticos

### Usuário Autenticado
- Se tentar acessar `/login` ou `/register` → Redireciona para `/`

### Usuário Não Autenticado
- Se tentar acessar qualquer rota protegida → Redireciona para `/login`

### Usuário Comum (Não Admin)
- Se tentar acessar `/admin` → Redireciona para `/`

---

## Estrutura de Navegação

### Menu Principal (Header)
- Dashboard (/)
- Eventos (/events)
- Retirar (/withdrawal)
- Devolver (/return)
- Relatórios (/reports)
- Colaboradores (/employees)
- Admin (/admin) - Apenas para administradores

### Menu do Usuário (Dropdown)
- Perfil (/profile)
- Sair (logout)

---

## Fluxos de Navegação

### Fluxo de Retirada
1. Dashboard → Retirar
2. Selecionar Evento
3. Escanear QR Code
4. Confirmar Retirada
5. Modal de Sucesso → Nova Retirada ou Dashboard

### Fluxo de Devolução
1. Dashboard → Devolver
2. Selecionar Evento
3. Escanear QR Code
4. Confirmar Devolução com Status
5. Modal de Sucesso → Nova Devolução ou Dashboard

### Fluxo de Criação de Evento
1. Dashboard → Eventos
2. Botão "+ Novo Evento"
3. Preencher formulário
4. Salvar → Evento aparece no calendário

### Fluxo Administrativo - Equipamento
1. Dashboard → Admin
2. Aba "Equipamentos"
3. Botão "+ Novo Equipamento"
4. Preencher formulário
5. Salvar → Equipamento aparece na lista

---

## Estados da URL

### Query Parameters (Não implementado no MVP)
Possíveis melhorias futuras:
- `/events?view=month&date=2026-02-15`
- `/reports?type=maintenance&filter=urgent`
- `/admin?tab=users&page=2`

### Hash Navigation
- Não utilizado no projeto atual
- Navegação baseada em Vue Router com history mode

---

## Breadcrumbs (Não implementado)
Sugestão para futuras melhorias:
- Dashboard > Eventos > Detalhes do Evento
- Dashboard > Admin > Equipamentos > Editar

---

## Mapa do Site

```
/
├── login (público)
├── register (público)
├── / (dashboard - autenticado)
├── events (autenticado)
├── withdrawal (autenticado)
├── return (autenticado)
├── reports (autenticado)
├── employees (autenticado)
├── profile (autenticado)
└── admin (admin only)
    ├── equipamentos
    ├── usuários
    └── configurações
```

---

## Ordem Recomendada de Navegação para Novos Usuários

1. **Login** - Faça login com as credenciais de teste
2. **Dashboard** - Veja o resumo geral do sistema
3. **Eventos** - Crie ou visualize eventos
4. **Retirar** - Teste o fluxo de retirada de equipamento
5. **Devolver** - Teste o fluxo de devolução
6. **Relatórios** - Visualize os relatórios gerados
7. **Colaboradores** - Veja informações dos funcionários
8. **Perfil** - Personalize seu perfil
9. **Admin** - (Se for admin) Gerencie equipamentos e usuários

---

## API BFF (Backend for Frontend)

O sistema utiliza Nuxt Nitro como proxy para a API FastAPI. Todos os endpoints estao em `/api/*`.

### Endpoints Disponiveis

| Modulo | Endpoints |
|--------|-----------|
| Auth | `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout` |
| Equipment | CRUD completo em `/api/equipment/*` |
| Events | CRUD completo em `/api/events/*` |
| Reports | `/api/reports/*` (5 tipos de relatorio) |
| Bags | CRUD completo em `/api/bags/*` |
| Transactions | `/api/transactions/*` (retiradas/devolucoes) |
| Reservations | `/api/reservations/*` |
| Users | CRUD completo em `/api/users/*` |

### Autenticacao

- Token JWT em cookie HTTP-only (nao localStorage)
- O middleware `server/middleware/auth.ts` valida o token automaticamente
