import { ref } from "vue";

/**
 * Composable para gerenciamento de estado de carregamento
 * Útil para operações assíncronas
 */
export const useLoading = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    isLoading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (e: any) {
      error.value = e?.message || e?.data?.detail || "Erro desconhecido";
      console.error("Operation error:", e);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    isLoading,
    error,
    withLoading,
    clearError,
  };
};
