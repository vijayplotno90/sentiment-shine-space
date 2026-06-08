// Database-backed shared store (Lovable Cloud / Supabase).
// Keeps a synchronous in-memory cache so existing hooks/mutations work unchanged,
// while persisting everything to per-user tables with optimistic updates.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ---------------- Types ----------------

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
  pan?: string;
  stateCode?: string;
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
  hsn?: string;
  quantity: number;
  rate: number;
};

export type Receipt = {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  mode: string;
  reference?: string;
  notes?: string;
};

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstAmount: number;
  total: number;
  roundOff?: number;
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  interstate?: boolean;
  placeOfSupply?: string;
  reverseCharge?: boolean;
  tdsDeducted?: number;
  poNumber?: string;
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
  amount: number;
  gstAmount: number;
  total: number;
  paymentMethod: string;
  isAsset: boolean;
  assetTag?: string;
  reverseCharge?: boolean;
  itcEligible?: boolean;
  tdsDeducted?: number;
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
  stateCode?: string;
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

// ---------------- Seed data ----------------

const seedClients: Omit<Client, "id">[] = [
  { name: "Arun Krishnan", email: "arun@techcorp.com", phone: "+91 9000000001", company: "TechCorp Solutions", address: "Bangalore, KA", gstin: "29ABCDE1234F1Z5", technologies: ["Java", "Spring Boot"], progress: 75, status: "active" },
  { name: "Meera Reddy", email: "meera@dataflow.com", phone: "+91 9000000002", company: "DataFlow Analytics", address: "Hyderabad, TG", gstin: "36ABCDE1234F1Z5", technologies: ["Tableau", "SQL"], progress: 60, status: "active" },
  { name: "Vikram Shah", email: "vikram@cloudtech.com", phone: "+91 9000000003", company: "CloudTech Systems", address: "Mumbai, MH", gstin: "27ABCDE1234F1Z5", technologies: ["Databricks", "Python"], progress: 40, status: "new" },
];

const seedDevelopers: Omit<Developer, "id">[] = [
  { name: "Amit Sharma", initials: "AS", level: "Senior", experience: "5 years experience", status: "busy", email: "amit.sharma@consultant.com", phone: "+91 9876543210", skills: ["Java", "Spring Boot", "Microservices", "MySQL"], schedule: "Evening (6-10 PM)", languages: "English, Hindi", activeClients: 4, utilization: 90, rating: 4.9, monthlyEarnings: 45000, salary: 90000, hourlyRate: 800, onTimeRate: 99, responseTime: "< 2 hours", knowledgeScore: 9.2, communication: 9, feedback: [{ client: "Arun Krishnan", comment: "Excellent Java concepts explanation", stars: 5 }, { client: "Rohit Patel", comment: "Very patient and detailed teaching", stars: 5 }] },
  { name: "Neha Gupta", initials: "NG", level: "Senior", experience: "4 years experience", status: "available", email: "neha.gupta@consultant.com", phone: "+91 9876543211", skills: ["Tableau", "Power BI", "SQL", "Python"], schedule: "Morning (8-12 PM)", languages: "English, Hindi", activeClients: 2, utilization: 75, rating: 4.7, monthlyEarnings: 38000, salary: 75000, hourlyRate: 700, onTimeRate: 96, responseTime: "< 3 hours", knowledgeScore: 8.9, communication: 9, feedback: [{ client: "Meera Reddy", comment: "Great visualization skills", stars: 5 }] },
  { name: "Suresh Nair", initials: "SN", level: "Lead", experience: "7 years experience", status: "busy", email: "suresh.nair@consultant.com", phone: "+91 9876543212", skills: ["Databricks", "Spark", "Python", "AWS"], schedule: "Flexible", languages: "English, Hindi, Tamil", activeClients: 3, utilization: 85, rating: 4.8, monthlyEarnings: 52000, salary: 110000, hourlyRate: 1000, onTimeRate: 98, responseTime: "< 1 hour", knowledgeScore: 9.5, communication: 9, feedback: [{ client: "Vikram Shah", comment: "Top-notch Databricks expertise", stars: 5 }] },
];

// seed relationships use array indexes into the inserted clients/developers
const seedProjects = [
  { ci: 0, name: "Spring Boot Microservices Platform", technology: "Java + Spring Boot", di: 0, startDate: "2024-08-01", status: "active" as const, satisfactionRating: 5, notes: "JWT auth + API gateway" },
  { ci: 0, name: "Legacy Java Refactor", technology: "Java", di: 0, startDate: "2024-06-01", status: "completed" as const, satisfactionRating: 5 },
  { ci: 1, name: "Sales Analytics Dashboard", technology: "Tableau", di: 1, startDate: "2024-09-01", status: "active" as const, satisfactionRating: 4 },
  { ci: 2, name: "Databricks Data Lake Setup", technology: "Databricks + Spark", di: 2, startDate: "2024-10-01", status: "active" as const, satisfactionRating: 4 },
];

const seedMeetings = [
  { title: "Java Spring Boot Advanced Concepts", ci: 0, di: 0, pi: 0, technology: "TechCorp Solutions • Java Spring Boot", date: "2024-10-15", time: "10:00 AM", duration: 60, status: "scheduled" as const, priority: "high" as const, agenda: "Spring Security, JWT Authentication, REST API Best Practices", zoom: true },
  { title: "Tableau Dashboard Review", ci: 1, di: 1, pi: 2, technology: "DataFlow Analytics • Tableau", date: "2024-10-16", time: "2:00 PM", duration: 45, status: "scheduled" as const, priority: "medium" as const, agenda: "Review sales dashboard, optimize calculated fields", zoom: true },
  { title: "Databricks Onboarding", ci: 2, di: 2, pi: 3, technology: "CloudTech Systems • Databricks", date: "2024-10-18", time: "11:00 AM", duration: 90, status: "scheduled" as const, priority: "high" as const, agenda: "Workspace setup, cluster configuration, first notebook", zoom: true },
  { title: "Java Basics Walkthrough", ci: 0, di: 0, pi: 1, technology: "TechCorp Solutions • Java", date: "2024-10-08", time: "10:00 AM", duration: 60, status: "completed" as const, priority: "medium" as const, agenda: "OOP fundamentals, collections framework", zoom: true },
];

const seedInvoices = [
  { number: "INV-2024-001", ci: 0, pi: 0, items: [{ description: "Spring Boot Consulting (8 sessions)", quantity: 8, rate: 1500 }], subtotal: 12000, taxRate: 18, cgst: 1080, sgst: 1080, igst: 0, gstAmount: 2160, total: 14160, status: "paid" as const, issueDate: "2024-10-01", dueDate: "2024-11-01", paidDate: "2024-10-25", interstate: false, paidReceipt: { date: "2024-10-25", amount: 14160, mode: "Bank Transfer", reference: "UTR1234567890" } },
  { number: "INV-2024-002", ci: 1, pi: 2, items: [{ description: "Tableau Dashboard Build (6 sessions)", quantity: 6, rate: 2500 }], subtotal: 15000, taxRate: 18, cgst: 0, sgst: 0, igst: 2700, gstAmount: 2700, total: 17700, status: "sent" as const, issueDate: "2024-10-05", dueDate: "2024-10-28", interstate: true },
];

const seedExpenses: Omit<Expense, "id">[] = [
  { date: "2024-09-15", category: "software", vendor: "JetBrains", description: "IntelliJ Ultimate licenses", amount: 8500, gstAmount: 1530, total: 10030, paymentMethod: "Credit Card", isAsset: false },
  { date: "2024-08-20", category: "furniture", vendor: "Urban Ladder", vendorGstin: "29XYZAB1234C1Z5", description: "Office desks (3 units)", amount: 45000, gstAmount: 8100, total: 53100, paymentMethod: "Bank Transfer", isAsset: true, assetTag: "FURN-001" },
  { date: "2024-09-05", category: "equipment", vendor: "Croma", vendorGstin: "29CROMA1234C1Z5", description: "MacBook Pro M3", amount: 195000, gstAmount: 35100, total: 230100, paymentMethod: "Credit Card", isAsset: true, assetTag: "EQUIP-001" },
  { date: "2024-09-10", category: "marketing", vendor: "Google Ads", description: "September campaign", amount: 6500, gstAmount: 1170, total: 7670, paymentMethod: "Credit Card", isAsset: false },
  { date: "2024-09-12", category: "travel", vendor: "MakeMyTrip", description: "Client visit Mumbai", amount: 2000, gstAmount: 360, total: 2360, paymentMethod: "Credit Card", isAsset: false },
];

const seedCompany: CompanyDetails = {
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
};

const defaultTax: TaxSettings = { gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, tdsRate: 10, company: seedCompany };

// ---------------- In-memory cache ----------------

type DB = {
  clients: Client[]; developers: Developer[]; projects: Project[]; meetings: Meeting[];
  payments: Payment[]; invoices: Invoice[]; expenses: Expense[]; receipts: Receipt[];
  tax: TaxSettings; profile: Profile;
};

const emptyDB = (): DB => ({
  clients: [], developers: [], projects: [], meetings: [],
  payments: [], invoices: [], expenses: [], receipts: [],
  tax: defaultTax, profile: { name: "User", email: "", role: "Owner", initials: "U" },
});

export type OrgRole = "owner" | "admin" | "ca";

let db: DB = emptyDB();
let loaded = false;
let currentUserId: string | null = null;
let currentRole: OrgRole | null = null;
let currentOrgId: string | null = null;
const listeners = new Set<() => void>();

export const getRole = (): OrgRole | null => currentRole;
export const getOrgId = (): string | null => currentOrgId;
export const canWrite = (): boolean => currentRole === "owner" || currentRole === "admin";
export const isOwner = (): boolean => currentRole === "owner";

// Which top-level routes each role may access.
const ROLE_TABS: Record<OrgRole, string[]> = {
  owner: ["/", "/clients", "/developers", "/meetings", "/billing", "/finance", "/reports", "/team"],
  admin: ["/", "/clients", "/developers", "/meetings", "/billing", "/finance", "/reports"],
  ca: ["/billing", "/finance", "/reports"],
};
export const allowedTabs = (): string[] => (currentRole ? ROLE_TABS[currentRole] : ROLE_TABS.owner);
export const canAccessTab = (path: string): boolean => allowedTabs().includes(path);

function commit() { listeners.forEach((l) => l()); }

function useSlice<K extends keyof DB>(key: K): DB[K] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return db[key];
}

export const useStoreLoaded = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return loaded;
};

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function persist(p: PromiseLike<{ error: unknown }>) {
  Promise.resolve(p).then((res) => {
    const err = (res as { error?: { message?: string } })?.error;
    if (err) { toast.error("Save failed: " + (err.message || "unknown error")); loadStore(); }
  });
}

// ---------------- Row mappers (db <-> app) ----------------

type Row = Record<string, unknown>;

const clientFromRow = (r: Row): Client => ({ id: r.id as string, name: r.name as string, email: r.email as string, phone: r.phone as string, company: (r.company as string) || "", address: r.address as string, gstin: r.gstin as string, pan: r.pan as string, stateCode: r.state_code as string, technologies: (r.technologies as string[]) || [], progress: (r.progress as number) || 0, status: (r.status as Client["status"]) });
const clientToRow = (c: Client): any => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, company: c.company, address: c.address, gstin: c.gstin, pan: c.pan, state_code: c.stateCode, technologies: c.technologies, progress: c.progress, status: c.status });

const devFromRow = (r: Row): Developer => ({ id: r.id as string, name: r.name as string, initials: (r.initials as string) || "", level: (r.level as string) || "", experience: (r.experience as string) || "", status: (r.status as Developer["status"]) || "available", email: (r.email as string) || "", phone: (r.phone as string) || "", skills: (r.skills as string[]) || [], schedule: (r.schedule as string) || "", languages: (r.languages as string) || "", activeClients: (r.active_clients as number) || 0, utilization: (r.utilization as number) || 0, rating: Number(r.rating) || 0, monthlyEarnings: Number(r.monthly_earnings) || 0, salary: Number(r.salary) || 0, hourlyRate: r.hourly_rate == null ? undefined : Number(r.hourly_rate), onTimeRate: (r.on_time_rate as number) || 0, responseTime: (r.response_time as string) || "", knowledgeScore: Number(r.knowledge_score) || 0, communication: Number(r.communication) || 0, feedback: (r.feedback as Developer["feedback"]) || [] });
const devToRow = (d: Developer): any => ({ id: d.id, name: d.name, initials: d.initials, level: d.level, experience: d.experience, status: d.status, email: d.email, phone: d.phone, skills: d.skills, schedule: d.schedule, languages: d.languages, active_clients: d.activeClients, utilization: d.utilization, rating: d.rating, monthly_earnings: d.monthlyEarnings, salary: d.salary, hourly_rate: d.hourlyRate, on_time_rate: d.onTimeRate, response_time: d.responseTime, knowledge_score: d.knowledgeScore, communication: d.communication, feedback: d.feedback });

const projFromRow = (r: Row): Project => ({ id: r.id as string, clientId: (r.client_id as string) || "", name: r.name as string, technology: (r.technology as string) || "", assignedDeveloperId: (r.assigned_developer_id as string) || "", startDate: (r.start_date as string) || "", status: (r.status as Project["status"]) || "active", satisfactionRating: (r.satisfaction_rating as number) || 0, notes: r.notes as string });
const projToRow = (p: Project): any => ({ id: p.id, client_id: p.clientId, name: p.name, technology: p.technology, assigned_developer_id: p.assignedDeveloperId || null, start_date: p.startDate || null, status: p.status, satisfaction_rating: p.satisfactionRating, notes: p.notes });

const meetFromRow = (r: Row): Meeting => ({ id: r.id as string, title: r.title as string, clientId: (r.client_id as string) || "", developerId: (r.developer_id as string) || "", projectId: r.project_id as string, client: (r.client as string) || "", developer: (r.developer as string) || "", technology: (r.technology as string) || "", date: (r.date as string) || "", time: (r.time as string) || "", duration: (r.duration as number) || 0, status: (r.status as Meeting["status"]) || "scheduled", priority: (r.priority as Meeting["priority"]) || "medium", agenda: (r.agenda as string) || "", zoom: !!r.zoom });
const meetToRow = (m: Meeting): any => ({ id: m.id, title: m.title, client_id: m.clientId || null, developer_id: m.developerId || null, project_id: m.projectId || null, client: m.client, developer: m.developer, technology: m.technology, date: m.date || null, time: m.time, duration: m.duration, status: m.status, priority: m.priority, agenda: m.agenda, zoom: m.zoom });

const invFromRow = (r: Row, items: LineItem[]): Invoice => ({ id: r.id as string, number: r.number as string, clientId: (r.client_id as string) || "", projectId: r.project_id as string, lineItems: items, subtotal: Number(r.subtotal) || 0, taxRate: Number(r.tax_rate) || 0, cgst: Number(r.cgst) || 0, sgst: Number(r.sgst) || 0, igst: Number(r.igst) || 0, gstAmount: Number(r.gst_amount) || 0, total: Number(r.total) || 0, roundOff: r.round_off == null ? undefined : Number(r.round_off), status: (r.status as Invoice["status"]) || "draft", issueDate: (r.issue_date as string) || "", dueDate: (r.due_date as string) || "", paidDate: r.paid_date as string, notes: r.notes as string, interstate: !!r.interstate, placeOfSupply: r.place_of_supply as string, reverseCharge: !!r.reverse_charge, tdsDeducted: r.tds_deducted == null ? undefined : Number(r.tds_deducted), poNumber: r.po_number as string });
const invToRow = (i: Invoice): any => ({ id: i.id, number: i.number, client_id: i.clientId || null, project_id: i.projectId || null, subtotal: i.subtotal, tax_rate: i.taxRate, cgst: i.cgst, sgst: i.sgst, igst: i.igst, gst_amount: i.gstAmount, total: i.total, round_off: i.roundOff, status: i.status, issue_date: i.issueDate || null, due_date: i.dueDate || null, paid_date: i.paidDate || null, notes: i.notes, interstate: i.interstate, place_of_supply: i.placeOfSupply, reverse_charge: i.reverseCharge, tds_deducted: i.tdsDeducted, po_number: i.poNumber });
const lineToRow = (l: LineItem, invoiceId: string): any => ({ id: l.id, invoice_id: invoiceId, description: l.description, hsn: l.hsn, quantity: l.quantity, rate: l.rate });

const receiptFromRow = (r: Row): Receipt => ({ id: r.id as string, invoiceId: (r.invoice_id as string) || "", date: (r.date as string) || "", amount: Number(r.amount) || 0, mode: (r.mode as string) || "", reference: r.reference as string, notes: r.notes as string });
const receiptToRow = (r: Receipt): any => ({ id: r.id, invoice_id: r.invoiceId, date: r.date || null, amount: r.amount, mode: r.mode, reference: r.reference, notes: r.notes });

const expFromRow = (r: Row): Expense => ({ id: r.id as string, date: (r.date as string) || "", category: (r.category as ExpenseCategory) || "other", vendor: (r.vendor as string) || "", vendorGstin: r.vendor_gstin as string, vendorPan: r.vendor_pan as string, description: (r.description as string) || "", amount: Number(r.amount) || 0, gstAmount: Number(r.gst_amount) || 0, total: Number(r.total) || 0, paymentMethod: (r.payment_method as string) || "", isAsset: !!r.is_asset, assetTag: r.asset_tag as string, reverseCharge: !!r.reverse_charge, itcEligible: r.itc_eligible == null ? undefined : !!r.itc_eligible, tdsDeducted: r.tds_deducted == null ? undefined : Number(r.tds_deducted), hsn: r.hsn as string });
const expToRow = (e: Expense): any => ({ id: e.id, date: e.date || null, category: e.category, vendor: e.vendor, vendor_gstin: e.vendorGstin, vendor_pan: e.vendorPan, description: e.description, amount: e.amount, gst_amount: e.gstAmount, total: e.total, payment_method: e.paymentMethod, is_asset: e.isAsset, asset_tag: e.assetTag, reverse_charge: e.reverseCharge, itc_eligible: e.itcEligible, tds_deducted: e.tdsDeducted, hsn: e.hsn });

const payFromRow = (r: Row): Payment => ({ id: r.id as string, invoice: (r.invoice as string) || "", client: (r.client as string) || "", initials: (r.initials as string) || "", company: (r.company as string) || "", technology: (r.technology as string) || "", developer: (r.developer as string) || "", sessions: (r.sessions as number) || 0, base: Number(r.base) || 0, gst: Number(r.gst) || 0, total: Number(r.total) || 0, method: (r.method as string) || "", due: (r.due as string) || "", status: (r.status as Payment["status"]) || "pending", overdueDays: r.overdue_days == null ? undefined : Number(r.overdue_days) });

// ---------------- Load + seed ----------------

export async function loadStore(): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) { db = emptyDB(); loaded = false; currentUserId = null; commit(); return; }
  currentUserId = user.id;

  // Determine this user's role + organization within their company.
  const memR = await supabase
    .from("organization_members")
    .select("role, organization_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (memR.data) {
    currentRole = (memR.data.role as OrgRole) ?? null;
    currentOrgId = (memR.data.organization_id as string) ?? null;
  } else {
    currentRole = null;
    currentOrgId = null;
  }

  const [clientsR, devsR, projsR, meetsR, invsR, linesR, recsR, expsR, paysR, taxR, profR] = await Promise.all([
    supabase.from("clients").select("*").order("created_at"),
    supabase.from("developers").select("*").order("created_at"),
    supabase.from("projects").select("*").order("created_at"),
    supabase.from("meetings").select("*").order("created_at"),
    supabase.from("invoices").select("*").order("created_at"),
    supabase.from("invoice_line_items").select("*").order("created_at"),
    supabase.from("receipts").select("*").order("created_at"),
    supabase.from("expenses").select("*").order("created_at"),
    supabase.from("payments").select("*").order("created_at"),
    supabase.from("tax_settings").select("*").maybeSingle(),
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const noData = !(clientsR.data?.length || devsR.data?.length || invsR.data?.length || expsR.data?.length);
  // Only seed demo data for managers (owner/admin). Read-only members (ca) joining a
  // brand-new org must never trigger writes — they simply see an empty workspace.
  if (noData && canWrite()) {
    await seedDemoData();
    return loadStore();
  }

  const lines = (linesR.data || []) as Row[];
  db.clients = (clientsR.data || []).map(clientFromRow as (r: Row) => Client);
  db.developers = (devsR.data || []).map(devFromRow as (r: Row) => Developer);
  db.projects = (projsR.data || []).map(projFromRow as (r: Row) => Project);
  db.meetings = (meetsR.data || []).map(meetFromRow as (r: Row) => Meeting);
  db.invoices = (invsR.data || []).map((r) => invFromRow(r as Row, lines.filter((l) => l.invoice_id === (r as Row).id).map((l) => ({ id: l.id as string, description: l.description as string, hsn: l.hsn as string, quantity: Number(l.quantity) || 0, rate: Number(l.rate) || 0 }))));
  db.receipts = (recsR.data || []).map(receiptFromRow as (r: Row) => Receipt);
  db.expenses = (expsR.data || []).map(expFromRow as (r: Row) => Expense);
  db.payments = (paysR.data || []).map(payFromRow as (r: Row) => Payment);

  if (taxR.data) {
    const t = taxR.data as Row;
    db.tax = { gstRate: Number(t.gst_rate), cgstRate: Number(t.cgst_rate), sgstRate: Number(t.sgst_rate), igstRate: Number(t.igst_rate), tdsRate: Number(t.tds_rate), company: { ...seedCompany, ...((t.company as CompanyDetails) || {}) } };
  } else {
    db.tax = defaultTax;
  }
  if (profR.data) {
    const p = profR.data as Row;
    db.profile = { name: (p.name as string) || "User", email: (p.email as string) || user.email || "", role: (p.role as string) || "Owner", initials: (p.initials as string) || "U" };
  } else {
    db.profile = { name: user.email?.split("@")[0] || "User", email: user.email || "", role: "Owner", initials: (user.email || "U").slice(0, 2).toUpperCase() };
  }

  loaded = true;
  commit();
}

export function clearStore() {
  db = emptyDB();
  loaded = false;
  currentUserId = null;
  currentRole = null;
  currentOrgId = null;
  commit();
}

async function seedDemoData(): Promise<void> {
  const clientIds = seedClients.map(() => uid());
  const devIds = seedDevelopers.map(() => uid());
  const projIds = seedProjects.map(() => uid());
  const invIds = seedInvoices.map(() => uid());

  await supabase.from("clients").insert(seedClients.map((c, i) => clientToRow({ ...c, id: clientIds[i] })));
  await supabase.from("developers").insert(seedDevelopers.map((d, i) => devToRow({ ...d, id: devIds[i] })));
  await supabase.from("projects").insert(seedProjects.map((p, i) => projToRow({ id: projIds[i], clientId: clientIds[p.ci], name: p.name, technology: p.technology, assignedDeveloperId: devIds[p.di], startDate: p.startDate, status: p.status, satisfactionRating: p.satisfactionRating, notes: p.notes })));
  await supabase.from("meetings").insert(seedMeetings.map((m) => meetToRow({ id: uid(), title: m.title, clientId: clientIds[m.ci], developerId: devIds[m.di], projectId: projIds[m.pi], client: seedClients[m.ci].name, developer: seedDevelopers[m.di].name, technology: m.technology, date: m.date, time: m.time, duration: m.duration, status: m.status, priority: m.priority, agenda: m.agenda, zoom: m.zoom })));

  await supabase.from("invoices").insert(seedInvoices.map((inv, i) => invToRow({ id: invIds[i], number: inv.number, clientId: clientIds[inv.ci], projectId: projIds[inv.pi], lineItems: [], subtotal: inv.subtotal, taxRate: inv.taxRate, cgst: inv.cgst, sgst: inv.sgst, igst: inv.igst, gstAmount: inv.gstAmount, total: inv.total, status: inv.status, issueDate: inv.issueDate, dueDate: inv.dueDate, paidDate: inv.paidDate, interstate: inv.interstate })));
  const lineRows: any[] = [];
  seedInvoices.forEach((inv, i) => inv.items.forEach((it) => lineRows.push(lineToRow({ id: uid(), description: it.description, quantity: it.quantity, rate: it.rate }, invIds[i]))));
  if (lineRows.length) await supabase.from("invoice_line_items").insert(lineRows);

  const recRows: any[] = [];
  seedInvoices.forEach((inv, i) => { if (inv.paidReceipt) recRows.push(receiptToRow({ id: uid(), invoiceId: invIds[i], date: inv.paidReceipt.date, amount: inv.paidReceipt.amount, mode: inv.paidReceipt.mode, reference: inv.paidReceipt.reference })); });
  if (recRows.length) await supabase.from("receipts").insert(recRows);

  await supabase.from("expenses").insert(seedExpenses.map((e) => expToRow({ ...e, id: uid() })));
  await supabase.from("tax_settings").insert({ user_id: currentUserId, gst_rate: defaultTax.gstRate, cgst_rate: defaultTax.cgstRate, sgst_rate: defaultTax.sgstRate, igst_rate: defaultTax.igstRate, tds_rate: defaultTax.tdsRate, company: defaultTax.company as any });
}

export async function resetAll(): Promise<void> {
  if (!currentUserId) return;
  const tables = ["receipts", "invoice_line_items", "invoices", "meetings", "projects", "expenses", "payments", "developers", "clients", "tax_settings"] as const;
  for (const t of tables) {
    await supabase.from(t).delete().eq("user_id", currentUserId);
  }
  await seedDemoData();
  await loadStore();
}

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

// Re-renders when role/org/membership state changes (commit() fires the listeners).
export const useOrgRole = (): OrgRole | null => {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return currentRole;
};

// True for owner/admin, false for read-only ca. Re-renders when the role loads.
export const useCanWrite = (): boolean => {
  const role = useOrgRole();
  return role === "owner" || role === "admin" || role === null;
};

// ---------------- Mutations ----------------

export const addClient = (c: Omit<Client, "id" | "progress" | "status">) => {
  const nc: Client = { ...c, id: uid(), progress: 0, status: "new" };
  db.clients = [...db.clients, nc]; commit();
  persist(supabase.from("clients").insert(clientToRow(nc)));
};
export const updateClient = (id: string, patch: Partial<Client>) => {
  db.clients = db.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)); commit();
  const updated = db.clients.find((c) => c.id === id);
  if (updated) persist(supabase.from("clients").update(clientToRow(updated)).eq("id", id));
};
export const deleteClient = (id: string) => {
  db.clients = db.clients.filter((c) => c.id !== id);
  db.projects = db.projects.filter((p) => p.clientId !== id);
  commit();
  persist(supabase.from("clients").delete().eq("id", id));
};

export const addDeveloper = (d: Omit<Developer, "id" | "initials" | "activeClients" | "utilization" | "rating" | "monthlyEarnings" | "onTimeRate" | "responseTime" | "knowledgeScore" | "communication" | "feedback"> & Partial<Developer>) => {
  const initials = d.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const nd = { activeClients: 0, utilization: 0, rating: 0, monthlyEarnings: 0, onTimeRate: 100, responseTime: "< 24 hours", knowledgeScore: 7, communication: 7, feedback: [], ...d, id: uid(), initials } as Developer;
  db.developers = [...db.developers, nd]; commit();
  persist(supabase.from("developers").insert(devToRow(nd)));
};
export const updateDeveloper = (id: string, patch: Partial<Developer>) => {
  db.developers = db.developers.map((d) => (d.id === id ? { ...d, ...patch } : d)); commit();
  const updated = db.developers.find((d) => d.id === id);
  if (updated) persist(supabase.from("developers").update(devToRow(updated)).eq("id", id));
};

export const addProject = (p: Omit<Project, "id">) => {
  const np: Project = { ...p, id: uid() };
  db.projects = [...db.projects, np];
  const dev = db.developers.find((d) => d.id === p.assignedDeveloperId);
  if (dev && p.status === "active") {
    db.developers = db.developers.map((d) => (d.id === dev.id ? { ...d, activeClients: d.activeClients + 1, status: "busy" } : d));
  }
  commit();
  persist(supabase.from("projects").insert(projToRow(np)));
  if (dev && p.status === "active") {
    const updatedDev = db.developers.find((d) => d.id === dev.id)!;
    persist(supabase.from("developers").update(devToRow(updatedDev)).eq("id", dev.id));
  }
};
export const updateProject = (id: string, patch: Partial<Project>) => {
  db.projects = db.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)); commit();
  const updated = db.projects.find((p) => p.id === id);
  if (updated) persist(supabase.from("projects").update(projToRow(updated)).eq("id", id));
};

export const addMeeting = (m: Omit<Meeting, "id" | "client" | "developer" | "technology">) => {
  const client = db.clients.find((c) => c.id === m.clientId);
  const developer = db.developers.find((d) => d.id === m.developerId);
  const project = m.projectId ? db.projects.find((p) => p.id === m.projectId) : undefined;
  const nm: Meeting = { ...m, id: uid(), client: client?.name || "Unknown", developer: developer?.name || "Unknown", technology: `${client?.company || ""}${project ? " • " + project.technology : ""}` };
  db.meetings = [...db.meetings, nm]; commit();
  persist(supabase.from("meetings").insert(meetToRow(nm)));
};
export const updateMeeting = (id: string, patch: Partial<Meeting>) => {
  db.meetings = db.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)); commit();
  const updated = db.meetings.find((m) => m.id === id);
  if (updated) persist(supabase.from("meetings").update(meetToRow(updated)).eq("id", id));
};
export const deleteMeeting = (id: string) => {
  db.meetings = db.meetings.filter((m) => m.id !== id); commit();
  persist(supabase.from("meetings").delete().eq("id", id));
};

export const markPaymentPaid = (id: string) => {
  db.payments = db.payments.map((p) => (p.id === id ? { ...p, status: "paid", overdueDays: undefined } : p)); commit();
  persist(supabase.from("payments").update({ status: "paid", overdue_days: null }).eq("id", id));
};

export const addInvoice = (inv: Omit<Invoice, "id" | "number">) => {
  const number = `INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(3, "0")}`;
  const ni: Invoice = { ...inv, id: uid(), number };
  db.invoices = [...db.invoices, ni]; commit();
  persist(supabase.from("invoices").insert(invToRow(ni)));
  if (ni.lineItems.length) persist(supabase.from("invoice_line_items").insert(ni.lineItems.map((l) => lineToRow(l, ni.id))));
  return number;
};
export const updateInvoice = (id: string, patch: Partial<Invoice>) => {
  db.invoices = db.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)); commit();
  const updated = db.invoices.find((i) => i.id === id);
  if (!updated) return;
  persist(supabase.from("invoices").update(invToRow(updated)).eq("id", id));
  if (patch.lineItems) {
    (async () => {
      await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
      if (updated.lineItems.length) await supabase.from("invoice_line_items").insert(updated.lineItems.map((l) => lineToRow(l, id)));
    })();
  }
};
export const deleteInvoice = (id: string) => {
  db.invoices = db.invoices.filter((i) => i.id !== id);
  db.receipts = db.receipts.filter((r) => r.invoiceId !== id);
  commit();
  persist(supabase.from("invoices").delete().eq("id", id));
};
export const duplicateInvoice = (id: string): string | null => {
  const src = db.invoices.find((i) => i.id === id);
  if (!src) return null;
  const number = `INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(3, "0")}`;
  const clone: Invoice = {
    ...src, id: uid(), number, status: "draft",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    paidDate: undefined,
    lineItems: src.lineItems.map((l) => ({ ...l, id: uid() })),
  };
  db.invoices = [...db.invoices, clone]; commit();
  persist(supabase.from("invoices").insert(invToRow(clone)));
  if (clone.lineItems.length) persist(supabase.from("invoice_line_items").insert(clone.lineItems.map((l) => lineToRow(l, clone.id))));
  return number;
};

export const addReceipt = (r: Omit<Receipt, "id">) => {
  const nr: Receipt = { ...r, id: uid() };
  db.receipts = [...db.receipts, nr];
  const inv = db.invoices.find((i) => i.id === r.invoiceId);
  let markPaid = false;
  if (inv) {
    const paidSum = db.receipts.filter((x) => x.invoiceId === r.invoiceId).reduce((s, x) => s + x.amount, 0);
    if (paidSum >= inv.total - (inv.tdsDeducted || 0) - 1) {
      db.invoices = db.invoices.map((i) => (i.id === r.invoiceId ? { ...i, status: "paid", paidDate: r.date } : i));
      markPaid = true;
    }
  }
  commit();
  persist(supabase.from("receipts").insert(receiptToRow(nr)));
  if (markPaid) persist(supabase.from("invoices").update({ status: "paid", paid_date: r.date }).eq("id", r.invoiceId));
};
export const deleteReceipt = (id: string) => {
  db.receipts = db.receipts.filter((r) => r.id !== id); commit();
  persist(supabase.from("receipts").delete().eq("id", id));
};

export const addExpense = (e: Omit<Expense, "id">) => {
  const ne: Expense = { ...e, id: uid() };
  db.expenses = [...db.expenses, ne]; commit();
  persist(supabase.from("expenses").insert(expToRow(ne)));
};
export const updateExpense = (id: string, patch: Partial<Expense>) => {
  db.expenses = db.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)); commit();
  const updated = db.expenses.find((e) => e.id === id);
  if (updated) persist(supabase.from("expenses").update(expToRow(updated)).eq("id", id));
};
export const deleteExpense = (id: string) => {
  db.expenses = db.expenses.filter((e) => e.id !== id); commit();
  persist(supabase.from("expenses").delete().eq("id", id));
};

export const updateTaxSettings = (patch: Partial<TaxSettings> & { company?: Partial<CompanyDetails> }) => {
  db.tax = { ...db.tax, ...patch, company: { ...db.tax.company, ...(patch.company || {}) } };
  commit();
  persist(supabase.from("tax_settings").upsert({
    user_id: currentUserId,
    gst_rate: db.tax.gstRate, cgst_rate: db.tax.cgstRate, sgst_rate: db.tax.sgstRate, igst_rate: db.tax.igstRate, tds_rate: db.tax.tdsRate,
    company: db.tax.company as any,
  }, { onConflict: "user_id" }));
};
export const updateProfile = (patch: Partial<Profile>) => {
  db.profile = { ...db.profile, ...patch };
  if (patch.name) db.profile.initials = patch.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  commit();
  if (currentUserId) persist(supabase.from("profiles").update({ name: db.profile.name, email: db.profile.email, role: db.profile.role, initials: db.profile.initials }).eq("user_id", currentUserId));
};

// ---------------- Convenience helpers ----------------

export const getClient = (id: string) => db.clients.find((c) => c.id === id);
export const getDeveloper = (id: string) => db.developers.find((d) => d.id === id);
export const getProject = (id: string) => db.projects.find((p) => p.id === id);
export const projectsForClient = (clientId: string) => db.projects.filter((p) => p.clientId === clientId);
export const projectsForDeveloper = (devId: string) => db.projects.filter((p) => p.assignedDeveloperId === devId);
export const meetingsForClient = (clientId: string) => db.meetings.filter((m) => m.clientId === clientId);
export const invoicesForClient = (clientId: string) => db.invoices.filter((i) => i.clientId === clientId);
