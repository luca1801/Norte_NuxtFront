<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Relatórios</h1>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stats shadow bg-base-100 border-l-4 border-error">
        <div class="stat">
          <div class="stat-title text-base-content/70">Fora do Estoque</div>
          <div class="stat-value text-error">{{ equipmentOutOfStock.length }}</div>
          <div class="stat-desc text-base-content/60">Em uso ou outros</div>
        </div>
      </div>

      <div class="stats shadow bg-base-100 border-l-4 border-warning">
        <div class="stat">
          <div class="stat-title text-base-content/70">Eventos em Andamento</div>
          <div class="stat-value text-warning">{{ eventsInProgress }}</div>
          <div class="stat-desc text-base-content/60">Atualmente ativos</div>
        </div>
      </div>

      <div class="stats shadow bg-base-100 border-l-4 border-info">
        <div class="stat">
          <div class="stat-title text-base-content/70">Eventos Concluídos</div>
          <div class="stat-value text-info">{{ eventsCompleted }}</div>
          <div class="stat-desc text-base-content/60">Finalizados</div>
        </div>
      </div>

      <div class="stats shadow bg-base-100 border-l-4 border-success">
        <div class="stat">
          <div class="stat-title text-base-content/70">Taxa de Utilização</div>
          <div class="stat-value text-success">{{ utilizationRate }}%</div>
          <div class="stat-desc text-base-content/60">Equipamentos em uso</div>
        </div>
      </div>
    </div>

    <!-- Report Type Selector -->
    <div class="tabs tabs-boxed">
      <a v-for="tab in reportTabs" :key="tab.value" @click="currentTab = tab.value"
        :class="['tab', currentTab === tab.value ? 'tab-active' : '']">
        {{ tab.label }}
      </a>
    </div>

    <!-- Transactions Report (All Movements) -->
    <div v-if="currentTab === 'transactions'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">📊 Últimas Movimentações</h2>
          <div class="badge badge-primary badge-lg">{{ allMovementsSorted.length }} registros</div>
        </div>

        <!-- Filtros -->
        <div class="flex flex-wrap gap-4 mb-4">
          <select v-model="transactionTypeFilter" class="select select-bordered select-sm w-40">
            <option value="">Todos os tipos</option>
            <option value="withdrawal">Retiradas</option>
            <option value="return">Devoluções</option>
            <option value="reservation">Reservas</option>
          </select>
          <select v-model="transactionItemTypeFilter" class="select select-bordered select-sm w-40">
            <option value="">Todos os itens</option>
            <option value="equipment">Equipamentos</option>
            <option value="bag">Bags</option>
          </select>
          <input v-model="transactionSearch" type="text" placeholder="Buscar equipamento ou bag..."
            class="input input-bordered input-sm w-60" />
        </div>

        <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table class="table table-zebra table-pin-rows">
            <thead>
              <tr>
                <th class="w-8"></th>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Item</th>
                <th>Evento</th>
                <th>Usuário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="movement in filteredMovements" :key="movement.id">
                <!-- Linha principal -->
                <tr :class="{ 'bg-base-200/50': expandedBags.includes(movement.id) }">
                  <td>
                    <!-- Botão de expandir para bags -->
                    <button v-if="movement.bag_id" @click="toggleBagExpansion(movement.id)"
                      class="btn btn-xs btn-circle btn-ghost text-lg font-bold">
                      {{ expandedBags.includes(movement.id) ? '−' : '+' }}
                    </button>
                  </td>
                  <td class="text-sm">
                    <div>{{ formatDate(movement.created_at) }}</div>
                    <div class="text-xs text-base-content/60">{{ formatTime(movement.created_at) }}</div>
                  </td>
                  <td>
                    <div class="badge gap-1" :class="getMovementTypeClass(movement)">
                      {{ getMovementTypeText(movement) }}
                    </div>
                  </td>
                  <td>
                    <!-- Bag -->
                    <template v-if="movement.bag_id">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">👜</span>
                        <div>
                          <div class="font-mono font-bold text-primary">{{ getBagCode(movement.bag_id) }}</div>
                          <div class="text-sm text-base-content/70">{{ getBagName(movement.bag_id) }}</div>
                          <div class="text-xs text-base-content/50">
                            {{ getBagEquipmentCount(movement.bag_id) }} equipamentos
                          </div>
                        </div>
                      </div>
                    </template>
                    <!-- Equipamento individual -->
                    <template v-else-if="movement.equipment_id">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">📦</span>
                        <div>
                          <div class="font-mono font-bold">{{ getEquipmentCode(movement.equipment_id) }}</div>
                          <div class="text-sm text-base-content/70">{{ getEquipmentName(movement.equipment_id) }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </td>
                  <td>
                    <div class="font-semibold">{{ getEventName(movement.event_id) }}</div>
                    <div class="text-xs text-base-content/60">{{ getEventCode(movement.event_id) }}</div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="avatar" :class="{ 'placeholder': !getAvatarByUserId(movement.user_id) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                          <img v-if="getAvatarByUserId(movement.user_id)" :src="getAvatarByUserId(movement.user_id)"
                            :alt="getUserName(movement.user_id)" class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ getUserInitial(movement.user_id) }}</span>
                        </div>
                      </div>
                      <span class="text-sm">{{ getUserName(movement.user_id) }}</span>
                    </div>
                  </td>
                  <td>
                    <!-- Status do equipamento ou bag -->
                    <template v-if="movement.bag_id">
                      <div class="badge badge-sm" :class="getBagStatusClass(getBagStatus(movement.bag_id))">
                        {{ getBagStatusText(getBagStatus(movement.bag_id)) }}
                      </div>
                    </template>
                    <template v-else-if="movement.equipment_id">
                      <div class="badge badge-sm"
                        :class="getEquipmentStatusClass(getEquipmentStatus(movement.equipment_id))">
                        {{ getEquipmentStatusText(getEquipmentStatus(movement.equipment_id)) }}
                      </div>
                    </template>
                  </td>
                </tr>

                <!-- Linhas expandidas para equipamentos da bag -->
                <template v-if="movement.bag_id && expandedBags.includes(movement.id)">
                  <tr v-for="equipment in getBagEquipment(movement.bag_id)" :key="`${movement.id}-${equipment.id}`"
                    class="bg-base-200/30">
                    <td></td>
                    <td></td>
                    <td class="text-center text-base-content/40">└─</td>
                    <td>
                      <div class="flex items-center gap-2 pl-4">
                        <span class="text-sm">📦</span>
                        <div>
                          <div class="font-mono text-sm">{{ equipment.code }}</div>
                          <div class="text-xs text-base-content/70">{{ equipment.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="badge badge-ghost badge-sm">{{ equipment.category }}</div>
                    </td>
                    <td></td>
                    <td>
                      <div class="badge badge-sm" :class="getEquipmentStatusClass(equipment.status)">
                        {{ getEquipmentStatusText(equipment.status) }}
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
              <tr v-if="filteredMovements.length === 0">
                <td colspan="7" class="text-center py-8 text-base-content/60">
                  Nenhuma movimentação encontrada
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Out of Stock Report -->
    <div v-if="currentTab === 'out-of-stock'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">Equipamentos Fora do Estoque</h2>
          <div class="badge badge-primary badge-lg">{{ filteredOutOfStock.length }} itens</div>
        </div>

        <!-- Filtros -->
        <div class="flex flex-wrap gap-4 mb-4">
          <select v-model="outOfStockStatusFilter" class="select select-bordered select-sm w-44">
            <option value="">Todos os status</option>
            <option value="in_use">Em Uso</option>
            <option value="maintenance">Em Manutenção</option>
            <option value="reserved">Reservado</option>
          </select>
          <select v-model="outOfStockCategoryFilter" class="select select-bordered select-sm w-44">
            <option value="">Todas categorias</option>
            <option v-for="cat in equipmentCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <input v-model="outOfStockSearch" type="text" placeholder="Buscar código ou nome..."
            class="input input-bordered input-sm w-60" />
        </div>

        <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table class="table table-zebra table-pin-rows">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Condição</th>
                <th>Última Movimentação</th>
                <th>Localização</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="equipment in filteredOutOfStock" :key="equipment.id">
                <td class="font-mono font-bold">{{ equipment.code }}</td>
                <td>{{ equipment.name }}</td>
                <td>
                  <div class="badge badge-ghost badge-sm">{{ equipment.category }}</div>
                </td>
                <td>
                  <div class="badge" :class="getEquipmentStatusClass(equipment.status)">
                    {{ getEquipmentStatusText(equipment.status) }}
                  </div>
                </td>
                <td>
                  <div class="badge badge-outline badge-sm" :class="getConditionClass(equipment.condition)">
                    {{ getConditionText(equipment.condition) }}
                  </div>
                </td>
                <td>{{ getLastTransaction(equipment.id) }}</td>
                <td>{{ getEquipmentLocation(equipment.id) }}</td>
              </tr>
              <tr v-if="filteredOutOfStock.length === 0">
                <td colspan="7" class="text-center py-8 text-base-content/60">
                  Nenhum equipamento encontrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Most Used Report -->
    <div v-if="currentTab === 'most-used'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Equipamentos Mais Utilizados</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Código</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Nº de Usos</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in mostUsedEquipment" :key="item.equipment.id">
                <td>
                  <div class="badge badge-lg"
                    :class="index === 0 ? 'badge-warning' : index === 1 ? 'badge-neutral' : index === 2 ? 'badge-accent' : 'badge-ghost'">
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="font-mono font-bold">{{ item.equipment.code }}</td>
                <td>{{ item.equipment.name }}</td>
                <td>
                  <div class="badge badge-ghost">{{ item.equipment.category }}</div>
                </td>
                <td class="font-bold text-lg">{{ item.count }}</td>
                <td>
                  <div class="badge" :class="getEquipmentStatusClass(item.equipment.status)">
                    {{ getEquipmentStatusText(item.equipment.status) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Idle Equipment Report -->
    <div v-if="currentTab === 'idle'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Equipamentos Parados</h2>
        <p class="text-sm text-base-content/60 mb-4">
          Equipamentos que não foram utilizados recentemente
        </p>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Última Utilização</th>
                <th>Dias Parado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in idleEquipment" :key="item.equipment.id">
                <td class="font-mono font-bold">{{ item.equipment.code }}</td>
                <td>{{ item.equipment.name }}</td>
                <td>
                  <div class="badge badge-ghost">{{ item.equipment.category }}</div>
                </td>
                <td>{{ item.lastUsed || 'Nunca' }}</td>
                <td>
                  <div class="badge badge-warning">
                    {{ item.daysIdle }} dias
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Event Reports -->
    <div v-if="currentTab === 'events'" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">Relatório por Evento</h2>
          <div class="badge badge-primary badge-lg">{{ appStore.events.length }} eventos</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div v-for="event in appStore.events" :key="event.id"
            class="card bg-base-100 shadow-sm border-2 border-white compact">
            <div class="card-body p-4">
              <div class="flex justify-between items-start gap-2">
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-sm truncate">{{ event.name }}</h3>
                  <p class="text-xs text-base-content/60 truncate">📍 {{ event.location || 'Local não definido' }}</p>
                  <p class="text-xs text-base-content/60">📅 {{ formatDate(event.start_date) }}</p>
                </div>
                <div class="badge badge-xs" :class="getEventStatusClass(event.status)">
                  {{ getEventStatusText(event.status) }}
                </div>
              </div>

              <div class="flex gap-3 mt-2 text-center">
                <div class="flex-1 bg-warning/10 rounded p-1">
                  <p class="text-xs text-base-content/60">Retirados</p>
                  <p class="font-bold text-warning">{{ getEventWithdrawals(event.id).length }}</p>
                </div>
                <div class="flex-1 bg-success/10 rounded p-1">
                  <p class="text-xs text-base-content/60">Devolvidos</p>
                  <p class="font-bold text-success">{{ getEventReturns(event.id).length }}</p>
                </div>
              </div>

              <button v-if="getEventTransactions(event.id).length > 0" @click="toggleEventExpansion(event.id)"
                class="btn btn-xs btn-ghost w-full mt-2 gap-1">
                <span class="text-lg font-bold">{{ expandedEvents.includes(event.id) ? '−' : '+' }}</span> {{
                  expandedEvents.includes(event.id) ? 'Ocultar' : 'Ver itens' }}
                <span class="badge badge-xs">{{ getEventTransactions(event.id).length }}</span>
              </button>

              <!-- Lista expandida de itens -->
              <div v-if="expandedEvents.includes(event.id)" class="mt-2 space-y-1 max-h-48 overflow-y-auto">
                <div class="text-xs font-semibold text-base-content/70 mb-1">Movimentações:</div>
                <div v-for="transaction in getEventTransactions(event.id)" :key="transaction.id"
                  class="flex items-center gap-2 text-xs p-1 rounded bg-base-200/50">
                  <span class="badge badge-xs"
                    :class="transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL' ? 'badge-warning' : 'badge-success'">
                    {{ transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL' ? '⬆️' : '⬇️' }}
                  </span>
                  <span class="flex-1 truncate">
                    <template v-if="transaction.bag_id">
                      📦 {{ getBagName(transaction.bag_id) }}
                    </template>
                    <template v-else>
                      {{ getEquipmentName(transaction.equipment_id) }}
                    </template>
                  </span>
                  <span class="text-base-content/50">{{ formatDate(transaction.scheduled_date || transaction.created_at)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Equipment, Event, Transaction, Reservation } from '~/types'

// Type for combined movements (transactions + reservations)
interface Movement {
  id: string;
  type: "withdrawal" | "return" | "reservation";
  equipment_id?: string;
  bag_id?: string;
  event_id?: string;
  user_id?: string;
  created_at: string;
  status?: string;
}

definePageMeta({
  middleware: ['auth']
})

const appStore = useAppStore()

import { formatDateOnlyBR } from "~/utils/dateUtils";
import { useUserAvatar } from "~/composables/useUserAvatar";

const { getAvatarByUserId } = useUserAvatar();

// Carregar dados ao montar
onMounted(async () => {
  await Promise.all([
    appStore.fetchEquipment(),
    appStore.fetchEvents(),
    appStore.fetchTransactions(),
    appStore.fetchBags(),
    appStore.fetchUsers(),
    appStore.fetchReservations()
  ])

  // DEBUG: Log transações com bag_id
  const bagsTransactions = appStore.transactions.filter(t => t.bag_id)
  console.log('Transações com bag_id:', bagsTransactions.length, bagsTransactions)
})

const currentTab = ref('transactions')

// Filtros para transações
const transactionTypeFilter = ref('')
const transactionItemTypeFilter = ref('')
const transactionSearch = ref('')
const expandedBags = ref<string[]>([])

// Filtros para Fora do Estoque
const outOfStockStatusFilter = ref('')
const outOfStockCategoryFilter = ref('')
const outOfStockSearch = ref('')

// Estado de eventos expandidos (Por Evento)
const expandedEvents = ref<string[]>([])

// Toggle expansão de bag
const toggleBagExpansion = (transactionId: string) => {
  const index = expandedBags.value.indexOf(transactionId)
  if (index === -1) {
    expandedBags.value.push(transactionId)
  } else {
    expandedBags.value.splice(index, 1)
  }
}

const reportTabs = [
  { value: 'transactions', label: '📊 Movimentações' },
  { value: 'out-of-stock', label: '📤 Fora do Estoque' },
  { value: 'most-used', label: '🏆 Mais Utilizados' },
  { value: 'idle', label: '💤 Parados' },
  { value: 'events', label: '📅 Por Evento' }
]

const equipmentOutOfStock = computed(() => {
  return appStore.equipment.filter(e => e.status !== 'available')
})

// Categorias únicas de equipamentos
const equipmentCategories = computed(() => {
  const categories = new Set(appStore.equipment.map(e => e.category))
  return Array.from(categories).sort()
})

// Fora do Estoque filtrado
const filteredOutOfStock = computed(() => {
  let result = equipmentOutOfStock.value

  // Filtro por status
  if (outOfStockStatusFilter.value) {
    result = result.filter(e => e.status === outOfStockStatusFilter.value)
  }

  // Filtro por categoria
  if (outOfStockCategoryFilter.value) {
    result = result.filter(e => e.category === outOfStockCategoryFilter.value)
  }

  // Filtro por busca (código ou nome)
  if (outOfStockSearch.value) {
    const search = outOfStockSearch.value.toLowerCase()
    result = result.filter(e =>
      e.code.toLowerCase().includes(search) ||
      e.name.toLowerCase().includes(search)
    )
  }

  return result
})

// Toggle expansão de evento
const toggleEventExpansion = (eventId: string) => {
  const index = expandedEvents.value.indexOf(eventId)
  if (index === -1) {
    expandedEvents.value.push(eventId)
  } else {
    expandedEvents.value.splice(index, 1)
  }
}

// Computed para eventos em andamento e concluídos
const eventsInProgress = computed(() => {
  return appStore.events.filter(e =>
    e.status === 'in_progress' || e.status === 'confirmed' || e.status === 'planned'
  ).length
})

const eventsCompleted = computed(() => {
  return appStore.events.filter(e => e.status === 'completed').length
})

// Combine transactions and reservations into movements
const allMovementsSorted = computed<Movement[]>(() => {
  const movements: Movement[] = [];

  // Add transactions
  appStore.transactions.forEach((t) => {
    movements.push({
      id: t.id,
      type: t.transaction_type === "withdrawal" ? "withdrawal" : "return",
      equipment_id: t.equipment_id,
      bag_id: t.bag_id,
      event_id: t.event_id,
      user_id: t.user_id,
      created_at: t.created_at,
      status: t.status,
    });
  });

  // Add reservations as type 'reservation'
  appStore.reservations.forEach((r) => {
    movements.push({
      id: `res-${r.id}`,
      type: "reservation",
      equipment_id: r.equipment_id,
      bag_id: r.bag_id,
      event_id: r.event_id,
      user_id: r.reserved_by,
      created_at: r.created_at,
      status: r.status,
    });
  });

  // Sort by date (most recent first)
  return movements.sort((a, b) => {
    const dateA = new Date(b.created_at || '').getTime()
    const dateB = new Date(a.created_at || '').getTime()
    return dateA - dateB
  });
})

// Movimentos filtrados
const filteredMovements = computed(() => {
  let result = allMovementsSorted.value

  // Filtro por tipo de movimentação
  if (transactionTypeFilter.value) {
    result = result.filter(m => m.type === transactionTypeFilter.value)
  }

  // Filtro por tipo de item (equipamento ou bag)
  if (transactionItemTypeFilter.value === 'equipment') {
    result = result.filter(m => m.equipment_id && !m.bag_id)
  } else if (transactionItemTypeFilter.value === 'bag') {
    result = result.filter(m => m.bag_id)
  }

  // Filtro por busca (equipamento ou bag)
  if (transactionSearch.value) {
    const search = transactionSearch.value.toLowerCase()
    result = result.filter(m => {
      // Busca em equipamento
      if (m.equipment_id) {
        const equipment = appStore.getEquipmentById(m.equipment_id)
        if (equipment && (
          equipment.code.toLowerCase().includes(search) ||
          equipment.name.toLowerCase().includes(search)
        )) return true
      }
      // Busca em bag
      if (m.bag_id) {
        const bag = appStore.bags.find(b => b.id === m.bag_id)
        if (bag && (
          bag.code.toLowerCase().includes(search) ||
          bag.name.toLowerCase().includes(search)
        )) return true
      }
      return false
    })
  }

  return result
})

// Movement type helpers
const getMovementTypeClass = (movement: Movement) => {
  const classes: Record<string, string> = {
    withdrawal: "badge-warning",
    return: "badge-success",
    reservation: "badge-info",
  };
  return classes[movement.type] || "badge-ghost";
};

const getMovementTypeText = (movement: Movement) => {
  const texts: Record<string, string> = {
    withdrawal: "⬆️ Retirada",
    return: "⬇️ Devolução",
    reservation: "📋 Reserva",
  };
  return texts[movement.type] || movement.type;
};

const utilizationRate = computed(() => {
  if (appStore.equipment.length === 0) return 0
  return Math.round((appStore.inUseEquipment.length / appStore.equipment.length) * 100)
})

const mostUsedEquipment = computed(() => {
  const usageCount = new Map<string, number>()

  appStore.transactions.forEach(t => {
    if (t.transaction_type?.toUpperCase() === 'WITHDRAWAL') {
      if (t.equipment_id) {
        // Equipamento individual
        usageCount.set(t.equipment_id, (usageCount.get(t.equipment_id) || 0) + 1)
      } else if (t.bag_id) {
        // Bag - contar para todos os equipamentos da bag
        const bagEquipments = appStore.equipment.filter(e => e.bag_id === t.bag_id)
        bagEquipments.forEach(equip => {
          usageCount.set(equip.id, (usageCount.get(equip.id) || 0) + 1)
        })
      }
    }
  })

  return Array.from(usageCount.entries())
    .map(([id, count]) => ({
      equipment: appStore.getEquipmentById(id)!,
      count
    }))
    .filter(item => item.equipment)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

const idleEquipment = computed(() => {
  const today = new Date()

  return appStore.equipment
    .filter(e => e.status === 'available')
    .map(equipment => {
      // Buscar última transação do equipamento (individual ou via bag)
      let lastTransaction = null

      // Transações individuais
      const individualTransactions = appStore.transactions
        .filter(t => t.equipment_id === equipment.id)
        .sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())

      // Transações de bags que contenham este equipamento
      const bagTransactions = appStore.transactions
        .filter(t => t.bag_id === equipment.bag_id && t.transaction_type?.toUpperCase() === 'WITHDRAWAL')
        .sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())

      // Pegar a mais recente entre individual e bag
      const allTransactions = [...individualTransactions, ...bagTransactions]
      lastTransaction = allTransactions.sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())[0]

      const lastUsed = lastTransaction ? new Date(lastTransaction.scheduled_date || lastTransaction.created_at || '') : null
      const daysIdle = lastUsed
        ? Math.floor((today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        : 999

      return {
        equipment,
        lastUsed: lastUsed ? formatDate(lastUsed.toISOString()) : null,
        daysIdle
      }
    })
    .filter(item => item.daysIdle > 30)
    .sort((a, b) => b.daysIdle - a.daysIdle)
})

const getLastTransaction = (equipmentId: string) => {
  const transaction = appStore.transactions
    .filter(t => t.equipment_id === equipmentId)
    .sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())[0]

  return transaction ? formatDate(transaction.scheduled_date || transaction.created_at || '') : 'N/A'
}

const getEquipmentLocation = (equipmentId: string) => {
  const transaction = appStore.transactions
    .filter(t => t.equipment_id === equipmentId && t.transaction_type?.toUpperCase() === 'WITHDRAWAL')
    .sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())[0]

  if (transaction) {
    const event = appStore.getEventById(transaction.event_id)
    return event ? event.name : 'Desconhecido'
  }

  return 'Estoque'
}

const getEventTransactions = (eventId: string) => {
  return appStore.transactions.filter(t => t.event_id === eventId)
}

const getEventWithdrawals = (eventId: string) => {
  return appStore.transactions.filter(t => t.event_id === eventId && t.transaction_type?.toUpperCase() === 'WITHDRAWAL')
}

const getEventReturns = (eventId: string) => {
  return appStore.transactions.filter(t => t.event_id === eventId && t.transaction_type?.toUpperCase() === 'RETURN')
}

const getEquipmentName = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'Desconhecido'
  return appStore.getEquipmentById(equipmentId)?.name || 'Desconhecido'
}

const getEquipmentCode = (equipmentId: string | undefined) => {
  if (!equipmentId) return '-'
  return appStore.getEquipmentById(equipmentId)?.code || '-'
}

const getBagCode = (bagId: string | undefined) => {
  if (!bagId) return '-'
  return appStore.bags.find(b => b.id === bagId)?.code || '-'
}

const getBagName = (bagId: string | undefined) => {
  if (!bagId) return 'Desconhecida'
  return appStore.bags.find(b => b.id === bagId)?.name || 'Desconhecida'
}

const getBagEquipmentCount = (bagId: string | undefined) => {
  if (!bagId) return 0
  return appStore.equipment.filter(e => e.bag_id === bagId).length
}

const getBagEquipment = (bagId: string | undefined) => {
  if (!bagId) return []
  return appStore.equipment.filter(e => e.bag_id === bagId)
}

const getEquipmentStatus = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'available'
  return appStore.getEquipmentById(equipmentId)?.status || 'available'
}

const getBagStatus = (bagId: string | undefined) => {
  if (!bagId) return 'available'
  return appStore.bags.find(b => b.id === bagId)?.status || 'available'
}

const getBagStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    available: 'badge-success',
    reserved: 'badge-info',
    in_use: 'badge-warning',
    excluded: 'badge-neutral'
  }
  return classes[status] || 'badge-ghost'
}

const getBagStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservada',
    in_use: 'Em Uso',
    excluded: 'Excluída'
  }
  return texts[status] || status
}

const getEventName = (eventId: string | undefined) => {
  if (!eventId) return 'Sem evento'
  return appStore.getEventById(eventId)?.name || 'Desconhecido'
}

const getEventCode = (eventId: string | undefined) => {
  if (!eventId) return '-'
  return appStore.getEventById(eventId)?.code || '-'
}

const getUserName = (userId: string | undefined) => {
  if (!userId) return 'Sistema'
  return appStore.getUserById(userId)?.username || 'Desconhecido'
}

const getUserInitial = (userId: string | undefined) => {
  const name = getUserName(userId)
  return name.charAt(0).toUpperCase()
}

const formatTime = (date: string | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const getTransactionStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'badge-info',
    confirmed: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-error'
  }
  return classes[status] || 'badge-ghost'
}

const getTransactionStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'Registrado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }
  return texts[status] || status
}

const formatDate = (date: string | undefined) => formatDateOnlyBR(date);

const getEquipmentStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    available: 'badge-success',
    reserved: 'badge-info',
    in_use: 'badge-warning',
    maintenance: 'badge-error',
    excluded: 'badge-neutral'
  }
  return classes[status] || 'badge-ghost'
}

const getEquipmentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    in_use: 'Em Uso',
    maintenance: 'Manutenção',
    excluded: 'Excluído'
  }
  return texts[status] || status
}

const getEventStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    planned: 'badge-info',
    confirmed: 'badge-success',
    in_progress: 'badge-warning',
    completed: 'badge-neutral',
    cancelled: 'badge-error'
  }
  return classes[status] || 'badge-ghost'
}

const getEventStatusText = (status: string) => {
  const texts: Record<string, string> = {
    planned: 'Planejado',
    confirmed: 'Confirmado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }
  return texts[status] || status
}

const getConditionClass = (condition: string) => {
  const classes: Record<string, string> = {
    excellent: 'badge-success',
    good: 'badge-success',
    fair: 'badge-warning',
    poor: 'badge-error',
    damaged: 'badge-error'
  }
  return classes[condition] || 'badge-ghost'
}

const getConditionText = (condition: string) => {
  const texts: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular',
    poor: 'Ruim',
    damaged: 'Danificado'
  }
  return texts[condition] || condition
}
</script>
