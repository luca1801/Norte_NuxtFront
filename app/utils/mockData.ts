// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "employee";
  avatar?: string;
  phone?: string;
  department?: string;
  joinDate?: string;
}

export interface Equipment {
  id: string;
  name: string;
  code: string;
  category: string;
  brand: string;
  model: string;
  status: "available" | "in-use" | "maintenance" | "damaged" | "lost";
  condition: "good" | "fair" | "poor";
  lastMaintenance?: string;
  acquisitionDate: string;
  value: number;
  description?: string;
  qrCode?: string;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed" | "cancelled";
  assignedEmployees: string[];
  equipmentIds: string[];
  description?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  type: "withdrawal" | "return";
  equipmentId: string;
  eventId: string;
  userId: string;
  date: string;
  status: "ok" | "damaged" | "maintenance" | "lost";
  notes?: string;
  condition?: "tested" | "not-tested" | "faulty";
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin",
    password: "admin",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    phone: "+55 11 98765-4321",
    department: "Administração",
    joinDate: "2020-01-15",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@example.com",
    password: "123456",
    role: "employee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    phone: "+55 11 98765-1111",
    department: "Técnico de Áudio",
    joinDate: "2021-03-20",
  },
  {
    id: "3",
    name: "Maria Santos",
    email: "maria@example.com",
    password: "123456",
    role: "employee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    phone: "+55 11 98765-2222",
    department: "Logística",
    joinDate: "2021-06-10",
  },
  {
    id: "4",
    name: "Pedro Oliveira",
    email: "pedro@example.com",
    password: "123456",
    role: "employee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    phone: "+55 11 98765-3333",
    department: "Técnico de Palco",
    joinDate: "2022-01-15",
  },
  {
    id: "5",
    name: "Ana Costa",
    email: "ana@example.com",
    password: "123456",
    role: "employee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    phone: "+55 11 98765-4444",
    department: "Manutenção",
    joinDate: "2022-05-20",
  },
  {
    id: "6",
    name: "Carlos Ferreira",
    email: "carlos@example.com",
    password: "123456",
    role: "employee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    phone: "+55 11 98765-5555",
    department: "Técnico de Áudio",
    joinDate: "2023-02-10",
  },
];

// Mock Equipment
export const mockEquipment: Equipment[] = [
  {
    id: "eq1",
    name: "Mesa de Som Yamaha",
    code: "MIX-001",
    category: "Mixers",
    brand: "Yamaha",
    model: "MG16XU",
    status: "available",
    condition: "good",
    lastMaintenance: "2025-12-15",
    acquisitionDate: "2020-05-10",
    value: 15000,
    description: "Mesa de som 16 canais com efeitos",
    qrCode: "MIX-001",
  },
  {
    id: "eq2",
    name: "Caixa de Som JBL",
    code: "SPK-001",
    category: "Speakers",
    brand: "JBL",
    model: "PRX815W",
    status: "in-use",
    condition: "good",
    lastMaintenance: "2025-11-20",
    acquisitionDate: "2020-06-15",
    value: 8000,
    description: "Caixa ativa 15 polegadas",
    qrCode: "SPK-001",
  },
  {
    id: "eq3",
    name: "Microfone Shure",
    code: "MIC-001",
    category: "Microphones",
    brand: "Shure",
    model: "SM58",
    status: "available",
    condition: "good",
    lastMaintenance: "2025-12-01",
    acquisitionDate: "2019-03-20",
    value: 800,
    description: "Microfone dinâmico vocal",
    qrCode: "MIC-001",
  },
  {
    id: "eq4",
    name: "Amplificador Crown",
    code: "AMP-001",
    category: "Amplifiers",
    brand: "Crown",
    model: "XTi 4002",
    status: "maintenance",
    condition: "fair",
    lastMaintenance: "2025-01-20",
    acquisitionDate: "2021-01-10",
    value: 12000,
    description: "Amplificador profissional 4000W",
    qrCode: "AMP-001",
  },
  {
    id: "eq5",
    name: "Cabo XLR Profissional",
    code: "CAB-001",
    category: "Cables",
    brand: "Monster Cable",
    model: "Studio Pro 2000",
    status: "available",
    condition: "good",
    acquisitionDate: "2020-08-05",
    value: 200,
    description: "Cabo balanceado 5 metros",
    qrCode: "CAB-001",
  },
  {
    id: "eq6",
    name: "Subwoofer QSC",
    code: "SUB-001",
    category: "Subwoofers",
    brand: "QSC",
    model: "KW181",
    status: "in-use",
    condition: "good",
    lastMaintenance: "2025-11-10",
    acquisitionDate: "2021-04-20",
    value: 10000,
    description: "Subwoofer ativo 18 polegadas",
    qrCode: "SUB-001",
  },
  {
    id: "eq7",
    name: "Monitor de Palco",
    code: "MON-001",
    category: "Monitors",
    brand: "Behringer",
    model: "B212D",
    status: "available",
    condition: "good",
    acquisitionDate: "2020-09-15",
    value: 3500,
    description: "Monitor ativo bi-amplificado",
    qrCode: "MON-001",
  },
  {
    id: "eq8",
    name: "Processador de Efeitos",
    code: "EFX-001",
    category: "Effects",
    brand: "TC Electronic",
    model: "M350",
    status: "damaged",
    condition: "poor",
    lastMaintenance: "2025-01-15",
    acquisitionDate: "2019-11-20",
    value: 2500,
    description: "Processador de reverb e delay",
    qrCode: "EFX-001",
  },
  {
    id: "eq9",
    name: "DI Box Ativo",
    code: "DI-001",
    category: "DI Boxes",
    brand: "Radial",
    model: "J48",
    status: "available",
    condition: "good",
    acquisitionDate: "2021-07-10",
    value: 600,
    description: "Direct box ativo phantom powered",
    qrCode: "DI-001",
  },
  {
    id: "eq10",
    name: "Snake Multipino",
    code: "SNK-001",
    category: "Snakes",
    brand: "Whirlwind",
    model: "W3-24-100",
    status: "available",
    condition: "good",
    acquisitionDate: "2020-12-05",
    value: 4500,
    description: "Snake 24 canais 30 metros",
    qrCode: "SNK-001",
  },
  {
    id: "eq11",
    name: "Power Conditioner",
    code: "POW-001",
    category: "Power",
    brand: "Furman",
    model: "PL-8C",
    status: "in-use",
    condition: "good",
    acquisitionDate: "2021-02-20",
    value: 1500,
    description: "Condicionador de energia 8 tomadas",
    qrCode: "POW-001",
  },
  {
    id: "eq12",
    name: "Microfone Condensador",
    code: "MIC-002",
    category: "Microphones",
    brand: "Audio-Technica",
    model: "AT2020",
    status: "available",
    condition: "good",
    acquisitionDate: "2022-03-15",
    value: 1200,
    description: "Microfone condensador cardioide",
    qrCode: "MIC-002",
  },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: "evt1",
    title: "Show Rock in Rio",
    artist: "Banda XYZ",
    location: "Estádio Municipal",
    startDate: "2026-02-15T18:00:00",
    endDate: "2026-02-15T23:00:00",
    status: "planned",
    assignedEmployees: ["2", "4", "6"],
    equipmentIds: ["eq2", "eq6", "eq11"],
    description: "Grande show de rock com público estimado de 5000 pessoas",
    color: "#3b82f6",
  },
  {
    id: "evt2",
    title: "Festival de Jazz",
    artist: "Diversos Artistas",
    location: "Teatro Municipal",
    startDate: "2026-02-20T19:00:00",
    endDate: "2026-02-20T22:00:00",
    status: "planned",
    assignedEmployees: ["3", "5"],
    equipmentIds: ["eq1", "eq3", "eq7"],
    description: "Festival com múltiplos artistas de jazz",
    color: "#8b5cf6",
  },
  {
    id: "evt3",
    title: "Evento Corporativo",
    artist: "Palestrantes",
    location: "Centro de Convenções",
    startDate: "2026-02-10T09:00:00",
    endDate: "2026-02-10T18:00:00",
    status: "completed",
    assignedEmployees: ["2", "3"],
    equipmentIds: ["eq5", "eq9", "eq10"],
    description: "Evento corporativo com palestras",
    color: "#10b981",
  },
  {
    id: "evt4",
    title: "Show Sertanejo",
    artist: "Dupla Sertaneja",
    location: "Arena de Eventos",
    startDate: "2026-03-05T20:00:00",
    endDate: "2026-03-05T23:30:00",
    status: "planned",
    assignedEmployees: ["4", "6"],
    equipmentIds: [],
    description: "Show de música sertaneja",
    color: "#f59e0b",
  },
  {
    id: "evt5",
    title: "Festival Eletrônico",
    artist: "DJ Internacional",
    location: "Clube Noturno",
    startDate: "2026-02-28T22:00:00",
    endDate: "2026-03-01T04:00:00",
    status: "planned",
    assignedEmployees: ["2", "5", "6"],
    equipmentIds: [],
    description: "Festa de música eletrônica",
    color: "#ec4899",
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn1",
    type: "withdrawal",
    equipmentId: "eq2",
    eventId: "evt1",
    userId: "2",
    date: "2026-01-25T10:30:00",
    status: "ok",
    condition: "tested",
    notes: "Equipamento testado e funcionando perfeitamente",
  },
  {
    id: "txn2",
    type: "withdrawal",
    equipmentId: "eq6",
    eventId: "evt1",
    userId: "4",
    date: "2026-01-25T11:00:00",
    status: "ok",
    condition: "tested",
    notes: "Subwoofer em perfeitas condições",
  },
  {
    id: "txn3",
    type: "return",
    equipmentId: "eq5",
    eventId: "evt3",
    userId: "3",
    date: "2026-01-27T19:00:00",
    status: "ok",
    notes: "Cabo retornado em perfeito estado",
  },
  {
    id: "txn4",
    type: "return",
    equipmentId: "eq9",
    eventId: "evt3",
    userId: "2",
    date: "2026-01-27T19:15:00",
    status: "ok",
    notes: "DI Box sem problemas",
  },
  {
    id: "txn5",
    type: "withdrawal",
    equipmentId: "eq11",
    eventId: "evt1",
    userId: "6",
    date: "2026-01-26T14:00:00",
    status: "ok",
    condition: "tested",
    notes: "Power conditioner testado",
  },
];

// Helper functions
export const getUserById = (id: string) => mockUsers.find((u) => u.id === id);
export const getEquipmentById = (id: string) =>
  mockEquipment.find((e) => e.id === id);
export const getEventById = (id: string) => mockEvents.find((e) => e.id === id);
export const getEquipmentByCode = (code: string) =>
  mockEquipment.find((e) => e.code === code || e.qrCode === code);
