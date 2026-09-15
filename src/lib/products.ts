export interface Product {
  name: string;
  jp: string;
  tagline: string;
  description: string;
  tags: string[];
  status: string;
}

export const products: Product[] = [
  {
    name: "Frontdesk",
    jp: "声",
    tagline: "The receptionist that never clocks out.",
    description:
      "A voice agent that answers, qualifies, and books — trained on your business, live on your number in an afternoon.",
    tags: ["Voice", "Realtime", "Scheduling"],
    status: "Live",
  },
  {
    name: "Ledger",
    jp: "帳",
    tagline: "One dashboard for the whole operation.",
    description:
      "Ops, billing, and customer data in one place — built for teams who outgrew spreadsheets but not their process.",
    tags: ["SaaS", "Billing", "Ops"],
    status: "Live",
  },
  {
    name: "Pulse",
    jp: "覧",
    tagline: "A copilot that already read the docs.",
    description:
      "RAG-backed support copilot that turns your tickets, wikis, and past replies into instant, accurate answers.",
    tags: ["AI", "RAG", "Support"],
    status: "Live",
  },
  {
    name: "Relay",
    jp: "結",
    tagline: "The glue between every tool you use.",
    description:
      "Automation infrastructure that connects your CRM, inbox, and internal systems — no brittle Zapier chains.",
    tags: ["Automation", "Integrations"],
    status: "Beta",
  },
];
