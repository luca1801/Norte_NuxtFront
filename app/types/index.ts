// ============================================
// ENUMS - Alinhados com o backend FastAPI
// ============================================

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  OPERATOR = "operator",
  VIEWER = "viewer",
}

export enum EquipmentStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  IN_USE = "in_use",
  MAINTENANCE = "maintenance",
  EXCLUDED = "excluded",
}

export enum EquipmentCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  DAMAGED = "damaged",
}

export enum EventStatus {
  PLANNED = "planned",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TransactionType {
  WITHDRAWAL = "withdrawal",
  RETURN = "return",
}

export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ReservationStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum BagStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  IN_USE = "in_use",
  EXCLUDED = "excluded",
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
  password?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// ============================================
// BAG TYPES
// ============================================

export interface Bag {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: BagStatus;
  created_at: string;
  updated_at: string;
}

export interface BagCreate {
  code: string;
  name: string;
  description?: string;
  status?: BagStatus;
}

export interface BagUpdate {
  code?: string;
  name?: string;
  description?: string;
  status?: BagStatus;
}

export interface BagWithEquipment extends Bag {
  equipment_items: Equipment[];
  equipment_count?: number;
}

// ============================================
// EQUIPMENT TYPES
// ============================================

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  bag_id?: string;
  location?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCreate {
  code: string;
  name: string;
  category: string;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
  bag_id?: string;
  location?: string;
  description?: string;
}

export interface EquipmentUpdate {
  code?: string;
  name?: string;
  category?: string;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
  bag_id?: string | null;
  location?: string;
  description?: string;
  is_active?: boolean;
}

export interface EquipmentWithBag extends Equipment {
  bag?: Bag;
}

// ============================================
// EVENT TYPES
// ============================================

export interface Event {
  id: string;
  code: string;
  name: string;
  type: string;
  category?: string;
  status: EventStatus;
  start_date: string;
  end_date: string;
  owner_id?: string;
  location?: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  code: string;
  name: string;
  type: string;
  category?: string;
  status?: EventStatus;
  start_date: string;
  end_date: string;
  owner_id?: string;
  location?: string;
  description?: string;
}

export interface EventUpdate {
  code?: string;
  name?: string;
  type?: string;
  category?: string;
  status?: EventStatus;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  location?: string;
  description?: string;
}

export interface EventWithOwner extends Event {
  owner?: User;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: string;
  equipment_id?: string;
  bag_id?: string;
  event_id: string;
  user_id: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  scheduled_date: string;
  actual_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  equipment_id?: string;
  bag_id?: string;
  event_id: string;
  user_id: string;
  transaction_type: TransactionType;
  scheduled_date: string;
  notes?: string;
}

export interface TransactionUpdate {
  status?: TransactionStatus;
  scheduled_date?: string;
  actual_date?: string;
  notes?: string;
}

export interface TransactionWithDetails extends Transaction {
  equipment?: Equipment;
  bag?: Bag;
  event: Event;
  user: User;
}

// ============================================
// RESERVATION TYPES
// ============================================

export interface Reservation {
  id: string;
  equipment_id?: string;
  bag_id?: string;
  event_id: string;
  reserved_by: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationCreate {
  equipment_id?: string;
  bag_id?: string;
  event_id: string;
  reserved_by: string;
  start_date: string;
  end_date: string;
}

export interface ReservationUpdate {
  start_date?: string;
  end_date?: string;
  status?: ReservationStatus;
}

export interface ReservationWithDetails extends Reservation {
  equipment?: Equipment;
  bag?: Bag;
  event: Event;
  reserved_by_user: User;
}

// ============================================
// DASHBOARD & REPORTS TYPES
// ============================================

export interface DashboardStats {
  equipment: {
    total: number;
    available: number;
    reserved: number;
    in_use: number;
    maintenance: number;
    excluded: number;
  };
  bags: {
    total: number;
    active: number;
  };
  events: {
    total: number;
    planned: number;
    confirmed: number;
    in_progress: number;
    completed: number;
  };
  transactions: {
    pending: number;
    completed: number;
  };
  reservations: {
    active: number;
    completed: number;
  };
  users: {
    total: number;
    active: number;
  };
}

export interface EquipmentUsageReport {
  by_category: Array<{ category: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  by_condition: Array<{ condition: string; count: number }>;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export enum AuditAction {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogSummary {
  total: number;
  by_action: Array<{ action: string; count: number }>;
  by_table: Array<{ table: string; count: number }>;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
