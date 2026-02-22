<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Gerenciamento de Eventos</h1>
      <button @click="openNewEventModal" class="btn btn-primary mr-16">
        + Novo Evento
      </button>
    </div>

    <!-- Tabs: Previstos / Concluídos -->
    <div class="tabs tabs-boxed bg-base-200 p-1 w-fit">
      <a @click="eventTab = 'upcoming'" :class="['tab tab-lg', eventTab === 'upcoming' ? 'tab-active' : '']">
        📅 Previstos
        <span class="badge badge-sm ml-2">{{ upcomingEventsCount }}</span>
      </a>
      <a @click="eventTab = 'completed'" :class="['tab tab-lg', eventTab === 'completed' ? 'tab-active' : '']">
        ✅ Concluídos
        <span class="badge badge-sm ml-2">{{ completedEventsCount }}</span>
      </a>
    </div>

    <!-- Upcoming Events (Calendar) -->
    <div v-if="eventTab === 'upcoming'">
      <!-- Calendar Controls -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex flex-wrap gap-4 justify-between items-center">
            <div class="flex gap-2">
              <button @click="previousPeriod" class="btn btn-circle btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button @click="today" class="btn btn-sm">Hoje</button>
              <button @click="nextPeriod" class="btn btn-circle btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <h2 class="text-2xl font-bold">{{ currentPeriodLabel }}</h2>

            <div class="flex gap-2">
              <button v-for="view in views" :key="view" @click="currentView = view"
                :class="['btn btn-sm', currentView === view ? 'btn-primary' : 'btn-ghost']">
                {{ viewLabels[view] }}
              </button>
            </div>
          </div>

          <!-- Month View -->
          <div v-if="currentView === 'month'" class="mt-6">
            <div class="grid grid-cols-7 gap-1 sm:gap-2">
              <div v-for="day in weekDays" :key="day" class="text-center font-bold p-2 text-sm sm:text-base">
                {{ day }}
              </div>
              <div v-for="day in calendarDays" :key="day.date" :class="[
                'min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border rounded-lg cursor-pointer transition-all hover:bg-base-300/50',
                day.isCurrentMonth ? 'bg-base-100' : 'bg-base-200/50 opacity-60',
                day.isToday ? 'ring-2 ring-primary ring-offset-1' : ''
              ]" @click="openDayEvents(day)">
                <div class="text-sm sm:text-base font-semibold mb-1" :class="day.isToday ? 'text-primary' : ''">
                  {{ day.dayNumber }}
                </div>
                <div class="space-y-1">
                  <a v-for="event in day.events.slice(0, 3)" :key="event.id" :href="`/events/${event.id}`"
                    target="_blank" rel="noopener" :class="[
                      'text-xs sm:text-sm p-1 rounded truncate block font-medium',
                      'cursor-pointer hover:opacity-80 transition-opacity'
                    ]"
                    :style="{ backgroundColor: getEventColor(event) + '30', color: getEventColor(event), borderLeft: `3px solid ${getEventColor(event)}` }"
                    @click.stop="() => { }">
                    {{ event.name }}
                  </a>
                  <div v-if="day.events.length > 3" class="text-xs text-base-content/60 font-medium">
                    +{{ day.events.length - 3 }} mais
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Week View -->
          <div v-if="currentView === 'week'" class="mt-6">
            <div class="grid grid-cols-7 gap-2">
              <div v-for="(day, index) in weekCalendarDays" :key="index"
                class="min-h-[400px] border rounded-lg bg-base-100 overflow-hidden">
                <div class="p-2 text-center font-bold border-b sticky top-0 bg-base-200"
                  :class="day.isToday ? 'bg-primary text-primary-content' : ''">
                  <div class="text-sm">{{ weekDays[index] }}</div>
                  <div class="text-lg">{{ day.dayNumber }}</div>
                </div>
                <div class="p-2 space-y-2 overflow-y-auto max-h-[350px]">
                  <a v-for="event in day.events" :key="event.id" :href="`/events/${event.id}`" target="_blank"
                    rel="noopener" class="block p-2 rounded-lg text-sm hover:opacity-80 transition-opacity" :style="{
                      backgroundColor: getEventColor(event) + '20',
                      borderLeft: `4px solid ${getEventColor(event)}`,
                      color: getEventColor(event)
                    }" @click.stop="() => { }">
                    <div class="font-semibold truncate">{{ event.name }}</div>
                    <div class="text-xs opacity-80">
                      {{ formatEventTime(event) }}
                    </div>
                  </a>
                  <div v-if="day.events.length === 0" class="text-center text-base-content/40 py-4 text-sm">
                    Sem eventos
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day View -->
          <div v-if="currentView === 'day'" class="mt-6">
            <div class="space-y-2">
              <div v-for="hour in 24" :key="hour" class="flex gap-4 border-b pb-2">
                <div class="w-20 text-sm font-semibold">
                  {{ hour.toString().padStart(2, '0') }}:00
                </div>
                <div class="flex-1">
                  <a v-for="event in getEventsForHour(hour)" :key="event.id" :href="`/events/${event.id}`"
                    target="_blank" rel="noopener" :class="[
                      'p-2 rounded-lg mb-2 cursor-pointer hover:opacity-80 block'
                    ]"
                    :style="{ backgroundColor: getEventColor(event) + '40', borderLeft: `4px solid ${getEventColor(event)}` }">
                    <div class="font-semibold">{{ event.name }}</div>
                    <div class="text-sm">{{ event.type }}</div>
                    <div class="text-xs">{{ event.location }}</div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-if="currentView === 'list'" class="mt-6">
            <div class="space-y-4">
              <div v-for="event in upcomingEvents" :key="event.id" class="card bg-base-200 shadow">
                <div class="card-body">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="card-title">{{ event.name }}</h3>
                      <p class="text-sm">🎤 {{ event.type }}</p>
                      <p class="text-sm">📍 {{ event.location }}</p>
                      <p class="text-sm">📅 {{ formatEventDate(event) }}</p>
                      <div class="badge mt-2" :style="{ backgroundColor: getEventColor(event), color: 'white' }">
                        {{ getStatusText(event.status) }}
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <a :href="`/events/${event.id}`" target="_blank" rel="noopener"
                        class="btn btn-sm btn-ghost">Ver</a>
                      <button @click="editEvent(event)" class="btn btn-sm btn-primary">Editar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Events -->
    <div v-if="eventTab === 'completed'">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">Eventos Concluídos</h2>

          <div v-if="completedEvents.length === 0" class="text-center py-8 text-base-content/60">
            Nenhum evento concluído ainda
          </div>

          <div v-else class="space-y-4">
            <div v-for="event in completedEvents" :key="event.id" class="card bg-base-200 shadow">
              <div class="card-body">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="card-title">{{ event.name }}</h3>
                    <p class="text-sm">🎤 {{ event.type }}</p>
                    <p class="text-sm">📍 {{ event.location }}</p>
                    <p class="text-sm">📅 {{ formatEventDate(event) }}</p>
                    <div class="badge badge-success mt-2">
                      ✅ Concluído
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <a :href="`/events/${event.id}`" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">Ver
                      Detalhes</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New/Edit Event Modal -->
    <Modal id="event-modal" :title="editingEvent ? 'Editar Evento' : 'Novo Evento'" v-model="showEventModal" size="lg">
      <form @submit.prevent="saveEvent" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.code" label="Código" placeholder="EVT-001" required />

          <FormInput v-model="eventForm.name" label="Título do Evento" placeholder="Nome do evento" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.type" label="Tipo" placeholder="Tipo do evento" required />

          <FormInput v-model="eventForm.category" label="Categoria" placeholder="Categoria do evento" />
        </div>

        <FormInput v-model="eventForm.location" label="Local" placeholder="Local do evento" />

        <div class="grid grid-cols-2 gap-4">
          <FormInput v-model="eventForm.startDate" label="Data/Hora Início" type="datetime-local" required />

          <FormInput v-model="eventForm.endDate" label="Data/Hora Fim" type="datetime-local" required />
        </div>

        <FormSelect v-model="eventForm.status" label="Status" :options="statusOptions" required />

        <FormTextarea v-model="eventForm.description" label="Descrição" placeholder="Descrição do evento" :rows="3" />

        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="showEventModal = false" class="btn btn-ghost">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingEvent ? 'Atualizar' : 'Criar' }} Evento
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Event, EventStatus } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const appStore = useAppStore()
const router = useRouter()

// Função para gerar cor do evento baseado no status
const getEventColor = (event: Event) => {
  const colorMap: Record<string, string> = {
    'planned': '#3b82f6',
    'confirmed': '#10b981',
    'in_progress': '#f59e0b',
    'completed': '#6b7280',
    'cancelled': '#ef4444'
  }

  return colorMap[event.status] || '#8b5cf6'
}

// Função para traduzir status
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'planned': 'Planejado',
    'confirmed': 'Confirmado',
    'in_progress': 'Em Andamento',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  }
  return statusMap[status] || status
}

// Carregar eventos ao montar a página
onMounted(async () => {
  await appStore.fetchEvents()
})

const eventTab = ref<'upcoming' | 'completed'>('upcoming')
const currentView = ref<'month' | 'week' | 'day' | 'list'>('month')
const currentDate = ref(new Date())
const showEventModal = ref(false)
const editingEvent = ref<Event | null>(null)

const views = ['month', 'week', 'day', 'list']
const viewLabels = {
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  list: 'Lista'
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const statusOptions = [
  { value: 'planned', label: 'Planejado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
]

const eventForm = ref({
  code: '',
  name: '',
  type: '',
  category: '',
  location: '',
  startDate: '',
  endDate: '',
  status: 'planned' as EventStatus,
  description: ''
})

const currentPeriodLabel = computed(() => {
  const date = currentDate.value
  const tz = 'America/Sao_Paulo'
  if (currentView.value === 'month') {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: tz })
  } else if (currentView.value === 'week') {
    return `Semana de ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: tz })}`
  } else {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz })
  }
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  const days = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dayEvents = appStore.events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.toDateString() === current.toDateString()
    })

    days.push({
      date: new Date(current),
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.toDateString() === new Date().toDateString(),
      events: dayEvents
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

// Computed para visão de semana
const weekCalendarDays = computed(() => {
  const date = new Date(currentDate.value)
  // Ir para o domingo da semana atual
  const dayOfWeek = date.getDay()
  date.setDate(date.getDate() - dayOfWeek)

  const days = []
  for (let i = 0; i < 7; i++) {
    const current = new Date(date)
    current.setDate(date.getDate() + i)

    const dayEvents = appStore.events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.toDateString() === current.toDateString()
    }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    days.push({
      date: new Date(current),
      dayNumber: current.getDate(),
      isToday: current.toDateString() === new Date().toDateString(),
      events: dayEvents
    })
  }

  return days
})

const formatEventTime = (event: Event) => {
  const start = new Date(event.start_date)
  const end = new Date(event.end_date)
  return `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

const upcomingEvents = computed(() => {
  const now = new Date()
  return appStore.events
    .filter(e => {
      // Incluir eventos que ainda não começaram (futuros)
      const isFuture = new Date(e.start_date) >= now
      // Incluir eventos em andamento (já começaram mas ainda não terminaram)
      const isInProgress = e.status === 'in_progress' ||
        (new Date(e.start_date) <= now && new Date(e.end_date) >= now)
      // Excluir eventos cancelados e concluídos
      const isActive = e.status !== 'cancelled' && e.status !== 'completed'
      return (isFuture || isInProgress) && isActive
    })
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
})

const completedEvents = computed(() => {
  return appStore.events
    .filter(e => e.status === 'completed')
    .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
})

const upcomingEventsCount = computed(() => upcomingEvents.value.length)
const completedEventsCount = computed(() => completedEvents.value.length)

const previousPeriod = () => {
  const date = new Date(currentDate.value)
  if (currentView.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (currentView.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

const nextPeriod = () => {
  const date = new Date(currentDate.value)
  if (currentView.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (currentView.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

const today = () => {
  currentDate.value = new Date()
}

const openNewEventModal = () => {
  editingEvent.value = null
  eventForm.value = {
    code: '',
    name: '',
    type: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'planned' as EventStatus,
    description: ''
  }
  showEventModal.value = true
}

const editEvent = (event: Event) => {
  editingEvent.value = event
  eventForm.value = {
    code: event.code,
    name: event.name,
    type: event.type,
    category: event.category || '',
    location: event.location || '',
    startDate: event.start_date.substring(0, 16),
    endDate: event.end_date.substring(0, 16),
    status: event.status,
    description: event.description || ''
  }
  showEventModal.value = true
}

const viewEvent = (event: Event) => {
  if (!event?.id) {
    return
  }

  // Abrir página de detalhes em nova aba
  if (import.meta.client) {
    const target = router.resolve(`/events/${event.id}`).href
    const newTab = window.open(target, '_blank', 'noopener')
    if (newTab) {
      return
    }
  }

  // Fallback: navegar na mesma aba
  router.push(`/events/${event.id}`)
}

const saveEvent = async () => {
  try {
    const eventData = {
      code: eventForm.value.code,
      name: eventForm.value.name,
      location: eventForm.value.location || undefined,
      type: eventForm.value.type,
      category: eventForm.value.category || undefined,
      status: eventForm.value.status,
      start_date: eventForm.value.startDate,
      end_date: eventForm.value.endDate,
      description: eventForm.value.description || undefined,
    }

    if (editingEvent.value) {
      await appStore.updateEvent(editingEvent.value.id, eventData)
    } else {
      await appStore.createEvent(eventData)
    }

    showEventModal.value = false
    // Recarregar lista
    await appStore.fetchEvents()
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar evento')
  }
}

const deleteEvent = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este evento?')) {
    try {
      await appStore.deleteEvent(id)
      await appStore.fetchEvents()
    } catch (error: any) {
      alert(error.message || 'Erro ao deletar evento')
    }
  }
}

const openDayEvents = (day: any) => {
  if (day.events.length > 0) {
    currentView.value = 'day'
    currentDate.value = new Date(day.date)
  }
}

const getEventsForHour = (hour: number) => {
  return appStore.events.filter(event => {
    const eventDate = new Date(event.start_date)
    return eventDate.toDateString() === currentDate.value.toDateString() &&
      eventDate.getHours() === hour - 1
  })
}

const formatEventDate = (event: any) => {
  const start = new Date(event.start_date)
  const end = new Date(event.end_date)
  return `${start.toLocaleDateString('pt-BR')} ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>