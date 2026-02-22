import { useApi } from "~/composables/core/useApi";
import type {
  Reservation,
  ReservationCreate,
  ReservationUpdate,
  ReservationWithDetails,
  ReservationStatus,
} from "~/types";

export interface ReservationFilters {
  event_id?: string;
  equipment_id?: string;
  bag_id?: string;
  reserved_by?: string;
  status?: ReservationStatus;
  start_date_from?: string;
  start_date_to?: string;
  skip?: number;
  limit?: number;
}

export const reservationService = {
  async getAll(params?: ReservationFilters): Promise<Reservation[]> {
    const { fetch } = useApi();
    return await fetch<Reservation[]>("/reservations/", { params });
  },

  async getById(id: string): Promise<ReservationWithDetails> {
    const { fetch } = useApi();
    return await fetch<ReservationWithDetails>(`/reservations/${id}`);
  },

  async create(data: ReservationCreate): Promise<Reservation> {
    const { fetch } = useApi();
    return await fetch<Reservation>("/reservations/", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: ReservationUpdate): Promise<Reservation> {
    const { fetch } = useApi();
    return await fetch<Reservation>(`/reservations/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    const { fetch } = useApi();
    await fetch(`/reservations/${id}`, { method: "DELETE" });
  },

  async cancel(id: string): Promise<Reservation> {
    const { fetch } = useApi();
    return await fetch<Reservation>(`/reservations/${id}`, {
      method: "PUT",
      body: { status: "cancelled" },
    });
  },

  async complete(id: string): Promise<Reservation> {
    const { fetch } = useApi();
    return await fetch<Reservation>(`/reservations/${id}`, {
      method: "PUT",
      body: { status: "completed" },
    });
  },

  async getByEvent(eventId: string): Promise<Reservation[]> {
    const { fetch } = useApi();
    return await fetch<Reservation[]>("/reservations/", {
      params: { event_id: eventId },
    });
  },

  async getActive(): Promise<Reservation[]> {
    const { fetch } = useApi();
    return await fetch<Reservation[]>("/reservations/", {
      params: { status: "active" },
    });
  },

  async checkConflict(
    equipmentId?: string,
    bagId?: string,
    startDate?: string,
    endDate?: string,
    excludeEventId?: string,
  ): Promise<Reservation[]> {
    const { fetch } = useApi();
    const params: Record<string, string> = {};
    if (equipmentId) params.equipment_id = equipmentId;
    if (bagId) params.bag_id = bagId;
    if (startDate) params.start_date_from = startDate;
    if (endDate) params.start_date_to = endDate;
    params.status = "active";

    const reservations = await fetch<Reservation[]>("/reservations/", {
      params,
    });

    // Filter out the current event if updating
    if (excludeEventId) {
      return reservations.filter((r) => r.event_id !== excludeEventId);
    }
    return reservations;
  },
};

// Re-export types for backward compatibility
export type {
  Reservation,
  ReservationCreate,
  ReservationUpdate,
  ReservationWithDetails,
};
