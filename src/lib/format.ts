export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
export const today = () => new Date().toISOString().slice(0, 10);

// Convert a number to Indian-English words (Lakh/Crore). Used on tax invoices.
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const twoDigit = (n: number): string => {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
};
const threeDigit = (n: number): string => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? ones[h] + " Hundred" + (r ? " " : "") : "") + (r ? twoDigit(r) : "");
};

export const inrWords = (amount: number): string => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  if (rupees === 0 && paise === 0) return "Zero Rupees Only";
  let n = rupees;
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;
  if (crore) parts.push(twoDigit(crore) + " Crore");
  if (lakh) parts.push(twoDigit(lakh) + " Lakh");
  if (thousand) parts.push(twoDigit(thousand) + " Thousand");
  if (hundred) parts.push(threeDigit(hundred));
  let result = "Rupees " + parts.join(" ");
  if (paise) result += " and " + twoDigit(paise) + " Paise";
  return result.trim() + " Only";
};

// Aging buckets for receivables (days past due)
export type AgingBuckets = { current: number; d30: number; d60: number; d90: number; d90Plus: number };
export const agingBuckets = (
  invoices: { dueDate: string; total: number; status: string; tdsDeducted?: number }[]
): AgingBuckets => {
  const now = new Date();
  const out: AgingBuckets = { current: 0, d30: 0, d60: 0, d90: 0, d90Plus: 0 };
  invoices.filter((i) => i.status !== "paid" && i.status !== "draft").forEach((i) => {
    const due = new Date(i.dueDate);
    const days = Math.floor((now.getTime() - due.getTime()) / 86400000);
    const owed = i.total - (i.tdsDeducted || 0);
    if (days <= 0) out.current += owed;
    else if (days <= 30) out.d30 += owed;
    else if (days <= 60) out.d60 += owed;
    else if (days <= 90) out.d90 += owed;
    else out.d90Plus += owed;
  });
  return out;
};

export const STATE_CODES: { code: string; name: string }[] = [
  { code: "01", name: "Jammu & Kashmir" }, { code: "02", name: "Himachal Pradesh" }, { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" }, { code: "05", name: "Uttarakhand" }, { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" }, { code: "08", name: "Rajasthan" }, { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" }, { code: "19", name: "West Bengal" }, { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" }, { code: "22", name: "Chhattisgarh" }, { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" }, { code: "27", name: "Maharashtra" }, { code: "29", name: "Karnataka" },
  { code: "32", name: "Kerala" }, { code: "33", name: "Tamil Nadu" }, { code: "34", name: "Puducherry" },
  { code: "36", name: "Telangana" }, { code: "37", name: "Andhra Pradesh" },
];
