import { useApi } from "~/composables/core/useApi";
import type {
  DashboardStats,
  EquipmentUsageReport,
  AuditLog,
  AuditLogSummary,
  AuditAction,
} from "~/types";

export const reportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { fetch } = useApi();
    return await fetch<DashboardStats>("/reports/dashboard");
  },

  async getEquipmentUsage(): Promise<EquipmentUsageReport> {
    const { fetch } = useApi();
    return await fetch<EquipmentUsageReport>("/reports/equipment-usage");
  },

  async getEquipmentByCategory(): Promise<
    Array<{ category: string; count: number }>
  > {
    const { fetch } = useApi();
    return await fetch<Array<{ category: string; count: number }>>(
      "/reports/equipment-by-category",
    );
  },

  async getEquipmentByStatus(): Promise<
    Array<{ status: string; count: number }>
  > {
    const { fetch } = useApi();
    return await fetch<Array<{ status: string; count: number }>>(
      "/reports/equipment-by-status",
    );
  },

  async getTransactionsByPeriod(
    startDate: string,
    endDate: string,
  ): Promise<Array<{ date: string; withdrawals: number; returns: number }>> {
    const { fetch } = useApi();
    return await fetch<
      Array<{ date: string; withdrawals: number; returns: number }>
    >("/reports/transactions-by-period", {
      params: { start_date: startDate, end_date: endDate },
    });
  },

  async getEventsSummary(): Promise<{
    total: number;
    by_status: Array<{ status: string; count: number }>;
    upcoming: number;
  }> {
    const { fetch } = useApi();
    return await fetch<{
      total: number;
      by_status: Array<{ status: string; count: number }>;
      upcoming: number;
    }>("/reports/events-summary");
  },

  // Audit Log endpoints (admin only)
  async getAuditLog(options?: {
    skip?: number;
    limit?: number;
    table_name?: string;
    action?: AuditAction;
    user_id?: string;
  }): Promise<AuditLog[]> {
    const { fetch } = useApi();
    return await fetch<AuditLog[]>("/reports/audit-log", {
      params: options,
    });
  },

  async getAuditLogSummary(): Promise<AuditLogSummary> {
    const { fetch } = useApi();
    return await fetch<AuditLogSummary>("/reports/audit-log/summary");
  },
};

// Re-export types for backward compatibility
export type { DashboardStats, EquipmentUsageReport, AuditLog, AuditLogSummary };
