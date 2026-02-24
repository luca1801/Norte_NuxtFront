export default defineNuxtRouteMiddleware((to) => {
  const publicPages = ["/login", "/register"]
  const isPublicPage = publicPages.includes(to.path)
  
  if (isPublicPage) {
    return
  }
  
  const authStore = useAuthStore()
  const isLoggedIn = useCookie('auth_check')
  
  if (!authStore.isAuthenticated && !authStore.user && !isLoggedIn.value) {
    return navigateTo("/login")
  }
})
