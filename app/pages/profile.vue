<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Meu Perfil</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body items-center text-center">
          <!-- Avatar com opção de upload -->
          <div class="relative group">
            <div class="avatar" :class="{ 'placeholder': !userAvatar }">
              <div
                class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-neutral text-neutral-content overflow-hidden">
                <img v-if="userAvatar" :src="userAvatar" alt="Foto de perfil" class="object-cover w-full h-full" />
                <span v-else class="text-4xl flex items-center justify-center h-full">{{
                  authStore.user?.username?.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <!-- Overlay de edição -->
            <label for="avatar-upload"
              class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span class="text-white text-sm font-medium">📷 Alterar</span>
            </label>
            <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
              @change="handleAvatarUpload" />
          </div>

          <!-- Botão para remover foto -->
          <button v-if="userAvatar" @click="removeAvatar" class="btn btn-ghost btn-xs text-error mt-2">
            Remover foto
          </button>

          <!-- Info de restrições -->
          <p class="text-xs text-base-content/50 mt-1">JPG, PNG ou WebP • Máx. 8MB</p>

          <h2 class="card-title mt-4">{{ authStore.user?.username }}</h2>
          <p class="text-sm text-base-content/60">{{ authStore.user?.email }}</p>

          <div class="badge badge-lg" :class="getRoleBadgeClass(authStore.user?.role)">
            {{ getRoleText(authStore.user?.role) }}
          </div>

          <!-- Avatar upload error/success messages -->
          <div v-if="avatarError" class="alert alert-error alert-sm mt-2 py-2">
            <span class="text-xs">{{ avatarError }}</span>
          </div>
          <div v-if="avatarSuccess" class="alert alert-success alert-sm mt-2 py-2">
            <span class="text-xs">Foto atualizada com sucesso!</span>
          </div>

          <div class="divider"></div>

          <div class="stats stats-vertical shadow w-full">
            <div class="stat">
              <div class="stat-title text-xs">Minhas Retiradas</div>
              <div class="stat-value text-2xl">{{ myWithdrawals }}</div>
              <div class="stat-desc">Total</div>
            </div>

            <div class="stat">
              <div class="stat-title text-xs">Minhas Devoluções</div>
              <div class="stat-value text-2xl">{{ myReturns }}</div>
              <div class="stat-desc">Total</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div class="lg:col-span-2 card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Informações Pessoais</h2>

          <form @submit.prevent="updateProfile" class="space-y-4">
            <FormInput v-model="profileForm.username" label="Usuário" required />

            <FormInput v-model="profileForm.email" label="Email" type="email" required />

            <div v-if="updateSuccess" class="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Perfil atualizado com sucesso!</span>
            </div>

            <div v-if="updateError" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ updateError }}</span>
            </div>

            <button type="submit" class="btn btn-primary">
              Salvar Alterações
            </button>
          </form>

          <div class="divider"></div>

          <!-- Change Password -->
          <h2 class="card-title">Alterar Senha</h2>

          <form @submit.prevent="changePassword" class="space-y-4">
            <FormInput v-model="passwordForm.currentPassword" label="Senha Atual" type="password" required />

            <FormInput v-model="passwordForm.newPassword" label="Nova Senha" type="password" required minlength="6" />

            <FormInput v-model="passwordForm.confirmPassword" label="Confirmar Nova Senha" type="password" required
              minlength="6" />

            <div v-if="passwordSuccess" class="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Senha alterada com sucesso!</span>
            </div>

            <div v-if="passwordError" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ passwordError }}</span>
            </div>

            <button type="submit" class="btn btn-warning">
              Alterar Senha
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Minhas Atividades Recentes</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Equipamento</th>
                <th>Evento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in myRecentTransactions" :key="transaction.id">
                <td>{{ formatDateTime(transaction.scheduled_date || transaction.actual_date || transaction.created_at)
                }}</td>
                <td>
                  <div class="badge"
                    :class="transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL' ? 'badge-warning' : 'badge-success'">
                    {{ transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL' ? 'Retirada' : 'Devolução' }}
                  </div>
                </td>
                <td>{{ getEquipmentName(transaction.equipment_id) }}</td>
                <td>{{ getEventName(transaction.event_id) }}</td>
                <td>
                  <div class="badge" :class="getStatusClass(transaction.status)">
                    {{ getStatusText(transaction.status) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Avatar Picker Modal -->
    <Modal id="avatar-picker-modal" title="Escolher Avatar" v-model="showAvatarPicker">
      <div class="space-y-4">
        <p class="text-sm text-base-content/60">Selecione um avatar ou cole um URL de imagem:</p>

        <div class="grid grid-cols-4 gap-4">
          <div v-for="(avatar, index) in avatarOptions" :key="index" @click="selectAvatar(avatar)"
            class="avatar cursor-pointer hover:opacity-70 transition-opacity">
            <div class="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img :src="avatar" alt="Avatar option" />
            </div>
          </div>
        </div>

        <div class="divider">OU</div>

        <FormInput v-model="customAvatarUrl" label="URL da Imagem" placeholder="https://exemplo.com/imagem.jpg" />

        <div class="flex justify-end gap-2">
          <button @click="showAvatarPicker = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button @click="saveAvatar" class="btn btn-primary">
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types'
import { authService } from '~/services/api/auth'
import { formatDateShortBR } from "~/utils/dateUtils";

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore()
const appStore = useAppStore()

// Carregar dados ao montar
onMounted(async () => {
  await Promise.all([
    appStore.fetchTransactions(),
    appStore.fetchEquipment(),
    appStore.fetchEvents()
  ])
})

const profileForm = ref({
  username: authStore.user?.username || '',
  email: authStore.user?.email || ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const updateSuccess = ref(false)
const updateError = ref('')
const passwordSuccess = ref(false)
const passwordError = ref('')
const showAvatarPicker = ref(false)
const customAvatarUrl = ref('')
const avatarError = ref('')
const avatarSuccess = ref(false)

// Avatar do usuário (usando composable centralizado)
const { userAvatar, processAvatarUpload, removeAvatar: removeUserAvatar } = useUserAvatar()

// Função para processar upload de avatar
const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  avatarError.value = ''
  avatarSuccess.value = false

  const result = await processAvatarUpload(file)

  if (result.success) {
    avatarSuccess.value = true
    setTimeout(() => {
      avatarSuccess.value = false
    }, 3000)
  } else {
    avatarError.value = result.error || 'Erro ao processar imagem'
  }

  input.value = '' // Limpar input para permitir reenvio do mesmo arquivo
}

// Função para remover avatar
const removeAvatar = () => {
  removeUserAvatar()
  avatarSuccess.value = true
  setTimeout(() => {
    avatarSuccess.value = false
  }, 2000)
}

const avatarOptions = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
]

const myRecentTransactions = computed(() => {
  if (!authStore.user) return []

  return appStore.transactions
    .filter(t => t.user_id === authStore.user!.id)
    .sort((a, b) => new Date(b.scheduled_date || b.created_at || '').getTime() - new Date(a.scheduled_date || a.created_at || '').getTime())
    .slice(0, 10)
})

const myWithdrawals = computed(() => {
  if (!authStore.user) return 0
  return appStore.transactions.filter(t => t.user_id === authStore.user!.id && t.transaction_type?.toUpperCase() === 'WITHDRAWAL').length
})

const myReturns = computed(() => {
  if (!authStore.user) return 0
  return appStore.transactions.filter(t => t.user_id === authStore.user!.id && t.transaction_type?.toUpperCase() === 'RETURN').length
})

const updateProfile = async () => {
  try {
    updateError.value = ''
    updateSuccess.value = false

    const updatedUser = await authStore.updateProfile({
      username: profileForm.value.username,
      email: profileForm.value.email
    })

    // Atualizar formulário com dados retornados
    if (updatedUser) {
      profileForm.value.username = updatedUser.username
      profileForm.value.email = updatedUser.email
    }

    updateSuccess.value = true
    setTimeout(() => {
      updateSuccess.value = false
    }, 3000)
  } catch (error: any) {
    updateError.value = error.message || 'Erro ao atualizar perfil'
  }
}

const changePassword = async () => {
  try {
    passwordError.value = ''
    passwordSuccess.value = false

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordError.value = 'As senhas não coincidem'
      return
    }

    if (passwordForm.value.newPassword.length < 8) {
      passwordError.value = 'A senha deve ter no mínimo 8 caracteres'
      return
    }

    // Chamar API para alterar senha
    await authService.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )

    passwordSuccess.value = true
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    setTimeout(() => {
      passwordSuccess.value = false
    }, 3000)
  } catch (error: any) {
    passwordError.value = error.message || 'Erro ao alterar senha'
  }
}

const selectAvatar = (avatarUrl: string) => {
  customAvatarUrl.value = avatarUrl
}

const saveAvatar = () => {
  if (customAvatarUrl.value) {
    authStore.updateProfile({
      avatar: customAvatarUrl.value
    })
    showAvatarPicker.value = false
    customAvatarUrl.value = ''
  }
}

const formatDateTime = (date: string | undefined) => formatDateShortBR(date);

const getEquipmentName = (equipmentId: string | undefined) => {
  if (!equipmentId) return 'Desconhecido'
  return appStore.getEquipmentById(equipmentId)?.name || 'Desconhecido'
}

const getEventName = (eventId: string | undefined) => {
  if (!eventId) return 'Desconhecido'
  return appStore.getEventById(eventId)?.name || 'Desconhecido'
}

const getStatusClass = (status: string | undefined) => {
  const classes: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-error'
  }
  return classes[status || ''] || 'badge-ghost'
}

const getStatusText = (status: string | undefined) => {
  const texts: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }
  return texts[status || ''] || status || 'N/A'
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
</script>
