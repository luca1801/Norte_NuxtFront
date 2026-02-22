import { ref, computed } from "vue";
import { useEquipment } from "~/composables/domain/useEquipment";
import { useEvents } from "~/composables/domain/useEvents";
import { useTransactions } from "~/composables/domain/useTransactions";
import { useBags } from "~/composables/domain/useBags";
import { useUsers } from "~/composables/domain/useUsers";
import { useReservations } from "~/composables/domain/useReservations";
import type { Transaction, Equipment, Reservation } from "~/types";

// Type for combined movements (transactions + reservations)
export interface Movement {
  id: string;
  type: "withdrawal" | "return" | "reservation";
  equipment_id?: string;
  bag_id?: string;
  event_id?: string;
  user_id?: string;
  created_at: string;
  status?: string;
  original?: Transaction | Reservation;
}

/**
 * Composable para lógica do Dashboard
 * Combina dados de múltiplos domínios para exibição no dashboard
 */
export const useDashboard = () => {
  const equipmentComposable = useEquipment();
  const eventsComposable = useEvents();
  const transactionsComposable = useTransactions();
  const bagsComposable = useBags();
  const usersComposable = useUsers();
  const reservationsComposable = useReservations();

  // Estado local
  const searchQuery = ref("");
  const expandedBags = ref(new Set<string>());

  // Carregar todos os dados
  const loadData = async () => {
    await Promise.all([
      equipmentComposable.fetchAll(),
      eventsComposable.fetchAll(),
      transactionsComposable.fetchAll(),
      usersComposable.fetchAll(),
      bagsComposable.fetchAll(),
      reservationsComposable.fetchAll(),
    ]);
  };

  // Stats do dashboard
  const equipmentStats = equipmentComposable.stats;
  const eventStats = eventsComposable.stats;

  // Próximos eventos (usando o composable de eventos)
  const upcomingEvents = eventsComposable.upcomingEvents;

  // Combine transactions and reservations into movements
  const allMovements = computed<Movement[]>(() => {
    const movements: Movement[] = [];

    // Add transactions
    transactionsComposable.transactions.value.forEach((t) => {
      movements.push({
        id: t.id,
        type: t.transaction_type === "withdrawal" ? "withdrawal" : "return",
        equipment_id: t.equipment_id,
        bag_id: t.bag_id,
        event_id: t.event_id,
        user_id: t.user_id,
        created_at: t.created_at,
        status: t.status,
        original: t,
      });
    });

    // Add reservations as type 'reservation'
    reservationsComposable.reservations.value.forEach((r) => {
      movements.push({
        id: `res-${r.id}`,
        type: "reservation",
        equipment_id: r.equipment_id,
        bag_id: r.bag_id,
        event_id: r.event_id,
        user_id: r.reserved_by,
        created_at: r.created_at,
        status: r.status,
        original: r,
      });
    });

    return movements;
  });

  // Transações e reservas filtradas para o dashboard
  const filteredTransactions = computed<Movement[]>(() => {
    let movements = allMovements.value
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    // Filtrar equipamentos que estão dentro de bags (só mostrar a bag)
    movements = movements.filter((m) => {
      if (m.equipment_id) {
        const equipment = equipmentComposable.getById(m.equipment_id);
        if (equipment?.bag_id) {
          return false;
        }
      }
      return true;
    });

    // Aplicar filtro de busca
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      movements = movements.filter((m) => {
        const itemName = getMovementItemName(m).toLowerCase();
        const itemCode = getMovementItemCode(m).toLowerCase();
        const eventName = getEventName(m.event_id).toLowerCase();
        return (
          itemName.includes(query) ||
          itemCode.includes(query) ||
          eventName.includes(query)
        );
      });
    }

    return movements.slice(0, 12);
  });

  // Toggle para expandir bag
  const toggleExpandBag = (transactionId: string) => {
    if (expandedBags.value.has(transactionId)) {
      expandedBags.value.delete(transactionId);
    } else {
      expandedBags.value.add(transactionId);
    }
    expandedBags.value = new Set(expandedBags.value);
  };

  // Helpers para Movement (combined transactions + reservations)
  const getMovementItemName = (movement: Movement) => {
    if (movement.bag_id) {
      return (
        bagsComposable.getById(movement.bag_id)?.name || "Bag não encontrada"
      );
    }
    if (movement.equipment_id) {
      return (
        equipmentComposable.getById(movement.equipment_id)?.name ||
        "Equipamento não encontrado"
      );
    }
    return "N/A";
  };

  const getMovementItemCode = (movement: Movement) => {
    if (movement.bag_id) {
      return bagsComposable.getById(movement.bag_id)?.code || "";
    }
    if (movement.equipment_id) {
      return equipmentComposable.getById(movement.equipment_id)?.code || "";
    }
    return "";
  };

  // Legacy helpers for Transaction (keep for compatibility)
  const getItemName = (transaction: Transaction) => {
    if (transaction.bag_id) {
      return (
        bagsComposable.getById(transaction.bag_id)?.name || "Bag não encontrada"
      );
    }
    if (transaction.equipment_id) {
      return (
        equipmentComposable.getById(transaction.equipment_id)?.name ||
        "Equipamento não encontrado"
      );
    }
    return "N/A";
  };

  const getItemCode = (transaction: Transaction) => {
    if (transaction.bag_id) {
      return bagsComposable.getById(transaction.bag_id)?.code || "";
    }
    if (transaction.equipment_id) {
      return equipmentComposable.getById(transaction.equipment_id)?.code || "";
    }
    return "";
  };

  const getBagEquipments = (bagId: string): Equipment[] => {
    return bagsComposable.getEquipments(bagId);
  };

  const getUserName = (userId: string | undefined) => {
    if (!userId) return "N/A";
    return usersComposable.getById(userId)?.username || "Desconhecido";
  };

  const getEventName = (eventId: string | undefined) => {
    if (!eventId) return "N/A";
    return eventsComposable.getById(eventId)?.name || "Desconhecido";
  };

  // Status helpers
  const getTransactionStatusClass = (transaction: Transaction) => {
    if (transaction.transaction_type === "return") {
      return "badge-success";
    }
    if (transaction.transaction_type === "withdrawal") {
      const hasReturn = transactionsComposable.transactions.value.some(
        (t) =>
          t.transaction_type === "return" &&
          ((t.equipment_id && t.equipment_id === transaction.equipment_id) ||
            (t.bag_id && t.bag_id === transaction.bag_id)) &&
          new Date(t.created_at) > new Date(transaction.created_at),
      );
      if (hasReturn) {
        return "badge-success";
      }
      return "badge-warning";
    }
    const classes: Record<string, string> = {
      pending: "badge-warning",
      confirmed: "badge-info",
      completed: "badge-success",
      cancelled: "badge-error",
    };
    return classes[transaction.status] || "badge-ghost";
  };

  const getTransactionStatusText = (transaction: Transaction) => {
    if (transaction.transaction_type === "return") {
      return "Devolvido";
    }
    if (transaction.transaction_type === "withdrawal") {
      const hasReturn = transactionsComposable.transactions.value.some(
        (t) =>
          t.transaction_type === "return" &&
          ((t.equipment_id && t.equipment_id === transaction.equipment_id) ||
            (t.bag_id && t.bag_id === transaction.bag_id)) &&
          new Date(t.created_at) > new Date(transaction.created_at),
      );
      if (hasReturn) {
        return "Devolvido";
      }
      return "Em uso";
    }
    const texts: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return texts[transaction.status] || transaction.status;
  };

  // Movement status helpers (for combined transactions + reservations)
  const getMovementStatusClass = (movement: Movement) => {
    if (movement.type === "reservation") {
      return "badge-info";
    }
    if (movement.type === "return") {
      return "badge-success";
    }
    if (movement.type === "withdrawal") {
      const hasReturn = transactionsComposable.transactions.value.some(
        (t) =>
          t.transaction_type === "return" &&
          ((t.equipment_id && t.equipment_id === movement.equipment_id) ||
            (t.bag_id && t.bag_id === movement.bag_id)) &&
          new Date(t.created_at) > new Date(movement.created_at),
      );
      if (hasReturn) {
        return "badge-success";
      }
      return "badge-warning";
    }
    const classes: Record<string, string> = {
      pending: "badge-warning",
      confirmed: "badge-info",
      completed: "badge-success",
      cancelled: "badge-error",
      active: "badge-info",
    };
    return classes[movement.status || ""] || "badge-ghost";
  };

  const getMovementStatusText = (movement: Movement) => {
    if (movement.type === "reservation") {
      const statusTexts: Record<string, string> = {
        active: "Reservado",
        completed: "Concluído",
        cancelled: "Cancelado",
      };
      return statusTexts[movement.status || ""] || "Reservado";
    }
    if (movement.type === "return") {
      return "Devolvido";
    }
    if (movement.type === "withdrawal") {
      const hasReturn = transactionsComposable.transactions.value.some(
        (t) =>
          t.transaction_type === "return" &&
          ((t.equipment_id && t.equipment_id === movement.equipment_id) ||
            (t.bag_id && t.bag_id === movement.bag_id)) &&
          new Date(t.created_at) > new Date(movement.created_at),
      );
      if (hasReturn) {
        return "Devolvido";
      }
      return "Em uso";
    }
    const texts: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return texts[movement.status || ""] || movement.status;
  };

  const getMovementTypeClass = (movement: Movement) => {
    const classes: Record<string, string> = {
      withdrawal: "badge-warning",
      return: "badge-success",
      reservation: "badge-info",
    };
    return classes[movement.type] || "badge-ghost";
  };

  const getMovementTypeText = (movement: Movement) => {
    const texts: Record<string, string> = {
      withdrawal: "⬆️ Retirada",
      return: "⬇️ Devolução",
      reservation: "📋 Reserva",
    };
    return texts[movement.type] || movement.type;
  };

  const getEquipmentStatusText = (status: string) => {
    const texts: Record<string, string> = {
      available: "Disponível",
      reserved: "Reservado",
      in_use: "Em uso",
      maintenance: "Manutenção",
      excluded: "Excluído",
    };
    return texts[status] || status;
  };

  const getEventStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      planned: "badge-info",
      confirmed: "badge-primary",
      in_progress: "badge-warning",
      completed: "badge-success",
      cancelled: "badge-error",
    };
    return classes[status] || "badge-ghost";
  };

  const getEventStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planned: "Planejado",
      confirmed: "Confirmado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return texts[status] || status;
  };

  // Data atual formatada
  const currentDate = computed(() => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  });

  return {
    // Estado
    searchQuery,
    expandedBags,

    // Stats
    equipmentStats,
    eventStats,

    // Dados
    filteredTransactions,
    upcomingEvents,

    // Actions
    loadData,
    toggleExpandBag,

    // Legacy helpers (for Transaction)
    getItemName,
    getItemCode,
    getBagEquipments,
    getUserName,
    getEventName,
    getTransactionStatusClass,
    getTransactionStatusText,
    getEquipmentStatusText,
    getEventStatusClass,
    getEventStatusText,

    // Movement helpers (for combined transactions + reservations)
    getMovementItemName,
    getMovementItemCode,
    getMovementStatusClass,
    getMovementStatusText,
    getMovementTypeClass,
    getMovementTypeText,

    currentDate,
  };
};
