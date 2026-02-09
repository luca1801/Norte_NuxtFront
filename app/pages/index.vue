<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <div class="text-sm text-base-content/60 mr-16">
        {{ currentDate }}
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stats shadow bg-base-100 border-l-4 border-primary">
        <div class="stat">
          <div class="stat-title text-base-content/70">Eventos Ativos</div>
          <div class="stat-value text-primary">{{ eventStats.planned + eventStats.confirmed + eventStats.inProgress }}
          </div>
          <div class="stat-desc text-base-content/60">Planejados, confirmados ou em andamento</div>
        </div>
      </div>

      <div class="stats shadow bg-base-100 border-l-4 border-success">
        <div class="stat">
          <div class="stat-title text-base-content/70">Em Estoque</div>
          <div class="stat-value text-success">{{ equipmentStats.available }}</div>
          <div class="stat-desc text-base-content/60">Disponíveis</div>
        </div>
      </div>

      <div class="stats shadow bg-base-100 border-l-4 border-warning">
        <div class="stat">
          <div class="stat-title text-base-content/70">Retirados</div>
          <div class="stat-value text-warning">{{ equipmentStats.inUse }}</div>
          <div class="stat-desc text-base-content/60">Em uso</div>
        </div>
      </div>

      <div class="stats shadow bg-base-100 border-l-4 border-info">
        <div class="stat">
          <div class="stat-title text-base-content/70">Manutenção</div>
          <div class="stat-value text-info">{{ equipmentStats.maintenance }}</div>
          <div class="stat-desc text-base-content/60">Em reparo</div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 class="card-title">
            Últimas Movimentações
            <div class="badge badge-secondary">{{ filteredTransactions.length }}</div>
          </h2>

          <!-- Campo de Busca -->
          <div class="form-control">
            <div class="input-group">
              <input v-model="searchQuery" type="text" placeholder="Buscar equipamento ou bag..."
                class="input input-bordered input-sm w-64" />
              <button v-if="searchQuery" @click="searchQuery = ''" class="btn btn-sm btn-ghost">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Item</th>
                <th>Evento</th>
                <th>Usuário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="movement in filteredTransactions" :key="movement.id">
                <!-- Linha principal -->
                <tr class="hover">
                  <td>
                    <!-- Botão de expandir apenas para bags -->
                    <button v-if="movement.bag_id" @click="toggleExpandBag(movement.id)"
                      class="btn btn-xs btn-circle btn-ghost text-lg font-bold">
                      {{ expandedBags.has(movement.id) ? '−' : '+' }}
                    </button>
                  </td>
                  <td>{{ formatDate(movement.created_at) }}
                  </td>
                  <td>
                    <div class="badge" :class="getMovementTypeClass(movement)">
                      {{ getMovementTypeText(movement) }}
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span v-if="movement.bag_id" class="text-lg">📦</span>
                      <span v-else class="text-lg">🔧</span>
                      <div>
                        <div class="font-bold">{{ getMovementItemName(movement) }}</div>
                        <div class="text-xs text-base-content/60">{{ getMovementItemCode(movement) }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ getEventName(movement.event_id) }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="avatar" :class="{ 'placeholder': !getAvatarByUserId(movement.user_id) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                          <img v-if="getAvatarByUserId(movement.user_id)" :src="getAvatarByUserId(movement.user_id)"
                            :alt="getUserName(movement.user_id)" class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ getUserName(movement.user_id).charAt(0).toUpperCase()
                          }}</span>
                        </div>
                      </div>
                      <span class="text-sm">{{ getUserName(movement.user_id) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="badge" :class="getMovementStatusClass(movement)">
                      {{ getMovementStatusText(movement) }}
                    </div>
                  </td>
                </tr>

                <!-- Linhas expandidas com equipamentos da bag -->
                <template v-if="movement.bag_id && expandedBags.has(movement.id)">
                  <tr v-for="equipment in getBagEquipments(movement.bag_id)" :key="`${movement.id}-${equipment.id}`"
                    class="bg-base-200/50">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="pl-10">
                      <div class="flex items-center gap-2">
                        <span class="text-sm">└─</span>
                        <span class="text-base">🔧</span>
                        <div>
                          <div class="font-medium text-sm">{{ equipment.name }}</div>
                          <div class="text-xs text-base-content/60">{{ equipment.code }}</div>
                        </div>
                      </div>
                    </td>
                    <td colspan="3" class="text-xs text-base-content/60">
                      {{ equipment.category }} • {{ getEquipmentStatusText(equipment.status) }}
                    </td>
                  </tr>
                </template>
              </template>

              <!-- Mensagem quando não há transações -->
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="7" class="text-center py-8 text-base-content/60">
                  {{ searchQuery ? 'Nenhuma movimentação encontrada para a busca.' : 'Nenhuma movimentação registrada.'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Próximos Eventos -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">
            📅 Próximos Eventos
            <div class="badge badge-secondary">{{ upcomingEvents.length }}</div>
          </h2>
          <NuxtLink to="/events" class="btn btn-ghost btn-sm">
            Ver Todos →
          </NuxtLink>
        </div>

        <div v-if="upcomingEvents.length === 0" class="text-center py-8">
          <div class="text-5xl mb-4">📭</div>
          <p class="text-base-content/60">Nenhum evento próximo encontrado</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="event in upcomingEvents" :key="event.id"
            class="card bg-base-200 hover:shadow-lg transition-all cursor-pointer" @click="navigateToEvent(event.id)">
            <div class="card-body p-4">
              <h3 class="card-title text-base">{{ event.name }}</h3>
              <p class="text-sm text-base-content/60">{{ event.code }}</p>
              <div class="flex flex-col gap-1 text-sm">
                <span>🎤 {{ event.type }}</span>
                <span>📍 {{ event.location || 'Local não informado' }}</span>
                <span>📅 {{ formatEventDate(event.start_date) }}</span>
              </div>
              <div class="card-actions justify-end mt-2">
                <div class="badge" :class="getEventStatusClass(event.status)">
                  {{ getEventStatusText(event.status) }}
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
import { useDashboard } from "~/composables/features/useDashboard";
import { formatDateTimeBR } from "~/utils/dateUtils";
import { useUserAvatar } from "~/composables/useUserAvatar";

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const { getAvatarByUserId } = useUserAvatar();

// Usar composable do dashboard
const {
  searchQuery,
  expandedBags,
  equipmentStats,
  eventStats,
  filteredTransactions,
  upcomingEvents,
  loadData,
  toggleExpandBag,
  getItemName,
  getItemCode,
  getBagEquipments,
  getUserName,
  getEventName,
  getTransactionStatusClass,
  getTransactionStatusText,
  getEquipmentStatusText,
  getEventStatusClass,
  getEventStatusText,
  // Movement helpers (for combined transactions + reservations)
  getMovementItemName,
  getMovementItemCode,
  getMovementStatusClass,
  getMovementStatusText,
  getMovementTypeClass,
  getMovementTypeText,
  currentDate,
} = useDashboard();

// Carregar dados
onMounted(loadData);
onActivated(loadData);

// Navegação
const navigateToEvent = (eventId: string) => {
  router.push(`/events/${eventId}`);
};

// Formatação de datas
const formatDate = (date: string) => formatDateTimeBR(date);

const formatEventDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" });
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  return `${weekday}, ${day} às ${time}`;
};

// Debug panel for development to inspect equipment and movement IDs
// ...existing code...
</script>
