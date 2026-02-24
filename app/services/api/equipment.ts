import { useApi } from "~/composables/core/useApi"
import type { Equipment, EquipmentCreate, EquipmentUpdate, EquipmentWithBag, EquipmentStatus } from "~/types"

export interface EquipmentFilters {
  category?: string
  status?: EquipmentStatus
  bag_id?: string
  is_active?: boolean
  skip?: number
  limit?: number
}

export const equipmentService = {
  async getAll(params?: EquipmentFilters): Promise<Equipment[]> {
    const { fetch } = useApi()
    return await fetch<Equipment[]>("/equipment", { params })
  },

  async getById(id: string): Promise<EquipmentWithBag> {
    const { fetch } = useApi()
    return await fetch<EquipmentWithBag>(`/equipment/${id}`)
  },

  async getByCode(code: string): Promise<Equipment> {
    const { fetch } = useApi()
    return await fetch<Equipment>(`/equipment/code/${code}`)
  },

  async getByQRCode(qrCode: string): Promise<Equipment> {
    const { fetch } = useApi()
    return await fetch<Equipment>(`/equipment/code/${qrCode}`)
  },

  async create(data: EquipmentCreate): Promise<Equipment> {
    const { fetch } = useApi()
    return await fetch<Equipment>("/equipment", {
      method: "POST",
      body: data
    })
  },

  async update(id: string, data: EquipmentUpdate): Promise<Equipment> {
    const { fetch } = useApi()
    return await fetch<Equipment>(`/equipment/${id}`, {
      method: "PUT",
      body: data
    })
  },

  async delete(id: string): Promise<void> {
    const { fetch } = useApi()
    await fetch(`/equipment/${id}`, { method: "DELETE" })
  },

  async getAvailable(): Promise<Equipment[]> {
    const { fetch } = useApi()
    return await fetch<Equipment[]>("/equipment", {
      params: { status: "available" }
    })
  },

  async getByBag(bagId: string): Promise<Equipment[]> {
    const { fetch } = useApi()
    return await fetch<Equipment[]>("/equipment", {
      params: { bag_id: bagId }
    })
  }
}

export type { Equipment, EquipmentCreate, EquipmentUpdate }

// OLD: Direto para o backend FastAPI (manter para rollback se necessario)
// import { useApi } from "~/composables/core/useApi";
// import type {
//   Equipment,
//   EquipmentCreate,
//   EquipmentUpdate,
//   EquipmentWithBag,
//   EquipmentStatus,
// } from "~/types";
// 
// export interface EquipmentFilters {
//   category?: string;
//   status?: EquipmentStatus;
//   bag_id?: string;
//   is_active?: boolean;
//   skip?: number;
//   limit?: number;
// }
// 
// export const equipmentService = {
//   async getAll(params?: EquipmentFilters): Promise<Equipment[]> {
//     const { fetch } = useApi();
//     return await fetch<Equipment[]>("/equipment/", { params });
//   },
// 
//   async getById(id: string): Promise<EquipmentWithBag> {
//     const { fetch } = useApi();
//     return await fetch<EquipmentWithBag>(`/equipment/${id}`);
//   },
// 
//   async getByCode(code: string): Promise<Equipment> {
//     const { fetch } = useApi();
//     return await fetch<Equipment>(`/equipment/code/${code}`);
//   },
// 
//   async getByQRCode(qrCode: string): Promise<Equipment> {
//     const { fetch } = useApi();
//     return await fetch<Equipment>(`/equipment/code/${qrCode}`);
//   },
// 
//   async create(data: EquipmentCreate): Promise<Equipment> {
//     const { fetch } = useApi();
//     return await fetch<Equipment>("/equipment/", {
//       method: "POST",
//       body: data,
//     });
//   },
// 
//   async update(id: string, data: EquipmentUpdate): Promise<Equipment> {
//     const { fetch } = useApi();
//     return await fetch<Equipment>(`/equipment/${id}`, {
//       method: "PUT",
//       body: data,
//     });
//   },
// 
//   async delete(id: string): Promise<void> {
//     const { fetch } = useApi();
//     await fetch(`/equipment/${id}`, { method: "DELETE" });
//   },
// 
//   async getAvailable(): Promise<Equipment[]> {
//     const { fetch } = useApi();
//     return await fetch<Equipment[]>("/equipment/", {
//       params: { status: "available", is_active: true },
//     });
//   },
// 
//   async getByBag(bagId: string): Promise<Equipment[]> {
//     const { fetch } = useApi();
//     return await fetch<Equipment[]>("/equipment/", {
//       params: { bag_id: bagId },
//     });
//   },
// };
// 
// export type { Equipment, EquipmentCreate, EquipmentUpdate };
