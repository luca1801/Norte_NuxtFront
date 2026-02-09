<template>
  <!-- Loading screen while checking authentication -->
  <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center bg-base-200"
    :data-theme="currentTheme">
    <div class="flex flex-col items-center gap-4">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <span class="text-base-content/60">Verificando autenticação...</span>
    </div>
  </div>

  <div v-else class="min-h-screen bg-base-200" :data-theme="currentTheme">
    <!-- Mobile overlay (when sidebar is open) -->
    <div v-if="mobileSidebarOpen && !isLgUp" class="fixed inset-0 bg-black/40 z-[80]" aria-hidden="true"
      @click="mobileSidebarOpen = false"></div>

    <!-- Sidebar (always lateral; drawer on mobile, fixed on desktop) -->
    <aside
      class="fixed left-0 top-0 bottom-0 bg-base-100 border-r border-base-200/70 shadow-sm flex flex-col transition-[width,transform] duration-200 z-[90] lg:z-[60]"
      :class="[
        isCollapsed ? 'w-20' : 'w-72',
        isLgUp ? 'translate-x-0' : (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'),
      ]" aria-label="Menu lateral">
      <div class="p-4 border-b border-base-200/70">
        <!-- Versão expandida -->
        <div v-show="!isCollapsed" class="flex items-center justify-between gap-2">
          <NuxtLink to="/" class="flex items-center gap-3 font-bold text-lg min-w-0" @click="closeMobileSidebar">
            <span class="leading-none min-w-0">
              <span class="block truncate">Norte Engenharia</span>
              <span class="block text-xs font-normal text-base-content/60 mt-1 truncate">Gestão de ativos</span>
            </span>
          </NuxtLink>

          <div class="flex items-center gap-1">
            <button type="button" class="btn btn-ghost btn-sm btn-square hidden lg:inline-flex"
              :aria-label="isCollapsed ? 'Expandir menu' : 'Recolher menu'" @click="toggleSidebarCollapsed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button type="button" class="btn btn-ghost btn-sm btn-square lg:hidden" aria-label="Fechar menu"
              @click="mobileSidebarOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Versão recolhida - apenas logo clicável -->
        <div v-show="isCollapsed" class="flex justify-center">
          <button type="button" @click="toggleSidebarCollapsed"
            class="cursor-pointer hover:opacity-80 transition-opacity" aria-label="Expandir menu">
            <img
              src="https://norteengenhariabsb.com.br/wp-content/uploads/2025/04/cropped-Norte-Engenharia-Eletrica.png"
              alt="Norte Engenharia" class="w-12 h-12 object-contain" />
          </button>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-2">
        <ul class="menu menu-md gap-1">
          <template v-for="section in navSections" :key="section.key">
            <li v-if="!isCollapsed" class="menu-title">
              <span class="leading-normal">{{ section.title }}</span>
            </li>
            <li v-else class="pointer-events-none select-none py-2">
              <div class="h-px bg-base-200/80"></div>
            </li>

            <li v-for="item in section.items" :key="item.to" v-show="!item.adminOnly || authStore.isAdmin">
              <NuxtLink :to="item.to" class="rounded-xl flex items-center gap-3 w-full" :class="[
                route.path === item.to ? 'active font-semibold' : '',
                isCollapsed ? 'justify-center tooltip tooltip-right' : '',
              ]" :data-tip="isCollapsed ? item.label : null" :aria-label="isCollapsed ? item.label : undefined"
                @click="closeMobileSidebar">
                <span class="relative inline-flex">
                  <component :is="item.icon" class="h-5 w-5 opacity-80" aria-hidden="true" />
                  <span v-if="item.badge && item.badge > 0" v-show="isCollapsed"
                    class="badge badge-xs badge-primary absolute -top-2 -right-2">
                    {{ item.badge }}
                  </span>
                </span>

                <span v-show="!isCollapsed" class="truncate">{{ item.label }}</span>

                <span v-if="item.badge && item.badge > 0" v-show="!isCollapsed"
                  class="badge badge-sm badge-primary ml-auto">
                  {{ item.badge }}
                </span>
              </NuxtLink>
            </li>
          </template>
        </ul>
      </nav>

      <div class="p-3 border-t border-base-200/70 flex items-center justify-center">
        <!-- Theme selector (inside sidebar) -->
        <div class="dropdown dropdown-top">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm"
            :class="isCollapsed ? 'btn-square tooltip tooltip-right' : ''" :data-tip="isCollapsed ? 'Tema' : null"
            :aria-label="isCollapsed ? 'Tema' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span v-show="!isCollapsed" class="ml-2">Tema</span>
          </div>
          <ul tabindex="0" class="dropdown-content z-[100] p-2 shadow-2xl bg-base-300 rounded-box w-52">
            <li v-for="theme in themes" :key="theme">
              <button type="button" class="btn btn-sm btn-ghost justify-between w-full capitalize"
                :class="currentTheme === theme ? 'btn-active' : ''" @click="setTheme(theme)">
                <span>{{ theme }}</span>
                <span class="inline-flex gap-1" :data-theme="theme">
                  <span class="inline-block w-3 h-3 rounded bg-primary" />
                  <span class="inline-block w-3 h-3 rounded bg-secondary" />
                  <span class="inline-block w-3 h-3 rounded bg-accent" />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- Mobile open button (still lateral; no top menu) -->
    <button type="button" class="btn btn-primary btn-circle fixed bottom-4 left-4 z-[70] shadow-lg lg:hidden"
      aria-label="Abrir menu" @click="mobileSidebarOpen = true">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Main content area -->
    <div class="min-h-screen transition-[padding] duration-200"
      :class="isLgUp ? (isCollapsed ? 'pl-20' : 'pl-72') : 'pl-0'">

      <!-- User menu fixo no canto superior direito -->
      <div class="fixed top-4 right-4 z-[70]">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar shadow-lg bg-base-100">
            <div class="w-10 rounded-full" :class="{ 'placeholder bg-primary text-primary-content': !userAvatar }">
              <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="w-full h-full object-cover" />
              <span v-else class="flex items-center justify-center w-full h-full text-lg font-semibold">
                {{ authStore.user?.username?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
          </div>
          <ul tabindex="0"
            class="dropdown-content z-[100] mt-2 p-2 shadow-lg menu menu-sm bg-base-100 rounded-box w-56">
            <li class="menu-title">
              <div class="flex items-center gap-2">
                <span class="truncate">{{ authStore.user?.username }}</span>
                <span class="badge badge-xs" :class="getRoleBadgeClass(authStore.user?.role)">
                  {{ getRoleText(authStore.user?.role) }}
                </span>
              </div>
            </li>
            <li>
              <NuxtLink to="/profile" class="flex items-center gap-2">
                <UserCircleIcon class="h-4 w-4" />
                Configurar Perfil
              </NuxtLink>
            </li>
            <li>
              <a @click="handleLogout" class="flex items-center gap-2 text-error">
                <ArrowLeftOnRectangleIcon class="h-4 w-4" />
                Sair
              </a>
            </li>
          </ul>
        </div>
      </div>

      <main class="p-3 md:p-4 pt-16">
        <slot />
      </main>

      <footer class="footer p-6 bg-base-300 text-base-content relative">
        <div class="w-full text-center">
          <p class="font-semibold text-lg">Norte Engenharia | Sistema de Gestão de Ativos</p>
          <div class="flex flex-wrap justify-center gap-4 text-sm text-base-content/70 mt-2">
            <span class="flex items-center gap-1">
              📞 (61) 98594-7635
            </span>
            <span class="flex items-center gap-1">
              📍 Qd 14, Conjunto A-1, Sobradinho-DF
            </span>
          </div>
          <p class="text-xs text-base-content/50 mt-2">Copyright © 2026</p>
        </div>
        <img src="https://norteengenhariabsb.com.br/wp-content/uploads/2025/04/cropped-Norte-Engenharia-Eletrica.png"
          alt="Norte Engenharia" class="w-40 h-40 object-contain absolute right-6 top-1/2 -translate-y-1/2" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeftOnRectangleIcon,
  ArrowUturnLeftIcon,
  ArrowUpTrayIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

// Avatar do usuário
const { userAvatar } = useUserAvatar()

// Role helpers
const getRoleBadgeClass = (role?: string) => {
  const classes: Record<string, string> = {
    admin: 'badge-primary',
    manager: 'badge-secondary',
    operator: 'badge-accent',
    viewer: 'badge-ghost',
  }
  return classes[role || ''] || 'badge-ghost'
}

const getRoleText = (role?: string) => {
  const texts: Record<string, string> = {
    admin: 'Admin',
    manager: 'Gerente',
    operator: 'Operador',
    viewer: 'Visualizador',
  }
  return texts[role || ''] || role || 'Desconhecido'
}

const themes = ['light', 'dark', 'acid', 'silk']
const currentTheme = ref('light')
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const isLgUp = ref(false)

const isCollapsed = computed(() => isLgUp.value && sidebarCollapsed.value)

const eventsBadge = computed(() => {
  const count = (appStore.upcomingEvents?.length || 0) + (appStore.activeEvents?.length || 0)
  return count > 99 ? 99 : count
})

type NavItem = {
  to: string
  label: string
  icon: any
  adminOnly?: boolean
  badge?: number
}

const navSections = computed(() => {
  const main: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: Squares2X2Icon },
    { to: '/events', label: 'Eventos', icon: CalendarDaysIcon, badge: eventsBadge.value },
    { to: '/reservations', label: 'Reservar', icon: ClipboardDocumentCheckIcon },
    { to: '/withdrawal', label: 'Retirar', icon: ArrowUpTrayIcon },
    { to: '/return', label: 'Devolver', icon: ArrowUturnLeftIcon },
    { to: '/reports', label: 'Relatórios', icon: ChartBarSquareIcon },
    { to: '/employees', label: 'Colaboradores', icon: UsersIcon },
  ]

  const settings: NavItem[] = [
    { to: '/profile', label: 'Perfil', icon: UserCircleIcon },
    { to: '/admin', label: 'Admin', icon: ShieldCheckIcon, adminOnly: true },
  ]

  return [
    { key: 'main', title: 'Menu principal', items: main },
    { key: 'settings', title: 'Configurações', items: settings },
  ]
})

useHead(() => ({
  htmlAttrs: {
    'data-theme': currentTheme.value,
  },
}))

const setTheme = (theme: string) => {
  currentTheme.value = theme
  if (process.client) localStorage.setItem('theme', theme)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const toggleSidebarCollapsed = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const closeMobileSidebar = () => {
  if (!isLgUp.value) mobileSidebarOpen.value = false
}

onMounted(() => {
  if (!process.client) return
  currentTheme.value = localStorage.getItem('theme') || 'light'

  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed !== null) sidebarCollapsed.value = savedCollapsed === 'true'

  const media = window.matchMedia('(min-width: 1024px)')
  const apply = () => {
    isLgUp.value = media.matches
    if (isLgUp.value) mobileSidebarOpen.value = false
  }
  apply()
  media.addEventListener?.('change', apply)
})

watch(sidebarCollapsed, (value) => {
  if (!process.client) return
  localStorage.setItem('sidebar-collapsed', String(value))
})

watch(
  () => route.fullPath,
  () => {
    closeMobileSidebar()
  },
)
</script>
