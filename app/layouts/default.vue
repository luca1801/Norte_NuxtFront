<template>
  <!-- Loading screen while checking authentication -->
  <ClientOnly>
    <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center bg-base-200"
      :data-theme="currentTheme">
      <div class="flex flex-col items-center gap-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <span class="text-base-content/60">Verificando autenticação...</span>
      </div>
    </div>

    <!-- Layout com Drawer DaisyUI -->
    <div v-else class="drawer lg:drawer-open" :data-theme="currentTheme">
      <input id="my-drawer-4" type="checkbox" class="drawer-toggle" v-model="sidebarOpen" />

      <!-- Main content -->
      <div class="drawer-content flex flex-col min-h-screen">
        <!-- Navbar -->
        <div class="navbar w-full bg-base-100 shadow-sm border-b border-base-200">
          <!-- Toggle button - visible on mobile AND desktop -->
          <div class="flex-none">
            <label for="my-drawer-4" aria-label="toggle sidebar" class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round"
                stroke-width="2" fill="none" stroke="currentColor" class="inline-block size-5">
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>
          </div>

          <div class="flex-1 px-2">
            <NuxtLink to="/" class="flex items-center gap-2">
              <!-- <img src="https://norteengenhariabsb.com.br/wp-content/uploads/2025/04/cropped-Norte-Engenharia-Eletrica.png" 
                alt="Norte" class="h-8 w-auto" /> -->
              <!-- <span class="text-xl font-bold hidden sm:inline">Norte Engenharia</span> -->
            </NuxtLink>
          </div>

          <!-- Theme toggle in navbar -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content z-50 p-2 shadow-2xl bg-base-300 rounded-box w-52 mt-2">
              <li v-for="theme in themes" :key="theme">
                <button type="button" class="btn btn-sm btn-ghost justify-between w-full capitalize"
                  :class="currentTheme === theme ? 'btn-active' : ''" @click="setTheme(theme)">
                  <span>{{ theme }}</span>
                  <span class="inline-flex gap-1" :data-theme="theme">
                    <span class="inline-block w-3 h-3 rounded bg-primary"></span>
                    <span class="inline-block w-3 h-3 rounded bg-secondary"></span>
                    <span class="inline-block w-3 h-3 rounded bg-accent"></span>
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div class="flex-none">
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full" :class="{ 'placeholder bg-primary text-primary-content': !userAvatar }">
                  <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="w-full h-full object-cover" />
                  <span v-else class="flex items-center justify-center w-full h-full text-lg font-semibold">
                    {{ authStore.user?.username?.charAt(0)?.toUpperCase() || '?' }}
                  </span>
                </div>
              </div>
              <ul tabindex="0"
                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow-lg border border-base-200">
                <li class="menu-title px-2 py-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-base-content">{{ authStore.user?.username }}</span>
                    <span class="badge badge-xs" :class="getRoleBadgeClass(authStore.user?.role)">
                      {{ getRoleText(authStore.user?.role) }}
                    </span>
                  </div>
                </li>
                <li>
                  <NuxtLink to="/profile" class="rounded-lg">
                    Configurar Perfil
                  </NuxtLink>
                </li>
                <li>
                  <a @click="handleLogout" class="rounded-lg text-error">
                    Sair
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Page content -->
        <main class="p-3 md:p-4 flex-grow">
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

      <!-- Sidebar -->
      <div class="drawer-side is-drawer-close:overflow-visible z-40">
        <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>

        <aside
          class="flex min-h-full flex-col items-start bg-base-100 border-r border-base-200/70 is-drawer-close:w-0 is-drawer-open:w-72 lg:is-drawer-close:w-20">
          <!-- Logo - Mobile: always show | Desktop: logo only when collapsed, text when expanded -->
          <div class="p-4 w-full border-b border-base-200/70 flex is-drawer-close:justify-center lg:justify-start">
            <!-- Collapsed: show only logo h-10 (desktop only) -->
            <NuxtLink to="/" class="hidden lg:flex is-drawer-open:hidden items-center gap-2 font-bold text-lg">
              <!-- <img
                src="https://norteengenhariabsb.com.br/wp-content/uploads/2025/04/cropped-Norte-Engenharia-Eletrica.png"
                alt="Norte" class="h-10 w-auto" /> -->
              <span class="is-drawer-open:hidden">Norte</span>
            </NuxtLink>

            <!-- Expanded: show text (desktop) -->
            <NuxtLink to="/" class="hidden lg:flex is-drawer-close:hidden items-center gap-3 font-bold text-lg min-w-0">
              <span class="leading-none min-w-0 is-drawer-close:hidden">
                <img
                  src="https://norteengenhariabsb.com.br/wp-content/uploads/2025/04/cropped-Norte-Engenharia-Eletrica.png"
                  alt="Norte" class="h-10 w-15" />
                <!-- <span class="block truncate">Norte Engenharia</span>
                <span class="is-drawer-close:hidden">Norte Engenharia</span>
                <span class="block text-xs font-normal text-base-content/60 mt-1 truncate">Gestão de ativos</span> -->
              </span>
            </NuxtLink>
          </div>

          <!-- Menu items -->
          <ul class="menu w-full grow gap-1 p-2">
            <template v-for="section in navSections" :key="section.key">
              <li class="menu-title is-drawer-close:hidden">
                <span class="leading-normal">{{ section.title }}</span>
              </li>

              <li v-for="item in section.items" :key="item.to" v-show="!item.adminOnly || authStore.isAdmin">
                <NuxtLink :to="item.to" class="rounded-xl flex items-center gap-3 w-full" :class="[
                  route.path === item.to ? 'active font-semibold' : '',
                  'is-drawer-close:tooltip is-drawer-close:tooltip-right',
                ]" :data-tip="!isLgUp ? item.label : null">
                  <component :is="item.icon" class="h-5 w-5 opacity-80" aria-hidden="true" />
                  <span class="is-drawer-close:hidden">{{ item.label }}</span>
                  <span v-if="item.badge && item.badge > 0"
                    :class="isLgUp ? 'badge badge-sm badge-primary' : 'badge badge-xs badge-primary absolute -top-1 -right-1'">
                    {{ item.badge }}
                  </span>
                </NuxtLink>
              </li>
            </template>
          </ul>
        </aside>
      </div>
    </div>
  </ClientOnly>
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

const { userAvatar } = useUserAvatar()

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
  const r = role?.toLowerCase() || ''
  const texts: Record<string, string> = {
    admin: 'Admin',
    manager: 'Gerente',
    operator: 'Operador',
    viewer: 'Visualizador',
  }
  return texts[r] || r || 'Desconhecido'
}

const themes = ['light', 'dark', 'acid', 'silk', 'synthwave']
const currentTheme = ref('synthwave')
const sidebarOpen = ref(true)
const isLgUp = ref(false)

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

onMounted(() => {
  if (!process.client) return
  currentTheme.value = localStorage.getItem('theme') || 'synthwave'

  const media = window.matchMedia('(min-width: 1024px)')
  const apply = () => {
    isLgUp.value = media.matches
    sidebarOpen.value = media.matches // Open by default on desktop
  }
  apply()
  media.addEventListener?.('change', apply)
})

watch(
  () => route.fullPath,
  () => {
    // Mobile sidebar closes on navigation
  },
)
</script>
