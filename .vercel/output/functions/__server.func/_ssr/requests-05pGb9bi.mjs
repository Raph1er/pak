const STATUS_LABEL = {
  pending: "En attente",
  reviewing: "En revue",
  scheduled: "Planifiée",
  in_progress: "En cours",
  delivered: "Livrée",
  completed: "Terminée",
  cancelled: "Annulée"
};
const STATUS_ORDER = [
  "pending",
  "reviewing",
  "scheduled",
  "in_progress",
  "delivered",
  "completed"
];
const STATUS_COLOR = {
  pending: "bg-muted text-muted-foreground",
  reviewing: "bg-accent/20 text-accent-foreground",
  scheduled: "bg-primary/15 text-primary",
  in_progress: "bg-primary/20 text-primary",
  delivered: "bg-primary/30 text-primary",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/15 text-destructive"
};
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function formatDateTime(d) {
  return new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}
export {
  STATUS_LABEL as S,
  STATUS_COLOR as a,
  formatDateTime as b,
  STATUS_ORDER as c,
  formatDate as f
};
