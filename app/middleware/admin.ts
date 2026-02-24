export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const isLoggedIn = useCookie('auth_check')
  
  if (!isLoggedIn.value && !authStore.isAuthenticated) {
    return navigateTo("/login")
  }
  
  if (isLoggedIn.value && !authStore.user) {
    return
  }
  
  if (authStore.user && !authStore.isAdmin) {
    return navigateTo("/");
  }
});
