import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "~/stores/app";
import type {
  EquipmentCreate,
  EquipmentUpdate,
  EquipmentStatus,
} from "~/types";

/**
 * Composable para gerenciamento de equipamentos
 * Encapsula toda lógica de dados relacionada a equipamentos
 */
export const useEquipment = () => {
  const store = useAppStore();
  const { equipment, loading, error } = storeToRefs(store);

  // Getters computados
  const availableEquipment = computed(() =>
    equipment.value.filter((eq) => eq.status === "available"),
  );

  const reservedEquipment = computed(() =>
    equipment.value.filter((eq) => eq.status === "reserved"),
  );

  const inUseEquipment = computed(() =>
    equipment.value.filter((eq) => eq.status === "in_use"),
  );

  const maintenanceEquipment = computed(() =>
    equipment.value.filter((eq) => eq.status === "maintenance"),
  );

  const excludedEquipment = computed(() =>
    equipment.value.filter((eq) => eq.status === "excluded"),
  );

  const activeEquipment = computed(() =>
    equipment.value.filter((eq) => eq.status !== "excluded"),
  );

  const equipmentByCategory = computed(() => {
    const categories: Record<string, typeof equipment.value> = {};
    equipment.value.forEach((eq) => {
      if (eq.status === "excluded") return;
      if (!categories[eq.category]) {
        categories[eq.category] = [];
      }
      categories[eq.category]!.push(eq);
    });
    return categories;
  });

  const stats = computed(() => ({
    available: availableEquipment.value.length,
    reserved: reservedEquipment.value.length,
    inUse: inUseEquipment.value.length,
    maintenance: maintenanceEquipment.value.length,
    excluded: excludedEquipment.value.length,
    total: activeEquipment.value.length,
  }));

  const categories = computed(() =>
    [...new Set(equipment.value.map((eq) => eq.category))].sort(),
  );

  // Lookup functions
  const getById = (id: string) => equipment.value.find((e) => e.id === id);
  const getByCode = (code: string) =>
    equipment.value.find((e) => e.code === code);
  const getByBagId = (bagId: string) =>
    equipment.value.filter((e) => e.bag_id === bagId);

  // Actions
  const fetchAll = async (filters?: {
    category?: string;
    status?: EquipmentStatus;
  }) => {
    await store.fetchEquipment(filters);
  };

  const create = async (data: EquipmentCreate) => {
    return await store.addEquipment(data);
  };

  const update = async (id: string, data: EquipmentUpdate) => {
    return await store.updateEquipment(id, data);
  };

  const remove = async (id: string) => {
    await store.deleteEquipment(id);
  };

  const scanQR = async (qrCode: string) => {
    return await store.scanEquipmentQR(qrCode);
  };

  return {
    // State
    equipment,
    loading,
    error,

    // Computed
    availableEquipment,
    reservedEquipment,
    inUseEquipment,
    maintenanceEquipment,
    excludedEquipment,
    activeEquipment,
    equipmentByCategory,
    stats,
    categories,

    // Lookup
    getById,
    getByCode,
    getByBagId,

    // Actions
    fetchAll,
    create,
    update,
    remove,
    scanQR,
  };
};
