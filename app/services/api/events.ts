import { useApi } from "~/composables/core/useApi";
import type {
  Event,
  EventCreate,
  EventUpdate,
  EventWithOwner,
  EventStatus,
} from "~/types";

export interface EventFilters {
  status?: EventStatus;
  owner_id?: string;
  is_active?: boolean;
  start_date_from?: string;
  start_date_to?: string;
  skip?: number;
  limit?: number;
}

export const eventService = {
  async getAll(params?: EventFilters): Promise<Event[]> {
    const { fetch } = useApi();
    return await fetch<Event[]>("/events/", { params });
  },

  async getById(id: string): Promise<EventWithOwner> {
    const { fetch } = useApi();
    return await fetch<EventWithOwner>(`/events/${id}`);
  },

  async getByCode(code: string): Promise<Event> {
    const { fetch } = useApi();
    return await fetch<Event>(`/events/code/${code}`);
  },

  async create(data: EventCreate): Promise<Event> {
    const { fetch } = useApi();
    return await fetch<Event>("/events/", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: EventUpdate): Promise<Event> {
    const { fetch } = useApi();
    return await fetch<Event>(`/events/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    const { fetch } = useApi();
    await fetch(`/events/${id}`, { method: "DELETE" });
  },

  async cancel(id: string): Promise<Event> {
    const { fetch } = useApi();
    return await fetch<Event>(`/events/${id}/cancel`, {
      method: "POST",
    });
  },

  async getUpcoming(): Promise<Event[]> {
    const { fetch } = useApi();
    return await fetch<Event[]>("/events/", {
      params: { status: "planned", is_active: true },
    });
  },

  async getActive(): Promise<Event[]> {
    const { fetch } = useApi();
    return await fetch<Event[]>("/events/", {
      params: { status: "in_progress", is_active: true },
    });
  },
};

// Re-export types for backward compatibility
export type { Event, EventCreate, EventUpdate };
