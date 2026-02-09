<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="text-3xl font-bold text-center mb-6">
          🎵 Asset Manager
        </h1>
        <h2 class="text-xl font-semibold text-center mb-4">Login</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email ou Usuário</span>
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="Digite seu email ou usuário"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Senha</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="Digite sua senha"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div v-if="error" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner"></span>
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="divider">OU</div>

        <NuxtLink to="/register" class="btn btn-outline w-full">
          Criar nova conta
        </NuxtLink>

        <div class="mt-4 p-4 bg-info/10 rounded-lg">
          <p class="text-sm font-semibold mb-2">Conta de teste:</p>
          <p class="text-xs">Usuário: <span class="font-mono font-bold">admin</span></p>
          <p class="text-xs">Senha: <span class="font-mono font-bold">admin</span></p>
        </div>
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
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    error.value = ''
    loading.value = true

    await authStore.login(username.value, password.value)
    
    await router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>
