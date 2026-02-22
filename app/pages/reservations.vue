<template>
    <div id="reservations-page" class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold">Reservar</h1>
                <p class="text-base-content/60">Gerencie reservas de equipamentos para eventos</p>
            </div>
        </div>

        <!-- Tabs -->
        <div role="tablist" class="tabs tabs-box">
            <button type="button" role="tab" class="tab" :class="{ 'tab-active': activeTab === 'available' }"
                @click="activeTab = 'available'">
                <span class="flex items-center gap-2">
                    <CheckCircleIcon class="w-4 h-4" />
                    Disponíveis
                    <span class="badge badge-sm badge-success">{{ availableItems.length }}</span>
                </span>
            </button>
            <button type="button" role="tab" class="tab" :class="{ 'tab-active': activeTab === 'reserved' }"
                @click="activeTab = 'reserved'">
                <span class="flex items-center gap-2">
                    <ClockIcon class="w-4 h-4" />
                    Reservados
                    <span class="badge badge-sm badge-warning">{{ reservedItems.length }}</span>
                </span>
            </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3">
            <button v-if="activeTab === 'available'" type="button" class="btn btn-primary"
                :disabled="selectedItems.length === 0" @click="openReserveModal">
                <PlusIcon class="w-4 h-4" />
                Adicionar a Evento
                <span v-if="selectedItems.length > 0" class="badge badge-sm">{{ selectedItems.length }}</span>
            </button>
            <button v-if="activeTab === 'reserved'" type="button" class="btn btn-warning"
                :disabled="selectedItems.length === 0" @click="confirmRemoveReservation">
                <MinusIcon class="w-4 h-4" />
                Tirar da Reserva
                <span v-if="selectedItems.length > 0" class="badge badge-sm">{{ selectedItems.length }}</span>
            </button>
            <button type="button" class="btn btn-ghost btn-sm" @click="clearSelection">
                <XCircleIcon class="w-4 h-4" />
                Limpar Seleção
            </button>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-wrap gap-4">
            <input v-model="searchQuery" type="text" placeholder="Buscar por código ou nome..."
                class="input input-bordered input-sm w-full max-w-xs" />
            <select v-model="categoryFilter" class="select select-bordered select-sm">
                <option value="">Todas as categorias</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select v-model="typeFilter" class="select select-bordered select-sm">
                <option value="">Todos os tipos</option>
                <option value="equipment">Equipamentos</option>
                <option value="bag">Bags</option>
            </select>
        </div>

        <!-- Available Items Tab -->
        <div v-if="activeTab === 'available'" class="space-y-4">
            <div v-if="loading" class="flex justify-center py-8">
                <span class="loading loading-spinner loading-lg"></span>
            </div>

            <div v-else-if="filteredAvailableItems.length === 0" class="text-center py-8 text-base-content/60">
                <CubeIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum item disponível encontrado</p>
            </div>

            <div v-else class="grid gap-3">
                <!-- Select All -->
                <div class="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
                    <input type="checkbox" class="checkbox checkbox-sm" :checked="isAllSelected"
                        @change="toggleSelectAll" />
                    <span class="text-sm font-medium">Selecionar todos ({{ filteredAvailableItems.length }})</span>
                </div>

                <!-- Items List -->
                <div class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <div v-for="item in filteredAvailableItems" :key="item.id"
                        class="card card-compact bg-base-100 shadow-sm border border-base-200 cursor-pointer transition-all hover:shadow-md"
                        :class="{ 'ring-2 ring-primary': isSelected(item) }" @click="toggleSelect(item)">
                        <div class="card-body flex-row items-center gap-3">
                            <input type="checkbox" class="checkbox checkbox-primary checkbox-sm"
                                :checked="isSelected(item)" @click.stop @change="toggleSelect(item)" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span v-if="item.type === 'bag'" class="badge badge-sm badge-secondary">Bag</span>
                                    <span v-else class="badge badge-sm badge-ghost">Equip.</span>
                                    <span class="font-mono text-xs text-base-content/60">{{ item.code }}</span>
                                </div>
                                <p class="font-medium truncate">{{ item.name }}</p>
                                <p v-if="item.category" class="text-xs text-base-content/60">{{ item.category }}</p>
                            </div>
                            <div class="badge badge-success badge-sm">Disponível</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reserved Items Tab -->
        <div v-if="activeTab === 'reserved'" class="space-y-4">
            <div v-if="loading" class="flex justify-center py-8">
                <span class="loading loading-spinner loading-lg"></span>
            </div>

            <div v-else-if="filteredReservedItems.length === 0" class="text-center py-8 text-base-content/60">
                <CalendarIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum item reservado encontrado</p>
            </div>

            <div v-else class="grid gap-3">
                <!-- Select All -->
                <div class="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
                    <input type="checkbox" class="checkbox checkbox-sm" :checked="isAllReservedSelected"
                        @change="toggleSelectAllReserved" />
                    <span class="text-sm font-medium">Selecionar todos ({{ filteredReservedItems.length }})</span>
                </div>

                <!-- Items List -->
                <div class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <div v-for="item in filteredReservedItems" :key="item.id"
                        class="card card-compact bg-base-100 shadow-sm border border-base-200 cursor-pointer transition-all hover:shadow-md"
                        :class="{ 'ring-2 ring-warning': isSelected(item) }" @click="toggleSelect(item)">
                        <div class="card-body flex-row items-center gap-3">
                            <input type="checkbox" class="checkbox checkbox-warning checkbox-sm"
                                :checked="isSelected(item)" @click.stop @change="toggleSelect(item)" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span v-if="item.type === 'bag'" class="badge badge-sm badge-secondary">Bag</span>
                                    <span v-else class="badge badge-sm badge-ghost">Equip.</span>
                                    <span class="font-mono text-xs text-base-content/60">{{ item.code }}</span>
                                </div>
                                <p class="font-medium truncate">{{ item.name }}</p>
                                <p v-if="item.category" class="text-xs text-base-content/60">{{ item.category }}</p>
                                <p v-if="item.eventName" class="text-xs text-primary">📅 {{ item.eventName }}</p>
                            </div>
                            <div class="badge badge-warning badge-sm">Reservado</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reserve Modal -->
        <dialog ref="reserveModal" class="modal">
            <div class="modal-box max-w-lg">
                <h3 class="font-bold text-lg mb-4">Reservar para Evento</h3>

                <div class="space-y-4">
                    <div class="alert alert-info">
                        <InformationCircleIcon class="w-5 h-5" />
                        <span>Você selecionou <strong>{{ selectedItems.length }}</strong> item(ns) para reservar.</span>
                    </div>

                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Selecione o Evento</span>
                        </label>
                        <select v-model="selectedEventId" class="select select-bordered w-full">
                            <option value="">Escolha um evento...</option>
                            <option v-for="event in availableEvents" :key="event.id" :value="event.id">
                                {{ event.name }} ({{ formatDate(event.start_date) }})
                            </option>
                        </select>
                    </div>

                    <div v-if="selectedEvent" class="card bg-base-200">
                        <div class="card-body p-4">
                            <h4 class="font-semibold">{{ selectedEvent.name }}</h4>
                            <p class="text-sm text-base-content/70">
                                📅 {{ formatDate(selectedEvent.start_date) }} - {{ formatDate(selectedEvent.end_date) }}
                            </p>
                            <p v-if="selectedEvent.location" class="text-sm text-base-content/70">
                                📍 {{ selectedEvent.location }}
                            </p>
                        </div>
                    </div>

                    <!-- Selected items summary -->
                    <div class="collapse collapse-arrow bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title font-medium">
                            Ver itens selecionados ({{ selectedItems.length }})
                        </div>
                        <div class="collapse-content">
                            <ul class="space-y-1 text-sm">
                                <li v-for="item in selectedItems" :key="item.id" class="flex items-center gap-2">
                                    <span class="badge badge-xs"
                                        :class="item.type === 'bag' ? 'badge-secondary' : 'badge-ghost'">
                                        {{ item.type === 'bag' ? 'Bag' : 'Eq.' }}
                                    </span>
                                    <span class="font-mono text-xs">{{ item.code }}</span>
                                    <span class="truncate">{{ item.name }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="closeReserveModal">Cancelar</button>
                    <button type="button" class="btn btn-primary" :disabled="!selectedEventId || reserving"
                        @click="executeReservation">
                        <span v-if="reserving" class="loading loading-spinner loading-sm"></span>
                        Confirmar Reserva
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button type="button" @click="closeReserveModal">close</button>
            </form>
        </dialog>

        <!-- Remove Reservation Confirmation Modal -->
        <dialog ref="removeModal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Remover Reserva</h3>

                <div class="space-y-4">
                    <div class="alert alert-warning">
                        <ExclamationTriangleIcon class="w-5 h-5" />
                        <span>Você está prestes a remover a reserva de <strong>{{ selectedItems.length }}</strong>
                            item(ns).</span>
                    </div>

                    <p class="text-base-content/70">
                        Os itens voltarão a ficar disponíveis para outros eventos.
                    </p>

                    <!-- Selected items summary -->
                    <div class="collapse collapse-arrow bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title font-medium">
                            Ver itens selecionados ({{ selectedItems.length }})
                        </div>
                        <div class="collapse-content">
                            <ul class="space-y-1 text-sm">
                                <li v-for="item in selectedItems" :key="item.id" class="flex items-center gap-2">
                                    <span class="badge badge-xs"
                                        :class="item.type === 'bag' ? 'badge-secondary' : 'badge-ghost'">
                                        {{ item.type === 'bag' ? 'Bag' : 'Eq.' }}
                                    </span>
                                    <span class="font-mono text-xs">{{ item.code }}</span>
                                    <span class="truncate">{{ item.name }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="closeRemoveModal">Cancelar</button>
                    <button type="button" class="btn btn-warning" :disabled="removing"
                        @click="executeRemoveReservation">
                        <span v-if="removing" class="loading loading-spinner loading-sm"></span>
                        Confirmar Remoção
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button type="button" @click="closeRemoveModal">close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
    CheckCircleIcon,
    ClockIcon,
    PlusIcon,
    MinusIcon,
    CubeIcon,
    CalendarIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
} from '@heroicons/vue/24/outline'
import { useAppStore } from '~/stores/app'
import { useAuthStore } from '~/stores/auth'
import type { Equipment, Bag, Event, Reservation } from '~/types'

definePageMeta({
    middleware: ['auth'],
    layout: 'default',
})

interface SelectableItem {
    id: string
    code: string
    name: string
    category?: string
    type: 'equipment' | 'bag'
    status: string
    eventId?: string
    eventName?: string
    reservationId?: string
}

const appStore = useAppStore()
const authStore = useAuthStore()

// State
const activeTab = ref<'available' | 'reserved'>('available')
const searchQuery = ref('')
const categoryFilter = ref('')
const typeFilter = ref('')
const selectedItems = ref<SelectableItem[]>([])
const selectedEventId = ref('')
const loading = ref(false)
const reserving = ref(false)
const removing = ref(false)

// Refs for modals
const reserveModal = ref<HTMLDialogElement>()
const removeModal = ref<HTMLDialogElement>()

// Computed
const categories = computed(() => {
    const cats = new Set<string>()
    appStore.equipment.forEach(eq => {
        if (eq.category) cats.add(eq.category)
    })
    return Array.from(cats).sort()
})

const availableEvents = computed(() => {
    // RN: Reservas só podem ser feitas para eventos confirmados ou em andamento
    return appStore.events.filter(e =>
        e.status === 'confirmed' || e.status === 'in_progress'
    )
})

const selectedEvent = computed(() => {
    if (!selectedEventId.value) return null
    return appStore.events.find(e => e.id === selectedEventId.value)
})

// Map equipment and bags to selectable items
const availableItems = computed<SelectableItem[]>(() => {
    const items: SelectableItem[] = []

    // Available equipment (RN: Equipment belonging to a bag cannot be reserved individually)
    appStore.equipment
        .filter(eq => eq.status === 'available' && !eq.bag_id)
        .forEach(eq => {
            items.push({
                id: eq.id,
                code: eq.code,
                name: eq.name,
                category: eq.category,
                type: 'equipment',
                status: eq.status,
            })
        })

    // Available bags
    appStore.bags
        .filter(b => b.status === 'available')
        .forEach(b => {
            items.push({
                id: b.id,
                code: b.code,
                name: b.name,
                type: 'bag',
                status: b.status,
            })
        })

    return items
})

const reservedItems = computed<SelectableItem[]>(() => {
    const items: SelectableItem[] = []

    // Reserved equipment with reservation info
    appStore.equipment
        .filter(eq => eq.status === 'reserved')
        .forEach(eq => {
            const reservation = appStore.reservations.find(
                r => r.equipment_id === eq.id && r.status === 'active'
            )
            const event = reservation ? appStore.events.find(e => e.id === reservation.event_id) : null

            items.push({
                id: eq.id,
                code: eq.code,
                name: eq.name,
                category: eq.category,
                type: 'equipment',
                status: eq.status,
                eventId: reservation?.event_id,
                eventName: event?.name,
                reservationId: reservation?.id,
            })
        })

    // Reserved bags with reservation info
    appStore.bags
        .filter(b => b.status === 'reserved')
        .forEach(b => {
            const reservation = appStore.reservations.find(
                r => r.bag_id === b.id && r.status === 'active'
            )
            const event = reservation ? appStore.events.find(e => e.id === reservation.event_id) : null

            items.push({
                id: b.id,
                code: b.code,
                name: b.name,
                type: 'bag',
                status: b.status,
                eventId: reservation?.event_id,
                eventName: event?.name,
                reservationId: reservation?.id,
            })
        })

    return items
})

const filteredAvailableItems = computed(() => {
    return filterItems(availableItems.value)
})

const filteredReservedItems = computed(() => {
    return filterItems(reservedItems.value)
})

const isAllSelected = computed(() => {
    const items = filteredAvailableItems.value
    return items.length > 0 && items.every(item => isSelected(item))
})

const isAllReservedSelected = computed(() => {
    const items = filteredReservedItems.value
    return items.length > 0 && items.every(item => isSelected(item))
})

// Methods
function filterItems(items: SelectableItem[]): SelectableItem[] {
    return items.filter(item => {
        const matchesSearch = !searchQuery.value ||
            item.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesCategory = !categoryFilter.value ||
            item.category === categoryFilter.value

        const matchesType = !typeFilter.value ||
            item.type === typeFilter.value

        return matchesSearch && matchesCategory && matchesType
    })
}

function isSelected(item: SelectableItem): boolean {
    return selectedItems.value.some(s => s.id === item.id && s.type === item.type)
}

function toggleSelect(item: SelectableItem): void {
    const index = selectedItems.value.findIndex(s => s.id === item.id && s.type === item.type)
    if (index >= 0) {
        selectedItems.value.splice(index, 1)
    } else {
        selectedItems.value.push(item)
    }
}

function toggleSelectAll(): void {
    const items = filteredAvailableItems.value
    if (isAllSelected.value) {
        // Deselect all
        items.forEach(item => {
            const index = selectedItems.value.findIndex(s => s.id === item.id && s.type === item.type)
            if (index >= 0) selectedItems.value.splice(index, 1)
        })
    } else {
        // Select all
        items.forEach(item => {
            if (!isSelected(item)) selectedItems.value.push(item)
        })
    }
}

function toggleSelectAllReserved(): void {
    const items = filteredReservedItems.value
    if (isAllReservedSelected.value) {
        // Deselect all
        items.forEach(item => {
            const index = selectedItems.value.findIndex(s => s.id === item.id && s.type === item.type)
            if (index >= 0) selectedItems.value.splice(index, 1)
        })
    } else {
        // Select all
        items.forEach(item => {
            if (!isSelected(item)) selectedItems.value.push(item)
        })
    }
}

function clearSelection(): void {
    selectedItems.value = []
}

function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Modal functions
function openReserveModal(): void {
    selectedEventId.value = ''
    reserveModal.value?.showModal()
}

function closeReserveModal(): void {
    reserveModal.value?.close()
}

function confirmRemoveReservation(): void {
    removeModal.value?.showModal()
}

function closeRemoveModal(): void {
    removeModal.value?.close()
}

// Reserve execution
async function executeReservation(): Promise<void> {
    if (!selectedEventId.value || selectedItems.value.length === 0) return

    const event = appStore.events.find(e => e.id === selectedEventId.value)
    if (!event) return

    reserving.value = true

    try {
        // Create reservations for each selected item
        for (const item of selectedItems.value) {
            const reservationData = {
                equipment_id: item.type === 'equipment' ? item.id : undefined,
                bag_id: item.type === 'bag' ? item.id : undefined,
                event_id: selectedEventId.value,
                reserved_by: authStore.user!.id,
                start_date: event.start_date,
                end_date: event.end_date,
            }

            await appStore.addReservation(reservationData)
        }

        // Save count before clearing
        const reservedCount = selectedItems.value.length

        // Refresh data
        await Promise.all([
            appStore.fetchEquipment(),
            appStore.fetchBags(),
            appStore.fetchReservations(),
        ])

        clearSelection()
        closeReserveModal()

        // Show success message
        alert(`${reservedCount} item(ns) reservado(s) com sucesso!`)
    } catch (error: any) {
        console.error('Reservation error:', error)
        alert(`Erro ao reservar: ${error.message || 'Erro desconhecido'}`)
    } finally {
        reserving.value = false
    }
}

// Remove reservation execution
async function executeRemoveReservation(): Promise<void> {
    if (selectedItems.value.length === 0) return

    removing.value = true

    try {
        // Save count before processing
        const removedCount = selectedItems.value.length

        // Cancel reservations for each selected item
        for (const item of selectedItems.value) {
            if (item.reservationId) {
                await appStore.cancelReservation(item.reservationId)
            }
        }

        // Refresh data
        await Promise.all([
            appStore.fetchEquipment(),
            appStore.fetchBags(),
            appStore.fetchReservations(),
        ])

        clearSelection()
        closeRemoveModal()

        // Show success message
        alert(`${removedCount} reserva(s) removida(s) com sucesso!`)
    } catch (error: any) {
        console.error('Remove reservation error:', error)
        alert(`Erro ao remover reserva: ${error.message || 'Erro desconhecido'}`)
    } finally {
        removing.value = false
    }
}

// Clear selection when switching tabs
watch(activeTab, () => {
    clearSelection()
})

// Fetch data on mount
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            appStore.fetchEquipment(),
            appStore.fetchBags(),
            appStore.fetchEvents(),
            appStore.fetchReservations(),
        ])
    } catch (error) {
        console.error('Error loading data:', error)
    } finally {
        loading.value = false
    }
})
</script>
