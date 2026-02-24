import { defineStore } from "pinia";
import { equipmentService } from "~/services/api/equipment";
import { eventService } from "~/services/api/events";
import { transactionService } from "~/services/api/transactions";
import { reportService } from "~/services/api/reports";
import { userService } from "~/services/api/users";
import { bagService } from "~/services/api/bags";
import { reservationService } from "~/services/api/reservations";
import type {
  Equipment,
  Event,
  Transaction,
  User,
  Bag,
  Reservation,
  EquipmentCreate,
  EquipmentUpdate,
  EventCreate,
  EventUpdate,
  TransactionCreate,
  TransactionUpdate,
  BagCreate,
  BagUpdate,
  ReservationCreate,
  ReservationUpdate,
  TransactionType,
  EquipmentStatus,
  EventStatus,
} from "~/types";

interface AppState {
  equipment: Equipment[];
  events: Event[];
  transactions: Transaction[];
  users: User[];
  bags: Bag[];
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
}

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    equipment: [],
    events: [],
    transactions: [],
    users: [],
    bags: [],
    reservations: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Equipment getters
    availableEquipment: (state) =>
      state.equipment.filter((eq) => eq.status === "available"),

    reservedEquipment: (state) =>
      state.equipment.filter((eq) => eq.status === "reserved"),

    inUseEquipment: (state) =>
      state.equipment.filter((eq) => eq.status === "in_use"),

    maintenanceEquipment: (state) =>
      state.equipment.filter((eq) => eq.status === "maintenance"),

    excludedEquipment: (state) =>
      state.equipment.filter((eq) => eq.status === "excluded"),

    activeEquipment: (state) =>
      state.equipment.filter((eq) => eq.status !== "excluded"),

    // Event getters
    plannedEvents: (state) =>
      state.events.filter(
        (ev) => ev.status === "planned" || ev.status === "confirmed",
      ),

    upcomingEvents: (state) =>
      state.events.filter(
        (ev) => ev.status === "planned" || ev.status === "confirmed",
      ),

    activeEvents: (state) =>
      state.events.filter((ev) => ev.status === "in_progress"),

    completedEvents: (state) =>
      state.events.filter((ev) => ev.status === "completed"),

    cancelledEvents: (state) =>
      state.events.filter((ev) => ev.status === "cancelled"),

    // Transaction getters
    pendingTransactions: (state) =>
      state.transactions.filter(
        (t) => t.status === "pending" || t.status === "confirmed",
      ),

    completedTransactions: (state) =>
      state.transactions.filter((t) => t.status === "completed"),

    withdrawalTransactions: (state) =>
      state.transactions.filter(
        (t) => t.transaction_type?.toUpperCase() === "WITHDRAWAL",
      ),

    returnTransactions: (state) =>
      state.transactions.filter(
        (t) => t.transaction_type?.toUpperCase() === "RETURN",
      ),

    // Bag getters
    activeBags: (state) => state.bags.filter((b) => b.status !== "excluded"),

    // Reservation getters
    activeReservations: (state) =>
      state.reservations.filter((r) => r.status === "active"),

    // Stats getters
    equipmentByCategory: (state) => {
      const categories: Record<string, Equipment[]> = {};
      state.equipment.forEach((eq) => {
        if (eq.status === "excluded") return;
        if (!categories[eq.category]) {
          categories[eq.category] = [];
        }
        categories[eq.category]!.push(eq);
      });
      return categories;
    },

    equipmentStats: (state) => ({
      available: state.equipment.filter((e) => e.status === "available").length,
      reserved: state.equipment.filter((e) => e.status === "reserved").length,
      inUse: state.equipment.filter((e) => e.status === "in_use").length,
      maintenance: state.equipment.filter((e) => e.status === "maintenance")
        .length,
      excluded: state.equipment.filter((e) => e.status === "excluded").length,
      total: state.equipment.filter((e) => e.status !== "excluded").length,
    }),

    eventStats: (state) => ({
      total: state.events.filter((e) => e.status !== "cancelled").length,
      planned: state.events.filter((e) => e.status === "planned").length,
      confirmed: state.events.filter((e) => e.status === "confirmed").length,
      inProgress: state.events.filter((e) => e.status === "in_progress").length,
      completed: state.events.filter((e) => e.status === "completed").length,
      upcoming: state.events.filter(
        (e) => e.status === "planned" || e.status === "confirmed",
      ).length,
    }),

    recentTransactions: (state) => {
      return state.transactions
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 10);
    },

    // Lookup getters (by ID - now using string UUIDs)
    getEquipmentById: (state) => (id: string) => {
      return state.equipment.find((e) => e.id === id);
    },

    getEquipmentByCode: (state) => (code: string) => {
      return state.equipment.find((e) => e.code === code);
    },

    getEventById: (state) => (id: string) => {
      return state.events.find((e) => e.id === id);
    },

    getEventByCode: (state) => (code: string) => {
      return state.events.find((e) => e.code === code);
    },

    getUserById: (state) => (id: string) => {
      return state.users.find((u) => u.id === id);
    },

    getBagById: (state) => (id: string) => {
      return state.bags.find((b) => b.id === id);
    },

    getBagByCode: (state) => (code: string) => {
      return state.bags.find((b) => b.code === code);
    },

    getReservationById: (state) => (id: string) => {
      return state.reservations.find((r) => r.id === id);
    },

    getTransactionById: (state) => (id: string) => {
      return state.transactions.find((t) => t.id === id);
    },
  },

  actions: {
    // ========================================
    // FETCH ACTIONS
    // ========================================

    async fetchEquipment(filters?: {
      category?: string;
      status?: EquipmentStatus;
    }) {
      this.loading = true;
      this.error = null;
      try {
        this.equipment = await equipmentService.getAll(filters);
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch equipment";
        console.error("Fetch equipment error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchEvents(filters?: { status?: EventStatus }) {
      this.loading = true;
      this.error = null;
      try {
        this.events = await eventService.getAll(filters);
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch events";
        console.error("Fetch events error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchTransactions() {
      this.loading = true;
      this.error = null;
      try {
        this.transactions = await transactionService.getAll();
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch transactions";
        console.error("Fetch transactions error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        this.users = await userService.getAll();
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch users";
        console.error("Fetch users error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchBags() {
      this.loading = true;
      this.error = null;
      try {
        this.bags = await bagService.getAll();
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch bags";
        console.error("Fetch bags error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchReservations() {
      this.loading = true;
      this.error = null;
      try {
        this.reservations = await reservationService.getAll();
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch reservations";
        console.error("Fetch reservations error:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDashboardStats() {
      this.loading = true;
      this.error = null;
      try {
        const stats = await reportService.getDashboardStats();
        return stats;
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch dashboard stats";
        console.error("Fetch dashboard stats error:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.fetchEquipment(),
          this.fetchEvents(),
          this.fetchTransactions(),
          this.fetchUsers(),
          this.fetchBags(),
          this.fetchReservations(),
        ]);
      } catch (error: any) {
        this.error = error?.message || "Failed to fetch data";
        console.error("Fetch all error:", error);
      } finally {
        this.loading = false;
      }
    },

    // ========================================
    // EQUIPMENT ACTIONS
    // ========================================

    async scanEquipmentQR(qrCode: string) {
      try {
        return await equipmentService.getByCode(qrCode);
      } catch (error: any) {
        console.error("QR scan error:", error);
        throw new Error(error?.data?.detail || "Equipment not found");
      }
    },

    async addEquipment(data: EquipmentCreate) {
      try {
        const equipment = await equipmentService.create(data);
        this.equipment.push(equipment);
        return equipment;
      } catch (error: any) {
        console.error("Add equipment error:", error);
        throw new Error(error?.data?.detail || "Failed to add equipment");
      }
    },

    async updateEquipment(id: string, data: EquipmentUpdate) {
      try {
        const equipment = await equipmentService.update(id, data);
        const index = this.equipment.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.equipment[index] = equipment;
        }
        return equipment;
      } catch (error: any) {
        console.error("Update equipment error:", error);
        throw new Error(error?.data?.detail || "Failed to update equipment");
      }
    },

    async deleteEquipment(id: string) {
      try {
        await equipmentService.delete(id);
        const index = this.equipment.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.equipment.splice(index, 1);
        }
      } catch (error: any) {
        console.error("Delete equipment error:", error);
        throw new Error(error?.data?.detail || "Failed to delete equipment");
      }
    },

    // ========================================
    // EVENT ACTIONS
    // ========================================

    async addEvent(data: EventCreate) {
      try {
        const event = await eventService.create(data);
        this.events.push(event);
        return event;
      } catch (error: any) {
        console.error("Add event error:", error);
        throw new Error(error?.data?.detail || "Failed to add event");
      }
    },

    async createEvent(data: EventCreate) {
      return await this.addEvent(data);
    },

    async updateEvent(id: string, data: EventUpdate) {
      try {
        const event = await eventService.update(id, data);
        const index = this.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.events[index] = event;
        }
        return event;
      } catch (error: any) {
        console.error("Update event error:", error);
        throw new Error(error?.data?.detail || "Failed to update event");
      }
    },

    async deleteEvent(id: string) {
      try {
        await eventService.delete(id);
        const index = this.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.events.splice(index, 1);
        }
      } catch (error: any) {
        console.error("Delete event error:", error);
        throw new Error(error?.data?.detail || "Failed to delete event");
      }
    },

    async cancelEvent(id: string) {
      try {
        const event = await eventService.cancel(id);
        const index = this.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.events[index] = event;
        }
        return event;
      } catch (error: any) {
        console.error("Cancel event error:", error);
        throw new Error(error?.data?.detail || "Failed to cancel event");
      }
    },

    // ========================================
    // TRANSACTION ACTIONS
    // ========================================

    async createTransaction(data: TransactionCreate) {
      try {
        const transaction = await transactionService.create(data);
        this.transactions.push(transaction);
        await Promise.all([this.fetchEquipment(), this.fetchBags(), this.fetchTransactions()]);
        return transaction;
      } catch (error: any) {
        console.error("Create transaction error:", error);
        throw new Error(error?.data?.detail || "Failed to create transaction");
      }
    },

    async addTransaction(data: {
      equipmentId?: string;
      equipment_id?: string;
      bagId?: string;
      bag_id?: string;
      eventId?: string;
      event_id?: string;
      userId?: string;
      user_id?: string;
      type?: TransactionType;
      transaction_type?: TransactionType;
      scheduled_date?: string;
      notes?: string;
      return_condition?: string;
    }) {
      const apiData: TransactionCreate = {
        equipment_id: data.equipmentId || data.equipment_id,
        bag_id: data.bagId || data.bag_id,
        event_id: (data.eventId || data.event_id)!,
        user_id: (data.userId || data.user_id)!,
        transaction_type: (data.type || data.transaction_type)!,
        scheduled_date: data.scheduled_date || new Date().toISOString(),
        notes: data.notes,
        return_condition: data.return_condition,
      };
      return await this.createTransaction(apiData);
    },

    async updateTransaction(id: string, data: TransactionUpdate) {
      try {
        const transaction = await transactionService.update(id, data);
        const index = this.transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.transactions[index] = transaction;
        }
        // Refresh equipment to get updated status
        await this.fetchEquipment();
        return transaction;
      } catch (error: any) {
        console.error("Update transaction error:", error);
        throw new Error(error?.data?.detail || "Failed to update transaction");
      }
    },

    async completeTransaction(id: string, notes?: string) {
      try {
        const transaction = await transactionService.complete(id, notes);
        const index = this.transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.transactions[index] = transaction;
        }
        // Refresh equipment to get updated status
        await this.fetchEquipment();
        return transaction;
      } catch (error: any) {
        console.error("Complete transaction error:", error);
        throw new Error(
          error?.data?.detail || "Failed to complete transaction",
        );
      }
    },

    async deleteTransaction(id: string) {
      try {
        await transactionService.delete(id);
        const index = this.transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.transactions.splice(index, 1);
        }
      } catch (error: any) {
        console.error("Delete transaction error:", error);
        throw new Error(error?.data?.detail || "Failed to delete transaction");
      }
    },

    // ========================================
    // BAG ACTIONS
    // ========================================

    async addBag(data: BagCreate) {
      try {
        const bag = await bagService.create(data);
        this.bags.push(bag);
        return bag;
      } catch (error: any) {
        console.error("Add bag error:", error);
        throw new Error(error?.data?.detail || "Failed to add bag");
      }
    },

    async updateBag(id: string, data: BagUpdate) {
      try {
        const bag = await bagService.update(id, data);
        const index = this.bags.findIndex((b) => b.id === id);
        if (index !== -1) {
          this.bags[index] = bag;
        }
        return bag;
      } catch (error: any) {
        console.error("Update bag error:", error);
        throw new Error(error?.data?.detail || "Failed to update bag");
      }
    },

    async deleteBag(id: string) {
      try {
        await bagService.delete(id);
        const index = this.bags.findIndex((b) => b.id === id);
        if (index !== -1) {
          this.bags.splice(index, 1);
        }
      } catch (error: any) {
        console.error("Delete bag error:", error);
        throw new Error(error?.data?.detail || "Failed to delete bag");
      }
    },

    // ========================================
    // RESERVATION ACTIONS
    // ========================================

    async addReservation(data: ReservationCreate) {
      try {
        const reservation = await reservationService.create(data);
        this.reservations.push(reservation);
        // Refresh equipment to get updated status
        await this.fetchEquipment();
        return reservation;
      } catch (error: any) {
        console.error("Add reservation error:", error);
        throw new Error(error?.data?.detail || "Failed to add reservation");
      }
    },

    async updateReservation(id: string, data: ReservationUpdate) {
      try {
        const reservation = await reservationService.update(id, data);
        const index = this.reservations.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.reservations[index] = reservation;
        }
        return reservation;
      } catch (error: any) {
        console.error("Update reservation error:", error);
        throw new Error(error?.data?.detail || "Failed to update reservation");
      }
    },

    async cancelReservation(id: string) {
      try {
        const reservation = await reservationService.cancel(id);
        const index = this.reservations.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.reservations[index] = reservation;
        }
        // Refresh equipment and bags to get updated status
        await Promise.all([this.fetchEquipment(), this.fetchBags()]);
        return reservation;
      } catch (error: any) {
        console.error("Cancel reservation error:", error);
        throw new Error(error?.data?.detail || "Failed to cancel reservation");
      }
    },

    async deleteReservation(id: string) {
      try {
        await reservationService.delete(id);
        const index = this.reservations.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.reservations.splice(index, 1);
        }
      } catch (error: any) {
        console.error("Delete reservation error:", error);
        throw new Error(error?.data?.detail || "Failed to delete reservation");
      }
    },
  },
});
