import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "How do I add a new client?", a: "Go to Clients → fill the Add New Client form, then click Add Client." },
  { q: "How do I assign a developer to a project?", a: "Open a client card, click 'Add Project', then pick a developer in the assignment dropdown." },
  { q: "How do I generate a tax invoice?", a: "Go to Billing → Create Invoice, pick a client, add line items. GST is computed from your Tax Settings." },
  { q: "How do I send GST data to my CA?", a: "Finance → Export GST. Downloads a ZIP with GSTR-1, GSTR-2 CSVs, summary and per-invoice PDFs. Then click 'Email to CA' to draft a mail." },
  { q: "How do I record a business expense?", a: "Finance → Expenses tab → Add Expense. Mark capital purchases (laptop, furniture) as Asset for asset-register tracking." },
  { q: "Can I edit a client's email or company?", a: "Yes — click Edit on the client card. All fields are editable; updates flow into invoices automatically." },
];

export const HelpDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Help & Support</DialogTitle></DialogHeader>
      <Accordion type="single" collapsible>
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="text-sm text-muted-foreground pt-2">Need more help? Email <a className="text-primary underline" href="mailto:support@lovable.dev">support@lovable.dev</a></div>
      <DialogFooter><Button onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
    </DialogContent>
  </Dialog>
);
