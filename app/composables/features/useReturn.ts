import type { Event, Equipment, Bag, TransactionType } from "~/types";
import { nowISO } from "~/utils/dateUtils";

export const useReturn = () => {
  const appStore = useAppStore();
  const authStore = useAuthStore();

  // State
  const currentStep = ref(1);
  const selectedEvent = ref<Event | null>(null);
  const scannedEquipment = ref<Equipment | null>(null);
  const scannedBag = ref<Bag | null>(null);
  const bagEquipments = ref<Equipment[]>([]);
  const expandedBags = ref(new Set<string>());
  const returnError = ref("");
  const showSuccessModal = ref(false);

  const returnForm = ref({
    status: "ok",
    notes: "",
  });

  const statusOptions = [
    { value: "ok", label: "OK - Sem Problemas" },
    { value: "damaged", label: "Avariado" },
    { value: "maintenance", label: "Necessita Manutenção" },
    { value: "lost", label: "Perdido" },
  ];

  // Computed
  const activeEvents = computed(() => {
    return appStore.events.filter(
      (e) => e.status === "in_progress" || e.status === "confirmed",
    );
  });

  const recentReturns = computed(() => {
    return appStore.transactions
      .filter((t) => String(t.transaction_type).toLowerCase() === "return")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10);
  });

  // Actions
  const loadData = async () => {
    await Promise.all([
      appStore.fetchEvents(),
      appStore.fetchEquipment(),
      appStore.fetchTransactions(),
      appStore.fetchUsers(),
      appStore.fetchBags(),
    ]);
  };

  const selectEvent = (event: Event) => {
    selectedEvent.value = event;
  };

  const handleScan = async (code: string) => {
    console.log("[Return] handleScan called with raw code:", code);

    // Limpar código
    let cleanCode = code.trim();

    if (cleanCode.startsWith("{") || cleanCode.startsWith("[")) {
      try {
        const parsed = JSON.parse(cleanCode.replace(/'/g, '"'));
        cleanCode =
          typeof parsed === "string"
            ? parsed
            : parsed.code || Object.values(parsed)[0] || cleanCode;
      } catch {
        cleanCode = cleanCode.replace(/[{}'"\[\]]/g, "").trim();
      }
    }

    console.log("[Return] Clean code:", cleanCode);

    const normalizedCode = cleanCode.toUpperCase();
    returnError.value = "";
    scannedBag.value = null;
    scannedEquipment.value = null;
    bagEquipments.value = [];

    // Primeiro, verificar se é um código de bag
    const bag = appStore.bags.find(
      (b) => b.code.toUpperCase() === normalizedCode,
    );

    if (bag) {
      const equipmentsInBag = appStore.equipment.filter(
        (e) => e.bag_id === bag.id,
      );

      if (equipmentsInBag.length === 0) {
        returnError.value = "Esta bag não contém equipamentos";
        return;
      }

      const inUse = equipmentsInBag.filter((e) => e.status === "in_use");
      if (inUse.length === 0) {
        returnError.value = "Nenhum equipamento desta bag está em uso";
        return;
      }

      scannedBag.value = bag;
      bagEquipments.value = inUse;
      scannedEquipment.value = inUse[0] || null;
      returnError.value = "";
      currentStep.value = 3;
      console.log("[Return] Bag found, moving to step 3:", bag.code);
      return;
    }

    // Se não for bag, procurar equipamento
    let equipment = appStore.equipment.find(
      (e) => e.code.toUpperCase() === normalizedCode,
    );

    if (!equipment) {
      try {
        equipment = await appStore.scanEquipmentQR(cleanCode);
        const exists = appStore.getEquipmentById(equipment.id);
        if (!exists) {
          appStore.equipment.push(equipment);
        }
      } catch (error: any) {
        returnError.value =
          error?.message ||
          "Equipamento ou bag não encontrado com o código: " + cleanCode;
        return;
      }
    }

    if (!equipment) {
      returnError.value =
        "Equipamento ou bag não encontrado com o código: " + cleanCode;
      return;
    }

    // RN02.2: Equipamento que pertence a uma bag não pode ser devolvido individualmente
    if (equipment.bag_id) {
      const bagFound = appStore.bags.find((b) => b.id === equipment.bag_id);
      const bagCode = bagFound?.code || "desconhecida";
      returnError.value = `Este equipamento pertence à bag "${bagCode}". Devolva a bag completa usando o código: ${bagCode}`;
      return;
    }

    if (equipment.status !== "in_use") {
      returnError.value = `Este equipamento não está marcado como "em uso". Status atual: ${equipment.status}`;
      return;
    }

    // Equipamento individual em uso - avançar para confirmação
    scannedEquipment.value = equipment;
    scannedBag.value = null;
    bagEquipments.value = [];
    returnError.value = "";
    currentStep.value = 3;
    console.log("[Return] Equipment found, moving to step 3:", equipment.code);
  };

  const confirmReturn = async () => {
    if (!selectedEvent.value || !authStore.user) {
      return;
    }

    try {
      if (scannedBag.value && bagEquipments.value.length > 0) {
        await appStore.addTransaction({
          bag_id: scannedBag.value.id,
          event_id: selectedEvent.value.id,
          user_id: authStore.user.id,
          transaction_type: "return" as TransactionType,
          scheduled_date: nowISO(),
          return_condition: returnForm.value.status,
          notes: returnForm.value.notes
            ? `Bag: ${scannedBag.value.code} (${bagEquipments.value.length} itens). Status: ${returnForm.value.status}. ${returnForm.value.notes}`
            : `Bag: ${scannedBag.value.code} (${bagEquipments.value.length} itens). Status: ${returnForm.value.status}`,
        });
      } else if (scannedEquipment.value) {
        await appStore.addTransaction({
          equipment_id: scannedEquipment.value.id,
          event_id: selectedEvent.value.id,
          user_id: authStore.user.id,
          transaction_type: "return" as TransactionType,
          scheduled_date: nowISO(),
          return_condition: returnForm.value.status,
          notes: returnForm.value.notes
            ? `Status: ${returnForm.value.status}. ${returnForm.value.notes}`
            : `Status: ${returnForm.value.status}`,
        });
      } else {
        return;
      }

      showSuccessModal.value = true;
    } catch (error: any) {
      returnError.value = error?.message || "Erro ao confirmar devolução";
    }
  };

  const resetForm = () => {
    currentStep.value = 1;
    selectedEvent.value = null;
    scannedEquipment.value = null;
    scannedBag.value = null;
    bagEquipments.value = [];
    returnForm.value = {
      status: "ok",
      notes: "",
    };
    returnError.value = "";
    showSuccessModal.value = false;
  };

  // Helpers
  const getEquipmentStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      available: "badge-success",
      reserved: "badge-info",
      in_use: "badge-warning",
      maintenance: "badge-warning",
      excluded: "badge-neutral",
      damaged: "badge-error",
    };
    return classes[status] || "badge-ghost";
  };

  const getEquipmentStatusText = (status: string) => {
    const texts: Record<string, string> = {
      available: "Disponível",
      reserved: "Reservado",
      in_use: "Em Uso",
      maintenance: "Manutenção",
      excluded: "Excluído",
      damaged: "Danificado",
    };
    return texts[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "badge-warning",
      confirmed: "badge-info",
      completed: "badge-success",
      cancelled: "badge-error",
      ok: "badge-success",
      damaged: "badge-error",
      maintenance: "badge-warning",
      lost: "badge-error",
    };
    return classes[status] || "badge-ghost";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
      ok: "OK",
      damaged: "Avariado",
      maintenance: "Manutenção",
      lost: "Perdido",
    };
    return texts[status] || status;
  };

  const getUserName = (userId: string) => {
    return appStore.getUserById(userId)?.username || "Desconhecido";
  };

  const getEventName = (eventId: string) => {
    return appStore.getEventById(eventId)?.name || "Desconhecido";
  };

  const getEquipmentName = (equipmentId: string | undefined) => {
    if (!equipmentId) return "N/A";
    return appStore.getEquipmentById(equipmentId)?.name || "Desconhecido";
  };

  const getBagName = (bagId: string | undefined) => {
    if (!bagId) return "N/A";
    return appStore.getBagById(bagId)?.name || "Desconhecido";
  };

  const getConditionText = (condition: string) => {
    const texts: Record<string, string> = {
      excellent: "Excelente",
      good: "Bom",
      fair: "Regular",
      poor: "Ruim",
      damaged: "Danificado",
    };
    return texts[condition] || condition;
  };

  const toggleExpandBag = (transactionId: string) => {
    if (expandedBags.value.has(transactionId)) {
      expandedBags.value.delete(transactionId);
    } else {
      expandedBags.value.add(transactionId);
    }
    expandedBags.value = new Set(expandedBags.value);
  };

  const getBagEquipments = (bagId: string) => {
    return appStore.equipment.filter((e) => e.bag_id === bagId);
  };

  const getEventStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      planned: "badge-info",
      confirmed: "badge-primary",
      in_progress: "badge-warning",
      completed: "badge-success",
      cancelled: "badge-error",
    };
    return classes[status] || "badge-ghost";
  };

  const getEventStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planned: "Planejado",
      confirmed: "Confirmado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return texts[status] || status;
  };

  return {
    // State
    currentStep,
    selectedEvent,
    scannedEquipment,
    scannedBag,
    bagEquipments,
    returnError,
    showSuccessModal,
    returnForm,
    statusOptions,
    // Computed
    activeEvents,
    recentReturns,
    // Actions
    loadData,
    selectEvent,
    handleScan,
    confirmReturn,
    resetForm,
    // Helpers
    getEquipmentStatusClass,
    getEquipmentStatusText,
    getStatusClass,
    getStatusText,
    getUserName,
    getEventName,
    getEquipmentName,
    getBagName,
    getConditionText,
    getEventStatusClass,
    getEventStatusText,
    // Expansion helpers
    expandedBags,
    toggleExpandBag,
    getBagEquipments,
  };
};
