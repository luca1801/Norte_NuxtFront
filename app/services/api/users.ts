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
      return await fetch<User[]>("/users/", { params });
    } catch (error: any) {
      console.log("Admin endpoint error, trying public endpoint:", error?.statusCode);
      return await fetch<User[]>("/users/public", { params });
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
