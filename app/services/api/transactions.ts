import { useApi } from "~/composables/core/useApi";
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionWithDetails,
  TransactionType,
  TransactionStatus,
} from "~/types";

export interface TransactionFilters {
  event_id?: string;
  equipment_id?: string;
  bag_id?: string;
  user_id?: string;
  transaction_type?: TransactionType;
  status?: TransactionStatus;
  skip?: number;
  limit?: number;
}

export const transactionService = {
  async getAll(params?: TransactionFilters): Promise<Transaction[]> {
    const { fetch } = useApi();
    return await fetch<Transaction[]>("/transactions/", { params });
  },

  async getById(id: string): Promise<TransactionWithDetails> {
    const { fetch } = useApi();
    return await fetch<TransactionWithDetails>(`/transactions/${id}`);
  },

  async create(data: TransactionCreate): Promise<Transaction> {
    const { fetch } = useApi();
    return await fetch<Transaction>("/transactions/", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: TransactionUpdate): Promise<Transaction> {
    const { fetch } = useApi();
    return await fetch<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    const { fetch } = useApi();
    await fetch(`/transactions/${id}`, { method: "DELETE" });
  },

  async complete(id: string, notes?: string): Promise<Transaction> {
    const { fetch } = useApi();
    return await fetch<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      body: {
        status: "completed",
        actual_date: new Date().toISOString(),
        notes,
      },
    });
  },

  async getByEvent(eventId: string): Promise<Transaction[]> {
    const { fetch } = useApi();
    return await fetch<Transaction[]>("/transactions/", {
      params: { event_id: eventId },
    });
  },

  async getWithdrawals(): Promise<Transaction[]> {
    const { fetch } = useApi();
    return await fetch<Transaction[]>("/transactions/", {
      params: { transaction_type: "withdrawal" },
    });
  },

  async getReturns(): Promise<Transaction[]> {
    const { fetch } = useApi();
    return await fetch<Transaction[]>("/transactions/", {
      params: { transaction_type: "return" },
    });
  },

  async getPending(): Promise<Transaction[]> {
    const { fetch } = useApi();
    return await fetch<Transaction[]>("/transactions/", {
      params: { status: "pending" },
    });
  },
};

// Re-export types for backward compatibility
export type { Transaction, TransactionCreate, TransactionUpdate };
