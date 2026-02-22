<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Retirada de Equipamentos</h1>

    <!-- Step Indicator -->
    <ul class="steps steps-vertical lg:steps-horizontal w-full">
      <li class="step" :class="currentStep >= 1 ? 'step-primary' : ''">Selecionar Evento</li>
      <li class="step" :class="currentStep >= 2 ? 'step-primary' : ''">Escanear QR Code</li>
      <li class="step" :class="currentStep >= 3 ? 'step-primary' : ''">Confirmar Retirada</li>
    </ul>

    <!-- Step 1: Select Event -->
    <div v-if="currentStep === 1" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Selecione o Evento</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div v-for="event in upcomingEvents" :key="event.id" @click="selectEvent(event)" :class="[
            'card bg-base-200 cursor-pointer hover:shadow-lg transition-all',
            selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''
          ]">
            <div class="card-body">
              <h3 class="card-title text-lg">{{ event.name }}</h3>
              <p class="text-sm text-base-content/60">{{ event.code }}</p>
              <p class="text-sm">🎤 {{ event.type }}</p>
              <p class="text-sm">📍 {{ event.location }}</p>
              <p class="text-sm">📅 {{ formatEventDate(event.start_date) }}</p>
              <div class="badge mt-2" :class="getEventStatusClass(event.status)">
                {{ getEventStatusText(event.status) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="upcomingEvents.length === 0" class="text-center py-8">
          <p class="text-base-content/60">Nenhum evento programado encontrado</p>
        </div>

        <div class="card-actions justify-end mt-4">
          <button @click="currentStep = 2" class="btn btn-primary" :disabled="!selectedEvent">
            Próximo
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Scan QR Code -->
    <div v-if="currentStep === 2" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Escanear Equipamento</h2>
        <p class="text-sm text-base-content/60 mb-4">
          Evento selecionado: <span class="font-bold">{{ selectedEvent?.name }}</span>
        </p>

        <QRScanner @scan="handleScan" />

        <!-- Error Message -->
        <div v-if="withdrawalError" class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ withdrawalError }}</span>
        </div>

        <!-- Warning Message -->
        <div v-if="withdrawalWarning" class="alert alert-warning mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ withdrawalWarning }}</span>
        </div>

        <div class="card-actions justify-between mt-4">
          <button @click="currentStep = 1" class="btn btn-ghost">
            Voltar
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Confirm Withdrawal -->
    <div v-if="currentStep === 3" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Confirmar Retirada</h2>

        <!-- Bag Info -->
        <div v-if="scannedBag" class="space-y-4">
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">📦 {{ scannedBag.name }}</h3>
              <div class="text-xs">Código: {{ scannedBag.code }}</div>
            </div>
          </div>

          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Equipamentos na Bag ({{ bagEquipments.length }})</h4>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="equip in bagEquipments" :key="equip.id">
                    <td class="font-mono font-bold">{{ equip.code }}</td>
                    <td>{{ equip.name }}</td>
                    <td>
                      <div class="badge badge-ghost badge-sm">{{ equip.category }}</div>
                    </td>
                    <td>
                      <div class="badge badge-sm" :class="getEquipmentStatusClass(equip.status)">
                        {{ getEquipmentStatusText(equip.status) }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <form @submit.prevent="confirmWithdrawal" class="space-y-4">
            <FormSelect v-model="withdrawalForm.condition" label="Condição dos Equipamentos" :options="conditionOptions"
              required />

            <FormTextarea v-model="withdrawalForm.notes" label="Observações"
              placeholder="Adicione observações sobre a retirada (opcional)" :rows="3" />

            <div v-if="withdrawalWarning" class="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ withdrawalWarning }}</span>
            </div>

            <div v-if="withdrawalError" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ withdrawalError }}</span>
            </div>

            <div class="card-actions justify-between">
              <button type="button" @click="currentStep = 2" class="btn btn-ghost">
                Voltar
              </button>
              <button type="submit" class="btn btn-primary">
                Confirmar Retirada ({{ bagEquipments.length }} itens)
              </button>
            </div>
          </form>
        </div>

        <!-- Equipment Info -->
        <div v-else-if="scannedEquipment" class="space-y-4">
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">{{ scannedEquipment.name }}</h3>
              <div class="text-xs">Código: {{ scannedEquipment.code }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-base-content/60">Código</p>
              <p class="font-mono font-bold">{{ scannedEquipment.code }}</p>
            </div>
            <div>
              <p class="text-sm text-base-content/60">Categoria</p>
              <p>{{ scannedEquipment.category }}</p>
            </div>
            <div>
              <p class="text-sm text-base-content/60">Condição</p>
              <p class="font-semibold">{{ getConditionText(scannedEquipment.condition) }}</p>
            </div>
            <div>
              <p class="text-sm text-base-content/60">Status Atual</p>
              <div class="badge" :class="getEquipmentStatusClass(scannedEquipment.status)">
                {{ getEquipmentStatusText(scannedEquipment.status) }}
              </div>
            </div>
            <div v-if="scannedEquipment.location" class="col-span-2">
              <p class="text-sm text-base-content/60">Localização</p>
              <p>{{ scannedEquipment.location }}</p>
            </div>
          </div>

          <form @submit.prevent="confirmWithdrawal" class="space-y-4">
            <FormSelect v-model="withdrawalForm.condition" label="Condição do Equipamento" :options="conditionOptions"
              required />

            <FormTextarea v-model="withdrawalForm.notes" label="Observações"
              placeholder="Adicione observações sobre a retirada (opcional)" :rows="3" />

            <div v-if="withdrawalWarning" class="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ withdrawalWarning }}</span>
            </div>

            <div v-if="withdrawalError" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ withdrawalError }}</span>
            </div>

            <div class="card-actions justify-between">
              <button type="button" @click="currentStep = 2" class="btn btn-ghost">
                Voltar
              </button>
              <button type="submit" class="btn btn-primary">
                Confirmar Retirada
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Recent Withdrawals -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Retiradas Recentes</h2>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Data/Hora</th>
                <th>Equipamento</th>
                <th>Evento</th>
                <th>Condição</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="transaction in recentWithdrawals" :key="transaction.id">
                <tr class="hover">
                  <td>
                    <button v-if="transaction.bag_id" @click="toggleExpandBag(transaction.id)"
                      class="btn btn-xs btn-circle btn-ghost text-lg font-bold">
                      {{ expandedBags.has(transaction.id) ? '−' : '+' }}
                    </button>
                  </td>
                  <td>{{ formatDateTime(transaction.scheduled_date || transaction.created_at) }}</td>
                  <td>
                    <div class="font-bold">
                      {{ transaction.equipment_id ? getEquipmentName(transaction.equipment_id) : (transaction.bag_id ?
                        getBagName(transaction.bag_id) : 'N/A') }}
                    </div>
                  </td>
                  <td>{{ getEventName(transaction.event_id) }}</td>
                  <td>
                    <div class="badge badge-success">
                      {{ transaction.status }}
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="avatar" :class="{ 'placeholder': !getAvatarByUserId(transaction.user_id) }">
                        <div class="bg-neutral text-neutral-content rounded-full w-6 overflow-hidden">
                          <img v-if="getAvatarByUserId(transaction.user_id)"
                            :src="getAvatarByUserId(transaction.user_id)" :alt="getUserName(transaction.user_id)"
                            class="w-full h-full object-cover" />
                          <span v-else class="text-xs">{{ getUserName(transaction.user_id).charAt(0).toUpperCase()
                            }}</span>
                        </div>
                      </div>
                      <span>{{ getUserName(transaction.user_id) }}</span>
                    </div>
                  </td>
                </tr>

                <template v-if="transaction.bag_id && expandedBags.has(transaction.id)">
                  <tr v-for="equipment in getBagEquipments(transaction.bag_id)"
                    :key="`${transaction.id}-${equipment.id}`" class="bg-base-200/50">
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
                    <td colspan="2" class="text-xs text-base-content/60">
                      {{ equipment.category }} • {{ getEquipmentStatusText(equipment.status) }}
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Modal id="success-modal" title="Retirada Confirmada!" v-model="showSuccessModal"
      @update:modelValue="onSuccessModalClose">
      <div class="text-center space-y-4">
        <div class="text-6xl">✅</div>
        <p class="text-lg">Equipamento retirado com sucesso!</p>
        <p class="text-sm text-base-content/60">Você será redirecionado em alguns segundos...</p>
        <button @click="resetForm" class="btn btn-primary w-full">
          Nova Retirada
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useWithdrawal } from "~/composables/features/useWithdrawal";
import { formatDateTimeBR, formatDateShortBR } from "~/utils/dateUtils";
import { useUserAvatar } from "~/composables/useUserAvatar";

definePageMeta({
  middleware: ["auth"],
});

const { getAvatarByUserId } = useUserAvatar();

const {
  // State
  currentStep,
  selectedEvent,
  scannedEquipment,
  scannedBag,
  bagEquipments,
  withdrawalError,
  withdrawalWarning,
  showSuccessModal,
  withdrawalForm,
  conditionOptions,
  // Computed
  upcomingEvents,
  recentWithdrawals,
  // Actions
  loadData,
  selectEvent,
  handleScan,
  confirmWithdrawal,
  resetForm,
  // Helpers
  getEquipmentStatusClass,
  getEquipmentStatusText,
  getUserName,
  getEventName,
  getEquipmentName,
  getBagName,
  getConditionText,
  getEventStatusClass,
  getEventStatusText,
  // Expansion helpers
  expandedBags,
  toggleExpandBag,
  getBagEquipments,
} = useWithdrawal();

// Carregar dados ao montar
onMounted(loadData);

// Auto-reset após sucesso
const onSuccessModalClose = (isOpen: boolean) => {
  if (!isOpen) {
    resetForm();
  }
};

// Auto-redirect após sucesso
watch(showSuccessModal, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      resetForm();
    }, 2500);
  }
});

const formatEventDate = (date: string) => formatDateTimeBR(date);
const formatDateTime = (date: string) => formatDateShortBR(date);
</script>
