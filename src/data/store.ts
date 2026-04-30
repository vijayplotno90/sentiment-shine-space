// Shared in-memory data store with simple subscription pattern
// (No backend yet — keeps state across route changes within a session)

import { useEffect, useState } from "react";

export type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
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
  onTimeRate: number;
  responseTime: string;
  knowledgeScore: number;
  communication: number;
  feedback: { client: string; comment: string; stars: number }[];
};

export type Meeting = {
  id: string;
  title: string;
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

const initialClients: Client[] = [
  { id: "1", name: "Arun Krishnan", email: "arun@techcorp.com", company: "TechCorp Solutions", technologies: ["Java", "Spring Boot"], progress: 75, status: "active" },
  { id: "2", name: "Meera Reddy", email: "meera@dataflow.com", company: "DataFlow Analytics", technologies: ["Tableau", "SQL"], progress: 60, status: "active" },
  { id: "3", name: "Vikram Shah", email: "vikram@cloudtech.com", company: "CloudTech Systems", technologies: ["Databricks", "Python"], progress: 40, status: "new" },
];

const initialDevelopers: Developer[] = [
  {
    id: "1", name: "Amit Sharma", initials: "AS", level: "Senior", experience: "5 years experience",
    status: "busy", email: "amit.sharma@consultant.com", phone: "+91 9876543210",
    skills: ["Java", "Spring Boot", "Microservices", "MySQL"],
    schedule: "Evening (6-10 PM)", languages: "English, Hindi",
    activeClients: 4, utilization: 90, rating: 4.9, monthlyEarnings: 45000,
    onTimeRate: 99, responseTime: "< 2 hours", knowledgeScore: 9.2, communication: 9,
    feedback: [
      { client: "Arun Krishnan", comment: "Excellent Java concepts explanation", stars: 5 },
      { client: "Rohit Patel", comment: "Very patient and detailed teaching", stars: 5 },
    ],
  },
  {
    id: "2", name: "Neha Gupta", initials: "NG", level: "Senior", experience: "4 years experience",
    status: "available", email: "neha.gupta@consultant.com", phone: "+91 9876543211",
    skills: ["Tableau", "Power BI", "SQL", "Python"],
    schedule: "Morning (8-12 PM)", languages: "English, Hindi",
    activeClients: 2, utilization: 75, rating: 4.7, monthlyEarnings: 38000,
    onTimeRate: 96, responseTime: "< 3 hours", knowledgeScore: 8.9, communication: 9,
    feedback: [{ client: "Meera Reddy", comment: "Great visualization skills", stars: 5 }],
  },
  {
    id: "3", name: "Suresh Nair", initials: "SN", level: "Lead", experience: "7 years experience",
    status: "busy", email: "suresh.nair@consultant.com", phone: "+91 9876543212",
    skills: ["Databricks", "Spark", "Python", "AWS"],
    schedule: "Flexible", languages: "English, Hindi, Tamil",
    activeClients: 3, utilization: 85, rating: 4.8, monthlyEarnings: 52000,
    onTimeRate: 98, responseTime: "< 1 hour", knowledgeScore: 9.5, communication: 9,
    feedback: [{ client: "Vikram Shah", comment: "Top-notch Databricks expertise", stars: 5 }],
  },
];

const initialMeetings: Meeting[] = [
  { id: "1", title: "Java Spring Boot Advanced Concepts", client: "Arun Krishnan", developer: "Amit Sharma", technology: "TechCorp Solutions • Java Spring Boot", date: "2024-10-15", time: "10:00 AM", duration: 60, status: "scheduled", priority: "high", agenda: "Spring Security, JWT Authentication, REST API Best Practices", zoom: true },
  { id: "2", title: "Tableau Dashboard Review", client: "Meera Reddy", developer: "Neha Gupta", technology: "DataFlow Analytics • Tableau", date: "2024-10-16", time: "2:00 PM", duration: 45, status: "scheduled", priority: "medium", agenda: "Review sales dashboard, optimize calculated fields", zoom: true },
  { id: "3", title: "Databricks Onboarding", client: "Vikram Shah", developer: "Suresh Nair", technology: "CloudTech Systems • Databricks", date: "2024-10-18", time: "11:00 AM", duration: 90, status: "scheduled", priority: "high", agenda: "Workspace setup, cluster configuration, first notebook", zoom: true },
  { id: "4", title: "Java Basics Walkthrough", client: "Arun Krishnan", developer: "Amit Sharma", technology: "TechCorp Solutions • Java", date: "2024-10-08", time: "10:00 AM", duration: 60, status: "completed", priority: "medium", agenda: "OOP fundamentals, collections framework", zoom: true },
  { id: "5", title: "SQL Optimization Session", client: "Meera Reddy", developer: "Neha Gupta", technology: "DataFlow Analytics • SQL", date: "2024-10-09", time: "3:00 PM", duration: 45, status: "completed", priority: "low", agenda: "Query plans, indexing strategies", zoom: true },
  { id: "6", title: "Python for Data Science", client: "Vikram Shah", developer: "Suresh Nair", technology: "CloudTech Systems • Python", date: "2024-10-20", time: "4:00 PM", duration: 60, status: "scheduled", priority: "medium", agenda: "Pandas, NumPy, data wrangling techniques", zoom: true },
];

const initialPayments: Payment[] = [
  { id: "1", invoice: "INV-2024-001", client: "Arun Krishnan", initials: "AK", company: "TechCorp Solutions", technology: "Java Spring Boot", developer: "Amit Sharma", sessions: 8, base: 12000, gst: 2160, total: 14160, method: "Bank Transfer", due: "2024-11-01", status: "paid" },
  { id: "2", invoice: "INV-2024-002", client: "Meera Reddy", initials: "MR", company: "DataFlow Analytics", technology: "Tableau", developer: "Neha Gupta", sessions: 6, base: 15000, gst: 2700, total: 17700, method: "UPI", due: "2024-10-28", status: "pending", overdueDays: 3 },
  { id: "3", invoice: "INV-2024-003", client: "Vikram Shah", initials: "VS", company: "CloudTech Systems", technology: "Databricks", developer: "Suresh Nair", sessions: 4, base: 18000, gst: 3240, total: 21240, method: "Credit Card", due: "2024-11-05", status: "paid" },
];

// Tiny pub/sub store
function createStore<T>(initial: T[]) {
  let data = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => data,
    set: (next: T[]) => { data = next; listeners.forEach((l) => l()); },
    subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  };
}

const clientsStore = createStore(initialClients);
const developersStore = createStore(initialDevelopers);
const meetingsStore = createStore(initialMeetings);
const paymentsStore = createStore(initialPayments);

function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((n) => n + 1));
    return () => { unsub(); };
  }, [store]);
  return store.get();
}

export const useClients = () => useStore(clientsStore);
export const useDevelopers = () => useStore(developersStore);
export const useMeetings = () => useStore(meetingsStore);
export const usePayments = () => useStore(paymentsStore);

export const addClient = (c: Omit<Client, "id" | "progress" | "status">) =>
  clientsStore.set([...clientsStore.get(), { ...c, id: crypto.randomUUID(), progress: 0, status: "new" }]);
export const deleteClient = (id: string) =>
  clientsStore.set(clientsStore.get().filter((c) => c.id !== id));

export const deleteMeeting = (id: string) =>
  meetingsStore.set(meetingsStore.get().filter((m) => m.id !== id));

export const markPaymentPaid = (id: string) =>
  paymentsStore.set(paymentsStore.get().map((p) => (p.id === id ? { ...p, status: "paid", overdueDays: undefined } : p)));
