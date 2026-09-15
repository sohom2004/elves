export interface Project {
  title: string;
  category: string;
  description: string;
  tech: string[];
  outcome: string;
  href?: string;
}

export const projects: Project[] = [
  {
    title: "Voice Agent OS",
    category: "Voice",
    description:
      "An operating system for phone-based support — call handling, live transcription, and agent handoff, running as a BPO's front line.",
    tech: ["Realtime voice", "LLM orchestration", "Telephony"],
    outcome: "Handles first-line calls end to end before a human ever joins.",
  },
  {
    title: "Knowledge Copilot",
    category: "AI",
    description:
      "A RAG-based internal copilot that turns scattered docs, tickets and wikis into a single answer engine for support teams.",
    tech: ["RAG", "Vector search", "Internal tools"],
    outcome: "Cut average ticket resolution time significantly.",
  },
  {
    title: "Ops Dashboard",
    category: "SaaS",
    description:
      "A customer-facing operations dashboard built from scratch — auth, billing, live data, and a workflow builder.",
    tech: ["Next.js", "Postgres", "Stripe"],
    outcome: "Shipped as a standalone product the client now sells.",
  },
  {
    title: "Workflow Engine",
    category: "Systems",
    description:
      "Automation infrastructure connecting CRM, inbox, and internal databases into one coherent pipeline.",
    tech: ["APIs", "Automation", "Data pipelines"],
    outcome: "Removed hours of manual data entry per week.",
  },
];
