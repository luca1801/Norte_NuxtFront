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

// OLD: Direto para o backend FastAPI (manter para rollback se necessario)
// export const useApi = () => {
//   const config = useRuntimeConfig();
//   const authStore = useAuthStore();
// 
//   const baseURL = config.public.apiUrl;
// 
//   const apiFetch = $fetch.create({
//     baseURL,
//     onRequest({ options }) {
//       const token = authStore.token;
//       if (token) {
//         options.headers = {
//           ...options.headers,
//           Authorization: `Bearer ${token}`,
//         };
//       }
//     },
//     onResponseError({ response }) {
//       if (response.status === 401) {
//         authStore.logout();
//         navigateTo("/login");
//       }
//     },
//   });
// 
//   return {
//     fetch: apiFetch,
//     baseURL,
//   };
// };
