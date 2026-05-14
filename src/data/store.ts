// Shared in-memory data store with localStorage persistence

import { useEffect, useState } from "react";

export type Project = {
  id: string;
  clientId: string;
  name: string;
  technology: string;
  assignedDeveloperId: string;
  startDate: string;
  status: "active" | "completed";
  satisfactionRating: number; // 0-5
  notes?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  address?: string;
  gstin?: string;
  pan?: string; // for TDS reconciliation
  stateCode?: string; // place of supply, e.g. "29-Karnataka"
  technologies: string[];
  progress: number;
  status: "active" | "new";
};

export type Developer = {
  id: string;
  name: string;
  initials: string;
  level: string;
  experience: string;
  status: "available" | "busy";
  email: string;
  phone: string;
  skills: string[];
  schedule: string;
  languages: string;
  activeClients: number;
  utilization: number;
  rating: number;
  monthlyEarnings: number;
  salary: number;
  hourlyRate?: number;
  onTimeRate: number;
  responseTime: string;
  knowledgeScore: number;
  communication: number;
  feedback: { client: string; comment: string; stars: number }[];
};

export type Meeting = {
  id: string;
  title: string;
  clientId: string;
  developerId: string;
  projectId?: string;
  client: string;
  developer: string;
  technology: string;
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "completed";
  priority: "high" | "medium" | "low";
  agenda: string;
  zoom: boolean;
};

export type Payment = {
  id: string;
  invoice: string;
  client: string;
  initials: string;
  company: string;
  technology: string;
  developer: string;
  sessions: number;
  base: number;
  gst: number;
  total: number;
  method: string;
  due: string;
  status: "paid" | "pending";
  overdueDays?: number;
};

export type LineItem = {
  id: string;
  description: string;
  hsn?: string; // HSN/SAC code (e.g. 998314 for IT consultancy)
  quantity: number;
  rate: number;
};

export type Receipt = {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  mode: string; // Bank Transfer, UPI, Cheque, Cash, Card
  reference?: string; // UTR / cheque no / UPI ref
  notes?: string;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number; // total GST %
  cgst: number;
  sgst: number;
  igst: number;
  gstAmount: number;
  total: number;
  roundOff?: number; // ± paise rounded to nearest rupee
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  interstate?: boolean; // IGST vs CGST+SGST
  placeOfSupply?: string; // state name + code, e.g. "Karnataka (29)"
  reverseCharge?: boolean; // RCM applicable
  tdsDeducted?: number; // ₹ TDS deducted by client (reduces net receivable)
  poNumber?: string; // client purchase order ref
};

export type ExpenseCategory = "furniture" | "equipment" | "software" | "travel" | "utilities" | "marketing" | "salary" | "other";

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  vendor: string;
  vendorGstin?: string;
  vendorPan?: string;
  description: string;
  amount: number; // taxable value
  gstAmount: number;
  total: number;
  paymentMethod: string;
  isAsset: boolean;
  assetTag?: string;
  reverseCharge?: boolean; // RCM — you pay GST on behalf of vendor
  itcEligible?: boolean; // input tax credit claimable
  tdsDeducted?: number; // TDS you deducted while paying vendor
  hsn?: string;
};

export type CompanyDetails = {
  name: string;
  gstin: string;
  pan: string;
  address: string;
  email: string;
  phone: string;
  caEmail: string;
  stateCode?: string; // e.g. "29-Karnataka"
  businessType?: "Proprietorship" | "Partnership" | "LLP" | "Private Limited" | "Public Limited";
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
};

export type TaxSettings = {
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  tdsRate: number;
  company: CompanyDetails;
};

export type Profile = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

// ---------------- Initial data ----------------

const initialClients: Client[] = [
  { id: "c1", name: "Arun Krishnan", email: "arun@techcorp.com", phone: "+91 9000000001", company: "TechCorp Solutions", address: "Bangalore, KA", gstin: "29ABCDE1234F1Z5", technologies: ["Java", "Spring Boot"], progress: 75, status: "active" },
  { id: "c2", name: "Meera Reddy", email: "meera@dataflow.com", phone: "+91 9000000002", company: "DataFlow Analytics", address: "Hyderabad, TG", gstin: "36ABCDE1234F1Z5", technologies: ["Tableau", "SQL"], progress: 60, status: "active" },
  { id: "c3", name: "Vikram Shah", email: "vikram@cloudtech.com", phone: "+91 9000000003", company: "CloudTech Systems", address: "Mumbai, MH", gstin: "27ABCDE1234F1Z5", technologies: ["Databricks", "Python"], progress: 40, status: "new" },
];

const initialDevelopers: Developer[] = [
  { id: "d1", name: "Amit Sharma", initials: "AS", level: "Senior", experience: "5 years experience", status: "busy", email: "amit.sharma@consultant.com", phone: "+91 9876543210", skills: ["Java", "Spring Boot", "Microservices", "MySQL"], schedule: "Evening (6-10 PM)", languages: "English, Hindi", activeClients: 4, utilization: 90, rating: 4.9, monthlyEarnings: 45000, salary: 90000, hourlyRate: 800, onTimeRate: 99, responseTime: "< 2 hours", knowledgeScore: 9.2, communication: 9, feedback: [{ client: "Arun Krishnan", comment: "Excellent Java concepts explanation", stars: 5 }, { client: "Rohit Patel", comment: "Very patient and detailed teaching", stars: 5 }] },
  { id: "d2", name: "Neha Gupta", initials: "NG", level: "Senior", experience: "4 years experience", status: "available", email: "neha.gupta@consultant.com", phone: "+91 9876543211", skills: ["Tableau", "Power BI", "SQL", "Python"], schedule: "Morning (8-12 PM)", languages: "English, Hindi", activeClients: 2, utilization: 75, rating: 4.7, monthlyEarnings: 38000, salary: 75000, hourlyRate: 700, onTimeRate: 96, responseTime: "< 3 hours", knowledgeScore: 8.9, communication: 9, feedback: [{ client: "Meera Reddy", comment: "Great visualization skills", stars: 5 }] },
  { id: "d3", name: "Suresh Nair", initials: "SN", level: "Lead", experience: "7 years experience", status: "busy", email: "suresh.nair@consultant.com", phone: "+91 9876543212", skills: ["Databricks", "Spark", "Python", "AWS"], schedule: "Flexible", languages: "English, Hindi, Tamil", activeClients: 3, utilization: 85, rating: 4.8, monthlyEarnings: 52000, salary: 110000, hourlyRate: 1000, onTimeRate: 98, responseTime: "< 1 hour", knowledgeScore: 9.5, communication: 9, feedback: [{ client: "Vikram Shah", comment: "Top-notch Databricks expertise", stars: 5 }] },
];

const initialProjects: Project[] = [
  { id: "p1", clientId: "c1", name: "Spring Boot Microservices Platform", technology: "Java + Spring Boot", assignedDeveloperId: "d1", startDate: "2024-08-01", status: "active", satisfactionRating: 5, notes: "JWT auth + API gateway" },
  { id: "p2", clientId: "c1", name: "Legacy Java Refactor", technology: "Java", assignedDeveloperId: "d1", startDate: "2024-06-01", status: "completed", satisfactionRating: 5 },
  { id: "p3", clientId: "c2", name: "Sales Analytics Dashboard", technology: "Tableau", assignedDeveloperId: "d2", startDate: "2024-09-01", status: "active", satisfactionRating: 4 },
  { id: "p4", clientId: "c3", name: "Databricks Data Lake Setup", technology: "Databricks + Spark", assignedDeveloperId: "d3", startDate: "2024-10-01", status: "active", satisfactionRating: 4 },
];

const initialMeetings: Meeting[] = [
  { id: "m1", title: "Java Spring Boot Advanced Concepts", clientId: "c1", developerId: "d1", projectId: "p1", client: "Arun Krishnan", developer: "Amit Sharma", technology: "TechCorp Solutions • Java Spring Boot", date: "2024-10-15", time: "10:00 AM", duration: 60, status: "scheduled", priority: "high", agenda: "Spring Security, JWT Authentication, REST API Best Practices", zoom: true },
  { id: "m2", title: "Tableau Dashboard Review", clientId: "c2", developerId: "d2", projectId: "p3", client: "Meera Reddy", developer: "Neha Gupta", technology: "DataFlow Analytics • Tableau", date: "2024-10-16", time: "2:00 PM", duration: 45, status: "scheduled", priority: "medium", agenda: "Review sales dashboard, optimize calculated fields", zoom: true },
  { id: "m3", title: "Databricks Onboarding", clientId: "c3", developerId: "d3", projectId: "p4", client: "Vikram Shah", developer: "Suresh Nair", technology: "CloudTech Systems • Databricks", date: "2024-10-18", time: "11:00 AM", duration: 90, status: "scheduled", priority: "high", agenda: "Workspace setup, cluster configuration, first notebook", zoom: true },
  { id: "m4", title: "Java Basics Walkthrough", clientId: "c1", developerId: "d1", projectId: "p2", client: "Arun Krishnan", developer: "Amit Sharma", technology: "TechCorp Solutions • Java", date: "2024-10-08", time: "10:00 AM", duration: 60, status: "completed", priority: "medium", agenda: "OOP fundamentals, collections framework", zoom: true },
];

const initialPayments: Payment[] = [
  { id: "pay1", invoice: "INV-2024-001", client: "Arun Krishnan", initials: "AK", company: "TechCorp Solutions", technology: "Java Spring Boot", developer: "Amit Sharma", sessions: 8, base: 12000, gst: 2160, total: 14160, method: "Bank Transfer", due: "2024-11-01", status: "paid" },
  { id: "pay2", invoice: "INV-2024-002", client: "Meera Reddy", initials: "MR", company: "DataFlow Analytics", technology: "Tableau", developer: "Neha Gupta", sessions: 6, base: 15000, gst: 2700, total: 17700, method: "UPI", due: "2024-10-28", status: "pending", overdueDays: 3 },
  { id: "pay3", invoice: "INV-2024-003", client: "Vikram Shah", initials: "VS", company: "CloudTech Systems", technology: "Databricks", developer: "Suresh Nair", sessions: 4, base: 18000, gst: 3240, total: 21240, method: "Credit Card", due: "2024-11-05", status: "paid" },
];

const initialInvoices: Invoice[] = [
  {
    id: "inv1", number: "INV-2024-001", clientId: "c1", projectId: "p1",
    lineItems: [{ id: "l1", description: "Spring Boot Consulting (8 sessions)", quantity: 8, rate: 1500 }],
    subtotal: 12000, taxRate: 18, cgst: 1080, sgst: 1080, igst: 0, gstAmount: 2160, total: 14160,
    status: "paid", issueDate: "2024-10-01", dueDate: "2024-11-01", paidDate: "2024-10-25", interstate: false,
  },
  {
    id: "inv2", number: "INV-2024-002", clientId: "c2", projectId: "p3",
    lineItems: [{ id: "l1", description: "Tableau Dashboard Build (6 sessions)", quantity: 6, rate: 2500 }],
    subtotal: 15000, taxRate: 18, cgst: 0, sgst: 0, igst: 2700, gstAmount: 2700, total: 17700,
    status: "sent", issueDate: "2024-10-05", dueDate: "2024-10-28", interstate: true,
  },
];

const initialExpenses: Expense[] = [
  { id: "e1", date: "2024-09-15", category: "software", vendor: "JetBrains", description: "IntelliJ Ultimate licenses", amount: 8500, gstAmount: 1530, total: 10030, paymentMethod: "Credit Card", isAsset: false },
  { id: "e2", date: "2024-08-20", category: "furniture", vendor: "Urban Ladder", vendorGstin: "29XYZAB1234C1Z5", description: "Office desks (3 units)", amount: 45000, gstAmount: 8100, total: 53100, paymentMethod: "Bank Transfer", isAsset: true, assetTag: "FURN-001" },
  { id: "e3", date: "2024-09-05", category: "equipment", vendor: "Croma", vendorGstin: "29CROMA1234C1Z5", description: "MacBook Pro M3", amount: 195000, gstAmount: 35100, total: 230100, paymentMethod: "Credit Card", isAsset: true, assetTag: "EQUIP-001" },
  { id: "e4", date: "2024-09-10", category: "marketing", vendor: "Google Ads", description: "September campaign", amount: 6500, gstAmount: 1170, total: 7670, paymentMethod: "Credit Card", isAsset: false },
  { id: "e5", date: "2024-09-12", category: "travel", vendor: "MakeMyTrip", description: "Client visit Mumbai", amount: 2000, gstAmount: 360, total: 2360, paymentMethod: "Credit Card", isAsset: false },
];

const initialTaxSettings: TaxSettings = {
  gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, tdsRate: 10,
  company: {
    name: "Lovable Consultancy Pvt Ltd",
    gstin: "29AABCL1234A1Z5",
    pan: "AABCL1234A",
    address: "Koramangala, Bangalore, KA 560034",
    email: "billing@lovable.dev",
    phone: "+91 9000000000",
    caEmail: "ca@example.com",
    stateCode: "29-Karnataka",
    businessType: "Private Limited",
    bankName: "HDFC Bank",
    accountName: "Lovable Consultancy Pvt Ltd",
    accountNumber: "50200012345678",
    ifsc: "HDFC0001234",
    branch: "Koramangala, Bangalore",
    upiId: "lovable@hdfc",
  },
};

const initialReceipts: Receipt[] = [
  { id: "r1", invoiceId: "inv1", date: "2024-10-25", amount: 14160, mode: "Bank Transfer", reference: "UTR1234567890" },
];

const initialProfile: Profile = { name: "Admin User", email: "admin@lovable.dev", role: "Owner", initials: "AU" };

// ---------------- Persistence ----------------

const KEY = "lov-biz-v3";

type DB = {
  clients: Client[]; developers: Developer[]; projects: Project[]; meetings: Meeting[];
  payments: Payment[]; invoices: Invoice[]; expenses: Expense[]; receipts: Receipt[];
  tax: TaxSettings; profile: Profile;
};

const defaultDB: DB = {
  clients: initialClients, developers: initialDevelopers, projects: initialProjects, meetings: initialMeetings,
  payments: initialPayments, invoices: initialInvoices, expenses: initialExpenses, receipts: initialReceipts,
  tax: initialTaxSettings, profile: initialProfile,
};

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB;
    const parsed = JSON.parse(raw);
    return { ...defaultDB, ...parsed };
  } catch { return defaultDB; }
}

let db: DB = typeof window !== "undefined" ? loadDB() : defaultDB;
const listeners = new Set<() => void>();

function commit() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function useSlice<K extends keyof DB>(key: K): DB[K] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return db[key];
}

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

// ---------------- Hooks ----------------

export const useClients = () => useSlice("clients");
export const useDevelopers = () => useSlice("developers");
export const useProjects = () => useSlice("projects");
export const useMeetings = () => useSlice("meetings");
export const usePayments = () => useSlice("payments");
export const useInvoices = () => useSlice("invoices");
export const useExpenses = () => useSlice("expenses");
export const useReceipts = () => useSlice("receipts");
export const useTaxSettings = () => useSlice("tax");
export const useProfile = () => useSlice("profile");

// ---------------- Mutations ----------------

export const addClient = (c: Omit<Client, "id" | "progress" | "status">) => {
  db.clients = [...db.clients, { ...c, id: uid(), progress: 0, status: "new" }]; commit();
};
export const updateClient = (id: string, patch: Partial<Client>) => {
  db.clients = db.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)); commit();
};
export const deleteClient = (id: string) => {
  db.clients = db.clients.filter((c) => c.id !== id);
  db.projects = db.projects.filter((p) => p.clientId !== id);
  commit();
};

export const addDeveloper = (d: Omit<Developer, "id" | "initials" | "activeClients" | "utilization" | "rating" | "monthlyEarnings" | "onTimeRate" | "responseTime" | "knowledgeScore" | "communication" | "feedback"> & Partial<Developer>) => {
  const initials = d.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  db.developers = [...db.developers, {
    activeClients: 0, utilization: 0, rating: 0, monthlyEarnings: 0,
    onTimeRate: 100, responseTime: "< 24 hours", knowledgeScore: 7, communication: 7, feedback: [],
    ...d, id: uid(), initials,
  } as Developer];
  commit();
};
export const updateDeveloper = (id: string, patch: Partial<Developer>) => {
  db.developers = db.developers.map((d) => (d.id === id ? { ...d, ...patch } : d)); commit();
};

export const addProject = (p: Omit<Project, "id">) => {
  db.projects = [...db.projects, { ...p, id: uid() }];
  // bump dev's active client count
  const dev = db.developers.find((d) => d.id === p.assignedDeveloperId);
  if (dev && p.status === "active") updateDeveloper(dev.id, { activeClients: dev.activeClients + 1, status: "busy" });
  else commit();
};
export const updateProject = (id: string, patch: Partial<Project>) => {
  db.projects = db.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)); commit();
};

export const addMeeting = (m: Omit<Meeting, "id" | "client" | "developer" | "technology">) => {
  const client = db.clients.find((c) => c.id === m.clientId);
  const developer = db.developers.find((d) => d.id === m.developerId);
  const project = m.projectId ? db.projects.find((p) => p.id === m.projectId) : undefined;
  db.meetings = [...db.meetings, {
    ...m, id: uid(),
    client: client?.name || "Unknown",
    developer: developer?.name || "Unknown",
    technology: `${client?.company || ""}${project ? " • " + project.technology : ""}`,
  }];
  commit();
};
export const updateMeeting = (id: string, patch: Partial<Meeting>) => {
  db.meetings = db.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)); commit();
};
export const deleteMeeting = (id: string) => {
  db.meetings = db.meetings.filter((m) => m.id !== id); commit();
};

export const markPaymentPaid = (id: string) => {
  db.payments = db.payments.map((p) => (p.id === id ? { ...p, status: "paid", overdueDays: undefined } : p));
  commit();
};

export const addInvoice = (inv: Omit<Invoice, "id" | "number">) => {
  const number = `INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(3, "0")}`;
  db.invoices = [...db.invoices, { ...inv, id: uid(), number }];
  commit();
  return number;
};
export const updateInvoice = (id: string, patch: Partial<Invoice>) => {
  db.invoices = db.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)); commit();
};
export const deleteInvoice = (id: string) => {
  db.invoices = db.invoices.filter((i) => i.id !== id); commit();
};

export const addExpense = (e: Omit<Expense, "id">) => {
  db.expenses = [...db.expenses, { ...e, id: uid() }]; commit();
};
export const updateExpense = (id: string, patch: Partial<Expense>) => {
  db.expenses = db.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)); commit();
};
export const deleteExpense = (id: string) => {
  db.expenses = db.expenses.filter((e) => e.id !== id); commit();
};

export const updateTaxSettings = (patch: Partial<TaxSettings> & { company?: Partial<CompanyDetails> }) => {
  db.tax = { ...db.tax, ...patch, company: { ...db.tax.company, ...(patch.company || {}) } };
  commit();
};
export const updateProfile = (patch: Partial<Profile>) => {
  db.profile = { ...db.profile, ...patch };
  if (patch.name) db.profile.initials = patch.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  commit();
};

// Convenience helpers
export const getClient = (id: string) => db.clients.find((c) => c.id === id);
export const getDeveloper = (id: string) => db.developers.find((d) => d.id === id);
export const getProject = (id: string) => db.projects.find((p) => p.id === id);
export const projectsForClient = (clientId: string) => db.projects.filter((p) => p.clientId === clientId);
export const projectsForDeveloper = (devId: string) => db.projects.filter((p) => p.assignedDeveloperId === devId);
export const meetingsForClient = (clientId: string) => db.meetings.filter((m) => m.clientId === clientId);
export const invoicesForClient = (clientId: string) => db.invoices.filter((i) => i.clientId === clientId);
export const resetAll = () => { db = defaultDB; commit(); };
