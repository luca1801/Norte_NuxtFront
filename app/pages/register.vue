<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="text-3xl font-bold text-center mb-6">
          🎵 Asset Manager
        </h1>
        <h2 class="text-xl font-semibold text-center mb-4">Criar Conta</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Nome de Usuário</span>
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="Digite seu nome de usuário"
              class="input input-bordered w-full"
              required
              minlength="3"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="Digite seu email"
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
              placeholder="Digite sua senha (mín. 8 caracteres)"
              class="input input-bordered w-full"
              required
              minlength="8"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Confirmar Senha</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              class="input input-bordered w-full"
              required
              minlength="8"
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
            {{ loading ? 'Criando conta...' : 'Criar Conta' }}
          </button>
        </form>

        <div class="divider">OU</div>

        <NuxtLink to="/login" class="btn btn-outline w-full">
          Já tenho uma conta
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
      error.value = 'As senhas não coincidem'
      return
    }

    if (password.value.length < 8) {
      error.value = 'A senha deve ter no mínimo 8 caracteres'
      return
    }

    if (username.value.length < 3) {
      error.value = 'O nome de usuário deve ter no mínimo 3 caracteres'
      return
    }

    loading.value = true

    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      role: 'operator' // Por padrão, novos usuários são operadores
    })
    
    await router.push('/')
  } catch (e: any) {
    error.value = e.message || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>
