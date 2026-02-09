export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Evitar redirecionamento no SSR (localStorage só existe no client)
  if (import.meta.server) {
    return;
  }

  // Marcar como verificando auth para evitar flash de conteúdo
  authStore.isLoading = true;

  try {
    // Verificar autenticação
    await authStore.checkAuth();

    // Páginas públicas
    const publicPages = ["/login", "/register"];
    const isPublicPage = publicPages.includes(to.path);

    // Se não está autenticado e tenta acessar página protegida
    if (!authStore.isAuthenticated && !isPublicPage) {
      return navigateTo("/login");
    }

    // Se está autenticado e tenta acessar login/register
    if (authStore.isAuthenticated && isPublicPage) {
      return navigateTo("/");
    }
  } finally {
    authStore.isLoading = false;
  }
});
