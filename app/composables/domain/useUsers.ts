import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "~/stores/app";
import type { UserUpdate, UserRole } from "~/types";

/**
 * Composable para gerenciamento de usuários
 * Encapsula toda lógica de dados relacionada a usuários
 */
export const useUsers = () => {
  const store = useAppStore();
  const { users, loading, error } = storeToRefs(store);

  // Getters computados
  const activeUsers = computed(() =>
    users.value.filter((u) => u.is_active !== false),
  );

  const inactiveUsers = computed(() =>
    users.value.filter((u) => u.is_active === false),
  );

  const adminUsers = computed(() =>
    users.value.filter((u) => u.role === "admin" && u.is_active),
  );

  const managerUsers = computed(() =>
    users.value.filter((u) => u.role === "manager" && u.is_active),
  );

  const operatorUsers = computed(() =>
    users.value.filter((u) => u.role === "operator" && u.is_active),
  );

  const viewerUsers = computed(() =>
    users.value.filter((u) => u.role === "viewer" && u.is_active),
  );

  // Opções para select
  const userOptions = computed(() =>
    activeUsers.value.map((u) => ({
      value: u.id,
      label: u.username,
    })),
  );

  // Lookup functions
  const getById = (id: string) => users.value.find((u) => u.id === id);
  const getByUsername = (username: string) =>
    users.value.find((u) => u.username === username);

  // Actions
  const fetchAll = async () => {
    await store.fetchUsers();
  };

  return {
    // State
    users,
    loading,
    error,

    // Computed
    activeUsers,
    inactiveUsers,
    adminUsers,
    managerUsers,
    operatorUsers,
    viewerUsers,
    userOptions,

    // Lookup
    getById,
    getByUsername,

    // Actions
    fetchAll,
  };
};
