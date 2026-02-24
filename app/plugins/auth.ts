export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  if (import.meta.client) {
    const isLoggedIn = useCookie('auth_check')
    
    if (isLoggedIn.value && !authStore.isAuthenticated) {
      authStore.isLoading = true
      try {
        await authStore.checkAuth()
      } catch {
        authStore.logout()
      } finally {
        authStore.isLoading = false
      }
    }
  }
})
