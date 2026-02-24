export const useApi = () => {
  const apiFetch = $fetch.create({
    baseURL: "/api",
    onResponseError({ response }) {
      if (response.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        navigateTo("/login")
      }
    },
  })

  return {
    fetch: apiFetch,
    baseURL: "/api",
  }
}
