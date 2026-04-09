import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const items = [
  {
    q: "What is an eSIM?",
    a: "An eSIM is a digital SIM built into your phone. There is no plastic card—activation is done with a profile we install after you order.",
  },
  {
    q: "How do I find my IMEI?",
    a: "Dial *#06# on your phone, or check Settings → About. Enter the IMEI carefully in the order form so we can match your device correctly.",
  },
  {
    q: "How does payment work?",
    a: "After you fill the order form, we show a bank transfer payment step on the same page. Pay the exact amount shown, copy the unique reference code, and use it as your transfer narration before uploading your receipt.",
  },
  {
    q: "What should my payment receipt show?",
    a: "Your receipt should clearly show the transfer amount, recipient details, and the unique reference code used in your narration. We accept JPG, PNG, and PDF receipts.",
  },
  {
    q: "What if I forget to add the reference code?",
    a: "Please contact support as soon as possible with your order details and receipt. The reference code helps us match your payment faster, so orders without it may take longer to confirm.",
  },
  {
    q: "How long does fulfillment take?",
    a: "Orders are processed manually during business hours. You will see status updates in your account when we start and when delivery is complete.",
  },
  {
    q: "Which devices are supported?",
    a: "Most recent iPhones and many Android phones support eSIM. Confirm your model is eSIM-capable before ordering.",
  },
  {
    q: "Can I keep my existing number?",
    a: "Number porting depends on the carrier and plan. Contact support before ordering if you need to port a number.",
  },
  {
    q: "What is your refund policy?",
    a: "If we cannot fulfill your order, we will work with you on a fair resolution. Reach out via support with your order ID.",
  },
] as const

export function FaqSection() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-0"
      className="divide-y divide-border/60 overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-[var(--shadow-premium)]"
    >
      {items.map((item, i) => (
        <AccordionItem
          key={item.q}
          value={`item-${i}`}
          className="border-0 px-6 last:border-b-0"
        >
          <AccordionTrigger className="py-5 text-left text-[1.05rem] font-bold tracking-tight text-foreground transition-all hover:no-underline hover:text-primary">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground/90">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
