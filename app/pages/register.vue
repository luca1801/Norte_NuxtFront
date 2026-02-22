<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 flex">
    
    <!-- Lado Esquerdo - Info da Empresa -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20">
        <div class="flex items-center gap-4 mb-12">
          <div class="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            N
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-2xl tracking-tighter text-white leading-none">Norte<span class="text-indigo-200">.co</span></span>
            <span class="text-xs uppercase tracking-[0.2em] text-indigo-200 font-bold">Asset Manager</span>
          </div>
        </div>

        <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
          Junte-se a nós<br/>
          <span class="text-indigo-200">e gerencie melhor</span>
        </h1>

        <p class="text-lg text-indigo-100/80 mb-12 max-w-md">
          Crie sua conta e tenha acesso ao sistema mais completo de gestão de equipamentos de áudio para eventos.
        </p>

        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-indigo-100">Cadastro rápido e gratuito</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-indigo-100">Acesso imediato ao sistema</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-indigo-100">Suporte dedicado</span>
          </div>
        </div>

        <div class="mt-16 pt-8 border-t border-white/10">
          <div class="flex items-center gap-6 text-indigo-200 text-sm">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              (61) 98594-7635
            </span>
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Sobradinho-DF
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lado Direito - Formulario de Registro -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
      <div class="w-full max-w-md">
        
        <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/25">
            N
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-xl tracking-tighter text-slate-50 leading-none">Norte<span class="text-indigo-500">.co</span></span>
            <span class="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Asset Manager</span>
          </div>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-slate-50 mb-2">Criar Conta</h1>
          <p class="text-slate-400 text-sm">Preencha os dados para se registrar</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome de Usuario</label>
            <input
              v-model="username"
              type="text"
              placeholder="Digite seu nome de usuario"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              required
              minlength="3"
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="Digite seu email"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
            <input
              v-model="password"
              type="password"
              placeholder="Digite sua senha (min. 8 caracteres)"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              required
              minlength="8"
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmar Senha</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              required
              minlength="8"
            />
          </div>

          <div v-if="error" class="alert alert-error bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-rose-300 text-sm">{{ error }}</span>
          </div>

          <button
            type="submit"
            class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Criando conta...
            </span>
            <span v-else>Criar Conta</span>
          </button>
        </form>

        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-slate-700/50"></div>
          <span class="text-slate-500 text-xs font-medium">OU</span>
          <div class="flex-1 h-px bg-slate-700/50"></div>
        </div>

        <NuxtLink 
          to="/login" 
          class="block w-full py-3.5 border border-slate-700 text-slate-300 font-bold rounded-xl text-center hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300"
        >
          Ja tenho uma conta
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  try {
    error.value = ''

    if (password.value !== confirmPassword.value) {
      error.value = 'As senhas nao coincidem'
      return
    }

    if (password.value.length < 8) {
      error.value = 'A senha deve ter no minimo 8 caracteres'
      return
    }

    if (username.value.length < 3) {
      error.value = 'O nome de usuario deve ter no minimo 3 caracteres'
      return
    }

    loading.value = true

    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      role: 'operator'
    })
    
    await router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>
