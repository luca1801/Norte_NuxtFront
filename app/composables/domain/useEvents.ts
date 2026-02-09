import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "~/stores/app";
import type { EventCreate, EventUpdate, EventStatus } from "~/types";

/**
 * Composable para gerenciamento de eventos
 * Encapsula toda lógica de dados relacionada a eventos
 */
export const useEvents = () => {
  const store = useAppStore();
  const { events, loading, error } = storeToRefs(store);

  // Getters computados
  const plannedEvents = computed(() =>
    events.value.filter((ev) => ev.status === "planned"),
  );

  const confirmedEvents = computed(() =>
    events.value.filter((ev) => ev.status === "confirmed"),
  );

  const inProgressEvents = computed(() =>
    events.value.filter((ev) => ev.status === "in_progress"),
  );

  const completedEvents = computed(() =>
    events.value.filter((ev) => ev.status === "completed"),
  );

  const cancelledEvents = computed(() =>
    events.value.filter((ev) => ev.status === "cancelled"),
  );

  const activeEvents = computed(() =>
    events.value.filter(
      (ev) =>
        ev.status === "planned" ||
        ev.status === "confirmed" ||
        ev.status === "in_progress",
    ),
  );

  // Próximos eventos: próximos 7 dias OU últimos 15 dias não finalizados
  const upcomingEvents = computed(() => {
    const now = new Date();

    const next7Days = new Date(now);
    next7Days.setDate(now.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    const past15Days = new Date(now);
    past15Days.setDate(now.getDate() - 15);
    past15Days.setHours(0, 0, 0, 0);

    return events.value
      .filter((event) => {
        const eventDate = new Date(event.start_date);
        const isCancelled = event.status === "cancelled";

        const isUpcoming =
          eventDate >= now &&
          eventDate <= next7Days &&
          event.status !== "completed" &&
          !isCancelled;

        const isPastNotFinished =
          eventDate >= past15Days &&
          eventDate < now &&
          event.status !== "completed" &&
          !isCancelled;

        return isUpcoming || isPastNotFinished;
      })
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );
  });

  // Eventos disponíveis para transações (confirmed ou in_progress)
  const eventsForTransactions = computed(() =>
    events.value.filter(
      (ev) => ev.status === "confirmed" || ev.status === "in_progress",
    ),
  );

  const stats = computed(() => ({
    total: events.value.filter((e) => e.status !== "cancelled").length,
    planned: plannedEvents.value.length,
    confirmed: confirmedEvents.value.length,
    inProgress: inProgressEvents.value.length,
    completed: completedEvents.value.length,
    cancelled: cancelledEvents.value.length,
    upcoming: upcomingEvents.value.length,
  }));

  // Lookup functions
  const getById = (id: string) => events.value.find((e) => e.id === id);
  const getByCode = (code: string) => events.value.find((e) => e.code === code);

  // Actions
  const fetchAll = async (filters?: { status?: EventStatus }) => {
    await store.fetchEvents(filters);
  };

  const create = async (data: EventCreate) => {
    return await store.addEvent(data);
  };

  const update = async (id: string, data: EventUpdate) => {
    return await store.updateEvent(id, data);
  };

  const remove = async (id: string) => {
    await store.deleteEvent(id);
  };

  const cancel = async (id: string) => {
    return await store.cancelEvent(id);
  };

  return {
    // State
    events,
    loading,
    error,

    // Computed
    plannedEvents,
    confirmedEvents,
    inProgressEvents,
    completedEvents,
    cancelledEvents,
    activeEvents,
    upcomingEvents,
    eventsForTransactions,
    stats,

    // Lookup
    getById,
    getByCode,

    // Actions
    fetchAll,
    create,
    update,
    remove,
    cancel,
  };
};
