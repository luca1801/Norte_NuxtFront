/**
 * Utilitários de data com fuso horário de Brasília (BRT - UTC-3)
 */

const TIMEZONE = "America/Sao_Paulo";

/**
 * Retorna a data/hora atual no fuso horário de Brasília
 */
export const nowBrasilia = (): Date => {
  return new Date();
};

/**
 * Retorna a data/hora atual como string ISO para envio ao backend
 * O backend receberá em UTC, mas a hora local será correta
 */
export const nowISO = (): string => {
  return new Date().toISOString();
};

/**
 * Formata uma data para exibição no formato brasileiro
 * @param date - String de data ISO ou Date
 * @param options - Opções de formatação
 */
export const formatDateBR = (
  date: string | Date | undefined,
  options?: {
    showTime?: boolean;
    showSeconds?: boolean;
    showYear?: boolean;
  },
): string => {
  if (!date) return "-";

  const {
    showTime = false,
    showSeconds = false,
    showYear = true,
  } = options || {};

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    timeZone: TIMEZONE,
  };

  if (showYear) {
    formatOptions.year = "numeric";
  }

  if (showTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    if (showSeconds) {
      formatOptions.second = "2-digit";
    }
  }

  return d.toLocaleDateString("pt-BR", formatOptions);
};

/**
 * Formata data completa: DD/MM/YYYY HH:mm
 */
export const formatDateTimeBR = (date: string | Date | undefined): string => {
  return formatDateBR(date, { showTime: true });
};

/**
 * Formata apenas a data: DD/MM/YYYY
 */
export const formatDateOnlyBR = (date: string | Date | undefined): string => {
  return formatDateBR(date, { showTime: false });
};

/**
 * Formata data curta: DD/MM HH:mm
 */
export const formatDateShortBR = (date: string | Date | undefined): string => {
  return formatDateBR(date, { showTime: true, showYear: false });
};

/**
 * Formata hora apenas: HH:mm
 */
export const formatTimeBR = (date: string | Date | undefined): string => {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
};

/**
 * Retorna data relativa (hoje, ontem, etc.)
 */
export const formatRelativeDateBR = (
  date: string | Date | undefined,
): string => {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoje às ${formatTimeBR(d)}`;
  } else if (diffDays === 1) {
    return `Ontem às ${formatTimeBR(d)}`;
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else {
    return formatDateTimeBR(d);
  }
};

/**
 * Compara duas datas (para ordenação)
 */
export const compareDates = (a: string | Date, b: string | Date): number => {
  const dateA = typeof a === "string" ? new Date(a) : a;
  const dateB = typeof b === "string" ? new Date(b) : b;
  return dateB.getTime() - dateA.getTime();
};
