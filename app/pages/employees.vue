<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Colaboradores</h1>
      <div class="flex gap-2 mr-16">
        <input v-model="searchQuery" type="text" placeholder="Buscar colaborador..." class="input input-bordered" />
      </div>
    </div>

    <!-- Employee Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="employee in filteredEmployees" :key="employee.id"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow compact">
        <div class="card-body items-center text-center p-4">
          <div class="avatar" :class="{ 'placeholder': !getEmployeeAvatar(employee.id) }">
            <div
              class="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-neutral text-neutral-content overflow-hidden">
              <img v-if="getEmployeeAvatar(employee.id)" :src="getEmployeeAvatar(employee.id)" :alt="employee.username"
                class="w-full h-full object-cover" />
              <span v-else class="text-xl flex items-center justify-center h-full">{{
                employee.username.charAt(0).toUpperCase() }}</span>
            </div>
          </div>

          <h2 class="card-title text-base mt-3">{{ employee.username }}</h2>

          <div class="badge badge-sm" :class="getRoleBadgeClass(employee.role)">
            {{ getRoleText(employee.role) }}
          </div>

          <div class="divider my-1"></div>

          <div class="w-full space-y-1 text-left">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-xs truncate">{{ employee.email }}</span>
            </div>

          </div>

          <div class="divider my-1"></div>

          <!-- Employee Stats -->
          <div class="stats stats-horizontal shadow w-full scale-90">
            <div class="stat place-items-center px-2 py-1">
              <div class="stat-title text-[10px]">Retiradas</div>
              <div class="stat-value text-sm">{{ getEmployeeWithdrawals(employee.id) }}</div>
            </div>

            <div class="stat place-items-center px-2 py-1">
              <div class="stat-title text-[10px]">Devoluções</div>
              <div class="stat-value text-sm">{{ getEmployeeReturns(employee.id) }}</div>
            </div>
          </div>

          <button @click="viewEmployeeDetails(employee)" class="btn btn-primary btn-xs w-full mt-2">
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredEmployees.length === 0" class="text-center py-12">
      <p class="text-base-content/60 text-lg">Nenhum colaborador encontrado</p>
    </div>

    <!-- Employee Details Modal -->
    <Modal id="employee-details-modal" :title="selectedEmployee?.username" v-model="showDetailsModal" size="lg">
      <div v-if="selectedEmployee" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="avatar" :class="{ 'placeholder': !getEmployeeAvatar(selectedEmployee.id) }">
            <div
              class="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-neutral text-neutral-content overflow-hidden">
              <img v-if="getEmployeeAvatar(selectedEmployee.id)" :src="getEmployeeAvatar(selectedEmployee.id)"
                :alt="selectedEmployee.username" class="w-full h-full object-cover" />
              <span v-else class="text-2xl flex items-center justify-center h-full">{{
                selectedEmployee.username.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-bold">{{ selectedEmployee.username }}</h3>
            <div class="badge" :class="getRoleBadgeClass(selectedEmployee.role)">
              {{ getRoleText(selectedEmployee.role) }}
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-base-content/60">Email</p>
            <p class="font-semibold">{{ selectedEmployee.email }}</p>
          </div>
          <div>
            <p class="text-sm text-base-content/60">Status</p>
            <div class="badge" :class="selectedEmployee.is_active ? 'badge-success' : 'badge-error'">
              {{ selectedEmployee.is_active ? 'Ativo' : 'Inativo' }}
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div>
          <h4 class="font-bold mb-2">Estatísticas de Atividade</h4>
          <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div class="stat">
              <div class="stat-title">Total de Retiradas</div>
              <div class="stat-value text-primary">{{ getEmployeeWithdrawals(selectedEmployee.id) }}</div>
              <div class="stat-desc">Equipamentos retirados</div>
            </div>

            <div class="stat">
              <div class="stat-title">Total de Devoluções</div>
              <div class="stat-value text-secondary">{{ getEmployeeReturns(selectedEmployee.id) }}</div>
              <div class="stat-desc">Equipamentos devolvidos</div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-bold mb-2">Últimas Transações</h4>
          <div class="overflow-x-auto">
            <table class="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Equipamento</th>
                  <th>Evento</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in getEmployeeTransactions(selectedEmployee.id).slice(0, 5)"
                  :key="transaction.id">
                  <td class="text-xs">{{ formatDateTime(transaction.scheduled_date || transaction.created_at) }}</td>
                  <td>
                    <div class="badge badge-xs"
                      :class="transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL' ? 'badge-warning' : 'badge-success'">
                      {{ transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL' ? 'Retirada' : 'Devolução' }}
                    </div>
                  </td>
                  <td class="text-xs">{{ getEquipmentName(transaction.equipment_id) }}</td>
                  <td class="text-xs">{{ getEventName(transaction.event_id) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const appStore = useAppStore()

// Carregar dados ao montar
onMounted(async () => {
  await Promise.all([
    appStore.fetchUsers(),
    appStore.fetchTransactions(),
    appStore.fetchEquipment(),
    appStore.fetchEvents()
  ])
})

const searchQuery = ref('')
const selectedEmployee = ref<User | null>(null)
const showDetailsModal = ref(false)

const filteredEmployees = computed(() => {
  // Filtrar apenas usuários ativos
  const activeUsers = appStore.users.filter(u => u.is_active !== false)

  if (!searchQuery.value) {
    return activeUsers
  }

  const query = searchQuery.value.toLowerCase()
  return activeUsers.filter(employee =>
    (employee.username?.toLowerCase() || '').includes(query) ||
    (employee.email?.toLowerCase() || '').includes(query)
  )
})

const getEmployeeWithdrawals = (userId: string) => {
  return appStore.transactions.filter(t => t.user_id === userId && t.transaction_type?.toUpperCase() === 'WITHDRAWAL').length
}

const getEmployeeReturns = (userId: string) => {
  return appStore.transactions.filter(t => t.user_id === userId && t.transaction_type?.toUpperCase() === 'RETURN').length
}

const getEmployeeTransactions = (userId: string) => {
  return appStore.transactions
    .filter(t => t.user_id === userId)
    .sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())
}

const viewEmployeeDetails = (employee: User) => {
  selectedEmployee.value = employee
  showDetailsModal.value = true
}

const formatDateTime = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEquipmentName = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'Desconhecido'
  return appStore.getEquipmentById(equipmentId)?.name || 'Desconhecido'
}

const getEventName = (eventId: string | undefined) => {
  if (!eventId) return 'Desconhecido'
  return appStore.getEventById(eventId)?.name || 'Desconhecido'
}

const getRoleBadgeClass = (role: string | undefined) => {
  const classes: Record<string, string> = {
    admin: 'badge-primary',
    manager: 'badge-secondary',
    operator: 'badge-accent',
    viewer: 'badge-ghost'
  }
  return classes[role || ''] || 'badge-ghost'
}

const getRoleText = (role: string | undefined) => {
  const texts: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    operator: 'Operador',
    viewer: 'Visualizador'
  }
  return texts[role || ''] || role || 'N/A'
}

// Função para buscar avatar de um usuário específico do localStorage
const getEmployeeAvatar = (userId: string | undefined): string | null => {
  if (!userId || !import.meta.client) return null
  return localStorage.getItem(`user_avatar_${userId}`)
}
</script>
