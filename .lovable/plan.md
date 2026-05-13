
# End-to-End Business Management Platform

Turn the dashboard into a single source of truth where Clients, Developers, Meetings, Finance, Billing, and Expenses all stay in sync.

## 1. Shared data model (src/data/store.ts)

Extend the in-memory store so every entity links by ID:

- **Client**: add `phone`, `mobile`, `address`, `gstin`, `projects: Project[]`
- **Project** (new): `id`, `clientId`, `name`, `technology`, `assignedDeveloperId`, `startDate`, `status` (active/completed), `satisfactionRating`, `notes`
- **Developer**: add `salary`, `currentProjectIds: string[]`
- **Meeting**: already linked by names → switch to `clientId`, `developerId`, `projectId`
- **Invoice/Bill** (new): `id`, `number`, `clientId`, `projectId`, `lineItems[]`, `subtotal`, `taxRate`, `gstAmount`, `total`, `status` (draft/sent/paid/overdue), `issueDate`, `dueDate`, `paidDate`, `notes`
- **Expense** (new): `id`, `category` (furniture/equipment/software/travel/utilities/other), `vendor`, `description`, `amount`, `gstAmount`, `date`, `paymentMethod`, `receiptUrl?`, `assetTag?`
- **TaxSettings** (new): `gstRate`, `cgstRate`, `sgstRate`, `igstRate`, `tdsRate`, `companyDetails {name, gstin, pan, address, caEmail}`

Add CRUD helpers (`updateClient`, `addProject`, `updateProject`, `addInvoice`, `updateInvoice`, `addExpense`, `updateTaxSettings`).

Persist to `localStorage` so refresh keeps data.

## 2. Clients page

- "Add Project" button on each client card → modal to create a project and assign a developer (dropdown of developers).
- Client card shows project count → click expands a history panel:
  - Past & current projects with developer names
  - Satisfaction rating per project (★★★★★)
  - Linked meetings count, invoices total, payments received
- "Edit" button → modal to update name, email, phone, company, address, GSTIN.
- Stat tiles update live from store.

## 3. Developers page

- New tab **Current Workload**: shows each dev's active projects (client + tech) and salary.
- "Add Developer" button → working modal with: name, level, experience, email, phone, skills (tag input), schedule, languages, salary, hourly rate.
- Earnings tab pulls from invoices linked to that developer's projects.

## 4. Meetings page

- "Schedule Meeting" working modal (client + project + developer + date/time/duration/agenda/priority).
- Edit, delete, mark complete buttons functional.
- "Join Zoom" opens a placeholder link.
- Filter by client/developer.

## 5. Finance page

- **Settings button** → modal to edit tax rates (GST/CGST/SGST/IGST/TDS) and company details (name, GSTIN, PAN, CA email).
- Stats recompute from invoices + expenses (revenue, expenses, net profit, GST collected, GST paid, net GST payable).
- "Mark Paid" already works; add "Send Reminder" (toast).
- **Export GST**: generate a ZIP containing
  - `invoices.csv` (GSTR-1 friendly columns: invoice no, date, GSTIN, taxable value, CGST, SGST, IGST, total)
  - `expenses.csv` (GSTR-2 friendly: vendor, GSTIN, date, taxable value, GST)
  - `summary.txt` with period totals
  - One PDF per invoice
  Use JSZip + jsPDF (already common deps; add if missing).
- "Email to CA" → uses `mailto:` with CA email from settings + attach instruction text (browser can't auto-attach, so we download zip + open mail draft).

## 6. New Billing tab (`/billing`)

- List of invoices with status badges, search, filter.
- "Create Invoice" modal:
  - Pick client → auto-fills GSTIN/address
  - Pick project (optional)
  - Add line items (description, qty, rate)
  - Auto compute subtotal, GST (uses tax settings), total
  - Notes, due date
- Each invoice row: View (modal preview formatted as Indian tax invoice), Edit, Download PDF, Mark Sent, Mark Paid, Delete.
- Created invoices appear automatically in Finance.

## 7. New Expenses section (inside Finance as a tab + dedicated `/expenses`)

- "Add Expense" modal: category, vendor, vendor GSTIN, description, amount, GST, date, payment method, asset tag (for capital assets like furniture/laptops).
- Categorized list with totals per category.
- Fixed assets vs operational expenses split for clarity.

## 8. Top-bar buttons

Make Settings, Help & Support, Profile open real dialogs:
- **Profile**: edit user name, email, avatar (initials), role.
- **Settings**: theme toggle, notifications, default currency, company details shortcut.
- **Help & Support**: FAQ accordion + contact form (mailto).

## 9. Cross-tab interlinkage

Every mutation goes through the store; all tabs subscribe → stats and lists update everywhere instantly. Example: create invoice → Finance revenue updates, client card shows new bill, project shows payment progress.

## Technical notes

- New components: `AddProjectDialog`, `EditClientDialog`, `ClientHistoryPanel`, `AddDeveloperDialog`, `ScheduleMeetingDialog`, `CreateInvoiceDialog`, `InvoicePreview`, `AddExpenseDialog`, `TaxSettingsDialog`, `ProfileDialog`, `SettingsDialog`, `HelpDialog`.
- New pages: `src/pages/Billing.tsx`, expense tab inside Finance.
- New deps: `jszip`, `jspdf`, `jspdf-autotable` for invoice PDFs and ZIP export.
- Persistence: `localStorage` wrapper in store (keeps backend-free for now; can migrate to Lovable Cloud later).
- All forms validated with `zod` + `react-hook-form` (already installed via shadcn).
- File-size discipline: split each dialog into its own file; keep pages under ~250 lines.

## What I will NOT do in this pass
- No backend / Lovable Cloud yet (you can opt in after reviewing).
- No real email sending (uses `mailto:` + ZIP download for CA workflow).
- No Zoom API integration (placeholder link).

After approval I'll build it all in one go and hand back a working interlinked app.
