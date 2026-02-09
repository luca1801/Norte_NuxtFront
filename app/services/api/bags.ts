import { useApi } from "~/composables/core/useApi";
import type {
  Bag,
  BagCreate,
  BagUpdate,
  BagWithEquipment,
  BagStatus,
} from "~/types";

export interface BagFilters {
  status?: BagStatus;
  skip?: number;
  limit?: number;
}

export const bagService = {
  async getAll(params?: BagFilters): Promise<Bag[]> {
    const { fetch } = useApi();
    return await fetch<Bag[]>("/bags/", { params });
  },

  async getById(id: string): Promise<BagWithEquipment> {
    const { fetch } = useApi();
    return await fetch<BagWithEquipment>(`/bags/${id}`);
  },

  async getByCode(code: string): Promise<Bag> {
    const { fetch } = useApi();
    return await fetch<Bag>(`/bags/code/${code}`);
  },

  async create(data: BagCreate): Promise<Bag> {
    const { fetch } = useApi();
    return await fetch<Bag>("/bags/", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: BagUpdate): Promise<Bag> {
    const { fetch } = useApi();
    return await fetch<Bag>(`/bags/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    const { fetch } = useApi();
    await fetch(`/bags/${id}`, { method: "DELETE" });
  },

  async getAvailable(): Promise<Bag[]> {
    const { fetch } = useApi();
    return await fetch<Bag[]>("/bags/", {
      params: { status: "available" },
    });
  },

  async addEquipment(bagId: string, equipmentCode: string): Promise<Bag> {
    const { fetch } = useApi();
    return await fetch<Bag>(`/bags/${bagId}/equipment/${equipmentCode}`, {
      method: "POST",
    });
  },

  async removeEquipment(bagId: string, equipmentId: string): Promise<void> {
    const { fetch } = useApi();
    await fetch(`/bags/${bagId}/equipment/${equipmentId}`, {
      method: "DELETE",
    });
  },
};

// Re-export types for backward compatibility
export type { Bag, BagCreate, BagUpdate, BagWithEquipment };
