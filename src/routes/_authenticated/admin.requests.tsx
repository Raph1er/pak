import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search, Calendar, MapPin, Phone, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ProductRow } from "@/lib/catalog";
import { formatXOF } from "@/lib/catalog";
import {
  STATUS_COLOR, STATUS_LABEL, formatDate, formatDateTime,
  type RequestRow, type RequestStatus,
} from "@/lib/requests";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type RequestFull = RequestRow & { products: ProductRow | null; profiles: Profile | null };

export const Route = createFileRoute("/_authenticated/admin/requests")({
  head: () => ({ meta: [{ title: "Demandes — Admin KIVA" }] }),
  component: AdminRequestsPage,
});

const STATUSES: RequestStatus[] = [
  "pending", "reviewing", "scheduled", "in_progress", "delivered", "completed", "cancelled",
];

function AdminRequestsPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestFull[] | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [rawResp, setRawResp] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<RequestFull | null>(null);
  const [editStatus, setEditStatus] = useState<RequestStatus>("pending");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);

  const load = async () => {
    setDebugError(null);
    setRawResp(null);
    setRequests(null);
    // Fetch requests with products (avoid selecting profiles(*) which may not be a defined relationship)
    const res = await supabase
      .from("requests")
      .select("*, products(*)")
      .order("created_at", { ascending: false });
    setRawResp({ requests_res: res });
    if (res.error) {
      console.error("Supabase error when loading requests (with products):", res.error);
      setDebugError(res.error.message);
      // fallback: try loading requests without product join to check RLS/permissions
      const fallback = await supabase.from("requests").select("*").order("created_at", { ascending: false });
      setRawResp((r: any) => ({ requests_res: res, fallback }));
      if (fallback.error) {
        console.error("Supabase fallback error when loading requests:", fallback.error);
        setDebugError(`requests: ${res.error.message} | fallback: ${fallback.error.message}`);
        setRequests([]);
        return;
      }
      // fetch profiles for fallback set
      const reqsFallback = (fallback.data ?? []) as any[];
      const userIdsFb = Array.from(new Set(reqsFallback.map((r) => r.user_id).filter(Boolean)));
      let profilesMapFb: Record<string, Profile | null> = {};
      if (userIdsFb.length > 0) {
        const { data: profilesFb, error: profilesErr } = await supabase.from("profiles").select("*").in("id", userIdsFb);
        setRawResp((r: any) => ({ ...r, profiles_fetch: { data: profilesFb, error: profilesErr } }));
        if (profilesErr) {
          console.error("Error fetching profiles (fallback):", profilesErr);
          setDebugError((prev) => (prev ? prev + " | profiles: " + profilesErr.message : profilesErr.message));
        }
        (profilesFb ?? []).forEach((p: Profile) => { profilesMapFb[p.id] = p; });
      }
      setRequests(reqsFallback.map((r) => ({ ...(r as RequestRow), products: null, profiles: profilesMapFb[r.user_id] ?? null })) as RequestFull[]);
      return;
    }

    // Successful requests + products fetch. Now fetch profiles separately and merge.
    const reqs = (res.data ?? []) as any[];
    const userIds = Array.from(new Set(reqs.map((r) => r.user_id).filter(Boolean)));
    let profilesMap: Record<string, Profile | null> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profilesErr } = await supabase.from("profiles").select("*").in("id", userIds);
      setRawResp((r: any) => ({ ...r, profiles_fetch: { data: profiles, error: profilesErr } }));
      if (profilesErr) {
        console.error("Error fetching profiles:", profilesErr);
        setDebugError(profilesErr.message);
      }
      (profiles ?? []).forEach((p: Profile) => { profilesMap[p.id] = p; });
    }
    const combined = reqs.map((r) => ({ ...(r as RequestRow), profiles: profilesMap[r.user_id] ?? null })) as RequestFull[];
    setRequests(combined);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const openEdit = (r: RequestFull) => {
    setEditing(r);
    setEditStatus(r.status);
    setEditNote(r.admin_note ?? "");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("requests")
      .update({ status: editStatus, admin_note: editNote || null })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Demande mise à jour.");
    setEditing(null);
    load();
  };

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = (requests ?? []).filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.products?.title.toLowerCase().includes(q) ||
      r.delivery_address?.toLowerCase().includes(q) ||
      `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4" />Retour admin</Link>
        </Button>

        <div className="mt-4">
          <p className="text-sm font-medium text-primary">Administration</p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Demandes.</h1>
          <p className="mt-2 text-muted-foreground">Suivez, planifiez et mettez à jour le statut des demandes clients.</p>
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (client, produit, adresse…)" className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {debugError && (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            <div className="font-medium">Erreur lors du chargement des demandes :</div>
            <div className="mt-2">{debugError}</div>
            <details className="mt-3 text-xs text-muted-foreground">
              <summary>Détails brut de la requête</summary>
              <pre className="mt-2 max-h-40 overflow-auto">{JSON.stringify(rawResp, null, 2)}</pre>
            </details>
          </div>
        )}

        {!requests ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-16 text-center text-muted-foreground">
            Aucune demande.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {filtered.map((r) => {
              const fullName = `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.trim() || "Client";
              return (
                <article key={r.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                        <span className="text-xs text-muted-foreground">
                          #{r.id.slice(0, 8)} · {formatDateTime(r.created_at)}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold">
                        {r.products?.title ?? "Produit supprimé"}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">× {r.quantity}</span>
                      </h3>
                      <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                        <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {fullName}</span>
                        {r.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {r.phone}</span>}
                        {r.desired_date && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(r.desired_date)}</span>}
                        {r.delivery_address && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {r.delivery_address}</span>}
                      </div>
                      {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {r.products && (
                        <span className="font-display text-lg font-semibold text-primary">
                          {formatXOF(r.products.price_xof * r.quantity)}
                        </span>
                      )}
                      <Button size="sm" onClick={() => openEdit(r)}>Mettre à jour</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mise à jour de la demande</DialogTitle>
            <DialogDescription>{editing?.products?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as RequestStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note pour le client (visible)</Label>
              <Textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={4} maxLength={1000} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
