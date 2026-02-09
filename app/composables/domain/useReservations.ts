import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "~/stores/app";
import type { ReservationCreate, ReservationUpdate } from "~/types";

/**
 * Composable para gerenciamento de reservas
 * Encapsula toda lógica de dados relacionada a reservas
 */
export const useReservations = () => {
  const store = useAppStore();
  const { reservations, loading, error } = storeToRefs(store);

  // Getters computados
  const activeReservations = computed(() =>
    reservations.value.filter((r) => r.status === "active"),
  );

  const completedReservations = computed(() =>
    reservations.value.filter((r) => r.status === "completed"),
  );

  const cancelledReservations = computed(() =>
    reservations.value.filter((r) => r.status === "cancelled"),
  );

  // Lookup functions
  const getById = (id: string) => reservations.value.find((r) => r.id === id);

  const getByEventId = (eventId: string) =>
    reservations.value.filter((r) => r.event_id === eventId);

  const getByEquipmentId = (equipmentId: string) =>
    reservations.value.filter((r) => r.equipment_id === equipmentId);

  const getByBagId = (bagId: string) =>
    reservations.value.filter((r) => r.bag_id === bagId);

  // Verificar disponibilidade
  const isEquipmentReserved = (equipmentId: string, excludeEventId?: string) =>
    activeReservations.value.some(
      (r) => r.equipment_id === equipmentId && r.event_id !== excludeEventId,
    );

  const isBagReserved = (bagId: string, excludeEventId?: string) =>
    activeReservations.value.some(
      (r) => r.bag_id === bagId && r.event_id !== excludeEventId,
    );

  // Actions
  const fetchAll = async () => {
    await store.fetchReservations();
  };

  const create = async (data: ReservationCreate) => {
    return await store.addReservation(data);
  };

  const update = async (id: string, data: ReservationUpdate) => {
    return await store.updateReservation(id, data);
  };

  const cancel = async (id: string) => {
    return await store.cancelReservation(id);
  };

  const remove = async (id: string) => {
    await store.deleteReservation(id);
  };

  return {
    // State
    reservations,
    loading,
    error,

    // Computed
    activeReservations,
    completedReservations,
    cancelledReservations,

    // Lookup
    getById,
    getByEventId,
    getByEquipmentId,
    getByBagId,

    // Availability checks
    isEquipmentReserved,
    isBagReserved,

    // Actions
    fetchAll,
    create,
    update,
    cancel,
    remove,
  };
};
