import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, Package, Calendar, MapPin, ClipboardList, Plus } from "lucide-react";
import { RequestTimeline } from "@/components/requests/RequestTimeline";
import { formatXOF, type ProductRow } from "@/lib/catalog";
import {
  STATUS_COLOR,
  STATUS_LABEL,
  formatDate,
  type RequestEventRow,
  type RequestRow,
} from "@/lib/requests";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — KIVA" }] }),
  component: Dashboard,
});

type RequestWithProduct = RequestRow & { products: ProductRow | null };

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const name = (user?.user_metadata?.first_name as string) || user?.email?.split("@")[0] || "vous";
  const [requests, setRequests] = useState<RequestWithProduct[] | null>(null);
  const [eventsByReq, setEventsByReq] = useState<Record<string, RequestEventRow[]>>({});
  const [productCount, setProductCount] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    if (isAdmin) {
      let active = true;
      (async () => {
        const productsRes = await supabase.from("products").select("id");
        const requestsRes = await supabase.from("requests").select("id");
        const pendingRes = await supabase.from("requests").select("id").eq("status", "pending");
        if (!active) return;
        setProductCount((productsRes.data ?? []).length);
        setRequestCount((requestsRes.data ?? []).length);
        setPendingCount((pendingRes.data ?? []).length);
      })();
      return () => { active = false; };
    }

    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("requests")
        .select("*, products(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!active) return;
      const list = (data ?? []) as unknown as RequestWithProduct[];
      setRequests(list);
      if (list.length > 0) {
        const { data: evs } = await supabase
          .from("request_events")
          .select("*")
          .in("request_id", list.map((r) => r.id))
          .order("created_at", { ascending: true });
        if (!active) return;
        const map: Record<string, RequestEventRow[]> = {};
        (evs ?? []).forEach((e) => {
          (map[e.request_id] ??= []).push(e);
        });
        setEventsByReq(map);
      }
    })();
    return () => { active = false; };
  }, [isAdmin, user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">{isAdmin ? "Espace admin" : "Espace personnel"}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Salut, {name}.
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isAdmin ? "Suivez les statistiques et gérez les opérations." : "Suivez vos demandes et leur progression en temps réel."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/admin/catalog"><Package className="h-4 w-4" />Catalogue</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/admin/requests"><ClipboardList className="h-4 w-4" />Demandes</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link to="/admin/catalog" search={{ openForm: "1" }}><Plus className="h-4 w-4" />Ajouter un produit</Link>
                </Button>
              </>
            ) : (
              <Button asChild className="rounded-full">
                <Link to="/packs"><Package className="h-4 w-4" />Parcourir le catalogue</Link>
              </Button>
            )}
          </div>
        </div>

        {isAdmin ? (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                <p className="text-sm font-medium text-muted-foreground">Produits</p>
                <p className="mt-4 text-4xl font-semibold">{productCount ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</p>
                <p className="mt-2 text-sm text-muted-foreground">Packs et kits disponibles</p>
              </article>
              <article className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                <p className="text-sm font-medium text-muted-foreground">Demandes totales</p>
                <p className="mt-4 text-4xl font-semibold">{requestCount ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</p>
                <p className="mt-2 text-sm text-muted-foreground">Toutes les demandes clients</p>
              </article>
              <article className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                <p className="text-sm font-medium text-muted-foreground">Demandes en attente</p>
                <p className="mt-4 text-4xl font-semibold">{pendingCount ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</p>
                <p className="mt-2 text-sm text-muted-foreground">Statut pending</p>
              </article>
            </div>

            <div className="mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
              <h2 className="font-display text-2xl font-semibold">Actions rapides</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Button asChild variant="outline">
                  <Link to="/admin/catalog"><Package className="h-4 w-4" />Catalogue</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/requests"><ClipboardList className="h-4 w-4" />Demandes</Link>
                </Button>
                <Button asChild>
                  <Link to="/admin/catalog" search={{ openForm: "1" }}><Plus className="h-4 w-4" />Ajouter un produit</Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-12 font-display text-2xl font-semibold">Mes demandes</h2>

            {!requests ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 font-medium">Aucune demande pour l'instant.</p>
                <p className="mt-1 text-sm text-muted-foreground">Choisissez un pack ou un kit dans notre catalogue.</p>
                <Button asChild className="mt-6">
                  <Link to="/packs">Voir les packs</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {requests.map((r) => (
                  <article key={r.id} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Demande #{r.id.slice(0, 8)} · créée le {formatDate(r.created_at)}
                          </span>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-semibold">
                          {r.products?.title ?? "Produit"}
                        </h3>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" /> Quantité : <strong className="text-foreground">{r.quantity}</strong>
                          </div>
                          {r.products && (
                            r.products.price_upfront && r.products.price_monthly ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{formatXOF(r.products.price_upfront * r.quantity)} acompte</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatXOF(r.products.price_monthly * r.quantity)}/m × {r.products.duration_months}m
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{formatXOF(r.products.price_xof * r.quantity)}</span>
                              </div>
                            )
                          )}
                          {r.desired_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> {formatDate(r.desired_date)}
                            </div>
                          )}
                          {r.delivery_address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> {r.delivery_address}
                            </div>
                          )}
                        </div>
                        {r.notes && (
                          <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{r.notes}</p>
                        )}
                        {r.admin_note && (
                          <p className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                            <strong>Note de l'équipe :</strong> {r.admin_note}
                          </p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-border/40 bg-background/60 p-5">
                        <p className="mb-4 text-sm font-medium">Suivi</p>
                        <RequestTimeline currentStatus={r.status} events={eventsByReq[r.id] ?? []} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
