import { useApi } from "~/composables/core/useApi";
import type { User, UserUpdate, UserRole } from "~/types";

export interface UserFilters {
  role?: UserRole;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

export const userService = {
  /**
   * Get all users - tries admin endpoint first, falls back to public endpoint
   */
  async getAll(params?: UserFilters): Promise<User[]> {
    const { fetch } = useApi();
    try {
      // Try admin endpoint first (full user data)
      return await fetch<User[]>("/users/", { params });
    } catch (error: any) {
      // If forbidden, try public endpoint (basic user data)
      if (error?.statusCode === 403 || error?.status === 403) {
        console.log("Admin endpoint forbidden, using public endpoint");
        return await fetch<User[]>("/users/public", { params });
      }
      throw error;
    }
  },

  /**
   * Get public user list (for any authenticated user)
   */
  async getPublic(params?: UserFilters): Promise<User[]> {
    const { fetch } = useApi();
    return await fetch<User[]>("/users/public", { params });
  },

  async getById(id: string): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>(`/users/${id}`);
  },

  async update(id: string, data: UserUpdate): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>(`/users/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    const { fetch } = useApi();
    await fetch(`/users/${id}`, { method: "DELETE" });
  },

  async activate(id: string): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>(`/users/${id}`, {
      method: "PUT",
      body: { is_active: true },
    });
  },

  async deactivate(id: string): Promise<User> {
    const { fetch } = useApi();
    return await fetch<User>(`/users/${id}`, {
      method: "PUT",
      body: { is_active: false },
    });
  },

  async getOperators(): Promise<User[]> {
    const { fetch } = useApi();
    return await fetch<User[]>("/users/", {
      params: { role: "operator", is_active: true },
    });
  },
};

// Re-export types for backward compatibility
export type { User };
