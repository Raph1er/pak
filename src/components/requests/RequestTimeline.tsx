import { CheckCircle2, Circle, XCircle } from "lucide-react";
import {
  STATUS_LABEL,
  STATUS_ORDER,
  formatDateTime,
  type RequestEventRow,
  type RequestStatus,
} from "@/lib/requests";

type Props = {
  currentStatus: RequestStatus;
  events: RequestEventRow[];
};

export function RequestTimeline({ currentStatus, events }: Props) {
  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Demande annulée</span>
        </div>
        {events.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="text-muted-foreground">
                {STATUS_LABEL[e.status]} — {formatDateTime(e.created_at)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const reachedIdx = STATUS_ORDER.indexOf(currentStatus);
  const eventByStatus = new Map<RequestStatus, RequestEventRow>();
  for (const ev of events) {
    if (!eventByStatus.has(ev.status)) eventByStatus.set(ev.status, ev);
  }

  return (
    <ol className="relative space-y-5 border-l-2 border-border/60 pl-6">
      {STATUS_ORDER.map((status, idx) => {
        const reached = idx <= reachedIdx;
        const isCurrent = idx === reachedIdx;
        const ev = eventByStatus.get(status);
        return (
          <li key={status} className="relative">
            <span
              className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full border-2 ${
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {reached ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </span>
            <p className={`text-sm font-medium ${isCurrent ? "text-primary" : reached ? "text-foreground" : "text-muted-foreground"}`}>
              {STATUS_LABEL[status]}
            </p>
            {ev && (
              <p className="text-xs text-muted-foreground">
                {formatDateTime(ev.created_at)}
                {ev.comment ? ` — ${ev.comment}` : ""}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
