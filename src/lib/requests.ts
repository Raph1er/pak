import type { Database } from "@/integrations/supabase/types";

export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];
export type RequestEventRow = Database["public"]["Tables"]["request_events"]["Row"];
export type RequestStatus = Database["public"]["Enums"]["request_status"];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "En attente",
  reviewing: "En revue",
  scheduled: "Planifiée",
  in_progress: "En cours",
  delivered: "Livrée",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const STATUS_ORDER: RequestStatus[] = [
  "pending",
  "reviewing",
  "scheduled",
  "in_progress",
  "delivered",
  "completed",
];

export const STATUS_COLOR: Record<RequestStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewing: "bg-accent/20 text-accent-foreground",
  scheduled: "bg-primary/15 text-primary",
  in_progress: "bg-primary/20 text-primary",
  delivered: "bg-primary/30 text-primary",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatDateTime(d: string) {
  return new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}
