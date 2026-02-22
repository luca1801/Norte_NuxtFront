import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "~/stores/app";
import type {
  TransactionCreate,
  TransactionUpdate,
  TransactionType,
} from "~/types";

/**
 * Composable para gerenciamento de transações (retiradas e devoluções)
 * Encapsula toda lógica de dados relacionada a transações
 */
export const useTransactions = () => {
  const store = useAppStore();
  const { transactions, loading, error } = storeToRefs(store);

  // Getters computados
  const pendingTransactions = computed(() =>
    transactions.value.filter(
      (t) => t.status === "pending" || t.status === "confirmed",
    ),
  );

  const completedTransactions = computed(() =>
    transactions.value.filter((t) => t.status === "completed"),
  );

  const withdrawalTransactions = computed(() =>
    transactions.value.filter((t) => t.transaction_type === "withdrawal"),
  );

  const returnTransactions = computed(() =>
    transactions.value.filter((t) => t.transaction_type === "return"),
  );

  const recentTransactions = computed(() =>
    transactions.value
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10),
  );

  // Transações recentes para dashboard (excluindo equipamentos em bags)
  const recentTransactionsForDashboard = computed(() => {
    const equipmentStore = useAppStore();

    return transactions.value
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .filter((t) => {
        if (t.equipment_id) {
          const equipment = equipmentStore.getEquipmentById(t.equipment_id);
          // Se o equipamento pertence a uma bag, não mostrar individualmente
          if (equipment?.bag_id) {
            return false;
          }
        }
        return true;
      })
      .slice(0, 10);
  });

  // Lookup functions
  const getById = (id: string) => transactions.value.find((t) => t.id === id);

  const getByEventId = (eventId: string) =>
    transactions.value.filter((t) => t.event_id === eventId);

  const getByEquipmentId = (equipmentId: string) =>
    transactions.value.filter((t) => t.equipment_id === equipmentId);

  const getByBagId = (bagId: string) =>
    transactions.value.filter((t) => t.bag_id === bagId);

  // Actions
  const fetchAll = async () => {
    await store.fetchTransactions();
  };

  const create = async (data: TransactionCreate) => {
    return await store.createTransaction(data);
  };

  const createWithdrawal = async (data: {
    equipment_id?: string;
    bag_id?: string;
    event_id: string;
    user_id: string;
    scheduled_date?: string;
    notes?: string;
  }) => {
    return await store.addTransaction({
      ...data,
      transaction_type: "withdrawal" as TransactionType,
    });
  };

  const createReturn = async (data: {
    equipment_id?: string;
    bag_id?: string;
    event_id: string;
    user_id: string;
    scheduled_date?: string;
    notes?: string;
  }) => {
    return await store.addTransaction({
      ...data,
      transaction_type: "return" as TransactionType,
    });
  };

  const update = async (id: string, data: TransactionUpdate) => {
    return await store.updateTransaction(id, data);
  };

  const complete = async (id: string, notes?: string) => {
    return await store.completeTransaction(id, notes);
  };

  const remove = async (id: string) => {
    await store.deleteTransaction(id);
  };

  return {
    // State
    transactions,
    loading,
    error,

    // Computed
    pendingTransactions,
    completedTransactions,
    withdrawalTransactions,
    returnTransactions,
    recentTransactions,
    recentTransactionsForDashboard,

    // Lookup
    getById,
    getByEventId,
    getByEquipmentId,
    getByBagId,

    // Actions
    fetchAll,
    create,
    createWithdrawal,
    createReturn,
    update,
    complete,
    remove,
  };
};
