import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "~/stores/app";
import type { BagCreate, BagUpdate } from "~/types";

/**
 * Composable para gerenciamento de bags
 * Encapsula toda lógica de dados relacionada a bags
 */
export const useBags = () => {
  const store = useAppStore();
  const { bags, equipment, loading, error } = storeToRefs(store);

  // Getters computados
  const activeBags = computed(() =>
    bags.value.filter((b) => b.status !== "excluded"),
  );

  const availableBags = computed(() =>
    bags.value.filter((b) => b.status === "available"),
  );

  const inUseBags = computed(() =>
    bags.value.filter((b) => b.status === "in_use"),
  );

  const reservedBags = computed(() =>
    bags.value.filter((b) => b.status === "reserved"),
  );

  const excludedBags = computed(() =>
    bags.value.filter((b) => b.status === "excluded"),
  );

  // Opções para select (bags disponíveis para associar equipamentos)
  const bagOptions = computed(() =>
    activeBags.value.map((b) => ({
      value: b.id,
      label: `${b.code} - ${b.name}`,
    })),
  );

  // Lookup functions
  const getById = (id: string) => bags.value.find((b) => b.id === id);
  const getByCode = (code: string) => bags.value.find((b) => b.code === code);

  // Equipamentos de uma bag
  const getEquipments = (bagId: string) =>
    equipment.value.filter(
      (e) => e.bag_id === bagId && e.status !== "excluded",
    );

  // Contagem de equipamentos por bag
  const getEquipmentCount = (bagId: string) => getEquipments(bagId).length;

  // Actions
  const fetchAll = async () => {
    await store.fetchBags();
  };

  const create = async (data: BagCreate) => {
    return await store.addBag(data);
  };

  const update = async (id: string, data: BagUpdate) => {
    return await store.updateBag(id, data);
  };

  const remove = async (id: string) => {
    await store.deleteBag(id);
  };

  return {
    // State
    bags,
    loading,
    error,

    // Computed
    activeBags,
    availableBags,
    inUseBags,
    reservedBags,
    excludedBags,
    bagOptions,

    // Lookup
    getById,
    getByCode,
    getEquipments,
    getEquipmentCount,

    // Actions
    fetchAll,
    create,
    update,
    remove,
  };
};
