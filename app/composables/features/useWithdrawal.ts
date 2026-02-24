import type { Event, Equipment, Bag, TransactionType } from "~/types";
import { nowISO } from "~/utils/dateUtils";

export const useWithdrawal = () => {
  const appStore = useAppStore();
  const authStore = useAuthStore();

  // State
  const currentStep = ref(1);
  const selectedEvent = ref<Event | null>(null);
  const scannedEquipment = ref<Equipment | null>(null);
  const scannedBag = ref<Bag | null>(null);
  const bagEquipments = ref<Equipment[]>([]);
  const expandedBags = ref(new Set<string>());
  const withdrawalError = ref("");
  const withdrawalWarning = ref("");
  const showSuccessModal = ref(false);

  const withdrawalForm = ref({
    condition: "tested",
    notes: "",
  });

  const conditionOptions = [
    { value: "tested", label: "Testado - Funcionando" },
    { value: "not-tested", label: "Não Testado" },
    { value: "faulty", label: "Defeituoso" },
  ];

  // Computed
  const upcomingEvents = computed(() => {
    return appStore.events.filter(
      (e) =>
        e.status === "planned" ||
        e.status === "confirmed" ||
        e.status === "in_progress",
    );
  });

  const recentWithdrawals = computed(() => {
    return appStore.transactions
      .filter((t) => String(t.transaction_type).toLowerCase() === "withdrawal")
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
    console.log("[Withdrawal] handleScan called with raw code:", code);

    // Limpar código - remover chaves, aspas e espaços extras
    let cleanCode = code.trim();

    // Se o código vier como objeto JSON ou com chaves, extrair o valor
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

    console.log("[Withdrawal] Clean code:", cleanCode);
    const normalizedCode = cleanCode.toUpperCase();

    withdrawalError.value = "";
    withdrawalWarning.value = "";
    scannedBag.value = null;
    scannedEquipment.value = null;
    bagEquipments.value = [];

    // Primeiro, verificar se é um código de bag (case-insensitive)
    const bag = appStore.bags.find(
      (b) => b.code.toUpperCase() === normalizedCode,
    );

    if (bag) {
      // Verificar se a bag já está em uso em outro evento
      if (bag.status === "in_use") {
        // Encontrar em qual evento a bag está sendo usada
        const inUseTransaction = appStore.transactions.find(
          (t) =>
            t.bag_id === bag.id &&
            t.transaction_type.toUpperCase() === "WITHDRAWAL",
        );
        let eventName = "outro evento";
        if (inUseTransaction?.event_id) {
          const usingEvent = appStore.events.find(
            (e) => e.id === inUseTransaction.event_id,
          );
          if (usingEvent) {
            eventName = `evento "${usingEvent.name}"`;
          }
        }
        withdrawalError.value = `❌ Esta bag já está em uso no ${eventName}. Não é possível retirá-la para outro evento.`;
        return;
      }

      // É uma bag - buscar equipamentos da bag
      const equipmentsInBag = appStore.equipment.filter(
        (e) => e.bag_id === bag.id,
      );

      if (equipmentsInBag.length === 0) {
        withdrawalError.value = "Esta bag não contém equipamentos";
        return;
      }

      // Separar equipamentos disponíveis e indisponíveis
      const availableEquipments = equipmentsInBag.filter(
        (e) => e.status === "available",
      );
      const unavailableEquipments = equipmentsInBag.filter(
        (e) => e.status !== "available",
      );

      // Se TODOS os equipamentos estiverem indisponíveis, não permite
      if (availableEquipments.length === 0) {
        const codes = unavailableEquipments
          .map((e) => `${e.code} (${e.status})`)
          .join(", ");
        withdrawalError.value = `Nenhum equipamento disponível na bag. Itens: ${codes}`;
        return;
      }

      // Se alguns equipamentos estiverem indisponíveis, alertar mas permitir continuar
      if (unavailableEquipments.length > 0) {
        const codes = unavailableEquipments
          .map((e) => `${e.code} (${e.status})`)
          .join(", ");
        withdrawalWarning.value = `⚠️ Os seguintes itens NÃO serão incluídos na retirada: ${codes}`;
      } else {
        withdrawalWarning.value = "";
      }

      scannedBag.value = bag;
      bagEquipments.value = availableEquipments;
      scannedEquipment.value = availableEquipments[0] || null;
      withdrawalError.value = "";
      currentStep.value = 3;
      return;
    }

    // Se não for bag, procurar equipamento (case-insensitive)
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
        withdrawalError.value =
          error?.message ||
          "Equipamento ou bag não encontrado com o código: " + cleanCode;
        return;
      }
    }

    if (!equipment) {
      withdrawalError.value =
        "Equipamento ou bag não encontrado com o código: " + cleanCode;
      return;
    }

    // RN02.2: Equipamento que pertence a uma bag - verificar se a bag está em uso
    if (equipment.bag_id) {
      const foundBag = appStore.bags.find((b) => b.id === equipment.bag_id);
      // Verificar se a bag está em uso em algum evento
      if (foundBag && foundBag.status === "in_use") {
        const inUseTransaction = appStore.transactions.find(
          (t) =>
            t.bag_id === foundBag.id &&
            t.transaction_type.toUpperCase() === "WITHDRAWAL",
        );
        let eventName = "outro evento";
        if (inUseTransaction?.event_id) {
          const usingEvent = appStore.events.find(
            (e) => e.id === inUseTransaction.event_id,
          );
          if (usingEvent) {
            eventName = usingEvent.name;
          }
        }
        withdrawalError.value = `Este equipamento já foi retirado para outro evento: "${eventName}"`;
        return;
      }
      // Bag não está em uso - informar que precisa retirar a bag completa
      const bagCode = foundBag?.code || "desconhecida";
      withdrawalError.value = `Este equipamento pertence à bag "${bagCode}". Retire a bag completa.`;
      return;
    }

    // Verificar se o equipamento já está em uso em outro evento
    if (equipment.status === "in_use") {
      // Encontrar em qual evento o equipamento está sendo usado
      const inUseTransaction = appStore.transactions.find(
        (t) =>
          t.equipment_id === equipment.id &&
          t.transaction_type.toUpperCase() === "WITHDRAWAL",
      );
      let eventName = "outro evento";
      if (inUseTransaction?.event_id) {
        const usingEvent = appStore.events.find(
          (e) => e.id === inUseTransaction.event_id,
        );
        if (usingEvent) {
          eventName = `evento "${usingEvent.name}"`;
        }
      }
      withdrawalError.value = `❌ Este equipamento já está em uso no ${eventName}. Não é possível retirá-lo para outro evento.`;
      return;
    }

    if (equipment.status !== "available") {
      withdrawalError.value = `Este equipamento não está disponível para retirada. Status atual: ${equipment.status}`;
      return;
    }

    // Equipamento individual disponível - avançar para confirmação
    scannedEquipment.value = equipment;
    scannedBag.value = null;
    bagEquipments.value = [];
    withdrawalError.value = "";
    withdrawalWarning.value = "";
    currentStep.value = 3;
    console.log(
      "[Withdrawal] Equipment found, moving to step 3:",
      equipment.code,
    );
  };

  const confirmWithdrawal = async () => {
    if (!selectedEvent.value || !authStore.user) {
      return;
    }

    try {
      // Se for uma bag, criar UMA transação com bag_id
      if (scannedBag.value && bagEquipments.value.length > 0) {
        await appStore.addTransaction({
          bag_id: scannedBag.value.id,
          event_id: selectedEvent.value.id,
          user_id: authStore.user.id,
          transaction_type: "withdrawal" as TransactionType,
          scheduled_date: nowISO(),
          notes: withdrawalForm.value.notes
            ? `Bag: ${scannedBag.value.code} (${bagEquipments.value.length} itens). Condição: ${withdrawalForm.value.condition}. ${withdrawalForm.value.notes}`
            : `Bag: ${scannedBag.value.code} (${bagEquipments.value.length} itens). Condição: ${withdrawalForm.value.condition}`,
        });
      } else if (scannedEquipment.value) {
        // Equipamento individual
        await appStore.addTransaction({
          equipment_id: scannedEquipment.value.id,
          event_id: selectedEvent.value.id,
          user_id: authStore.user.id,
          transaction_type: "withdrawal" as TransactionType,
          scheduled_date: nowISO(),
          notes: withdrawalForm.value.notes
            ? `Condição: ${withdrawalForm.value.condition}. ${withdrawalForm.value.notes}`
            : `Condição: ${withdrawalForm.value.condition}`,
        });
      } else {
        return;
      }

      showSuccessModal.value = true;
    } catch (error: any) {
      withdrawalError.value = error?.message || "Erro ao confirmar retirada";
    }
  };

  const resetForm = () => {
    currentStep.value = 1;
    selectedEvent.value = null;
    scannedEquipment.value = null;
    scannedBag.value = null;
    bagEquipments.value = [];
    withdrawalForm.value = {
      condition: "tested",
      notes: "",
    };
    withdrawalError.value = "";
    withdrawalWarning.value = "";
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
    withdrawalError,
    withdrawalWarning,
    showSuccessModal,
    withdrawalForm,
    conditionOptions,
    // Computed
    upcomingEvents,
    recentWithdrawals,
    // Actions
    loadData,
    selectEvent,
    handleScan,
    confirmWithdrawal,
    resetForm,
    // Helpers
    getEquipmentStatusClass,
    getEquipmentStatusText,
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
