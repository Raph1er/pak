import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Package, Check, Calendar, MapPin, Phone, User, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { STATUS_COLOR, STATUS_LABEL, formatDate, formatDateTime, type RequestRow } from "@/lib/requests";
import { formatXOF, type ProductRow } from "@/lib/catalog";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type RequestFull = RequestRow & { products: ProductRow | null };

export const Route = createFileRoute("/_authenticated/admin/requests_pending")({
    head: () => ({ meta: [{ title: "Demandes à analyser — Admin KIVA" }] }),
    component: AdminPendingRequestsPage,
});

function AdminPendingRequestsPage() {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RequestFull[] | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !isAdmin) navigate({ to: "/dashboard" });
    }, [loading, isAdmin, navigate]);

    const loadRequests = async () => {
        setRequests(null);
        try {
            // Charger les demandes avec statut "pending"
            const { data: requestsData, error: requestsError } = await supabase
                .from("requests")
                .select("*, products(*)")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (requestsError) throw requestsError;

            // Charger les profils des clients
            const userIds = Array.from(new Set((requestsData || []).map(r => r.user_id)));
            let profilesMap: Record<string, Profile | null> = {};

            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from("profiles")
                    .select("*")
                    .in("id", userIds);

                (profilesData || []).forEach((p: Profile) => {
                    profilesMap[p.id] = p;
                });
            }

            // Combiner les données
            const combined = (requestsData || []).map(r => ({
                ...r,
                profiles: profilesMap[r.user_id] || null
            })) as (RequestFull & { profiles: Profile | null })[];

            setRequests(combined);
        } catch (error) {
            console.error("Error loading requests:", error);
            toast.error("Impossible de charger les demandes");
            setRequests([]);
        }
    };

    useEffect(() => {
        if (isAdmin) loadRequests();
    }, [isAdmin]);

    const markAsReviewed = async (requestId: string) => {
        setProcessing(requestId);
        try {
            const { error } = await supabase
                .from("requests")
                .update({ status: "reviewing" })
                .eq("id", requestId);

            if (error) throw error;

            toast.success("Demande marquée comme analysée");
            loadRequests();
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error("Impossible de mettre à jour la demande");
        } finally {
            setProcessing(null);
        }
    };

    if (loading || !isAdmin) {
        return (
            <div className="grid min-h-screen place-items-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const totalPending = requests?.length ?? 0;

    return (
        <main className="mx-auto max-w-7xl px-6 py-12">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link to="/admin">
                    <ArrowLeft className="h-4 w-4" />
                    Retour admin
                </Link>
            </Button>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">Demandes non traitées</p>
                    <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">À analyser</h1>
                    <p className="mt-2 text-muted-foreground">
                        Examinez les nouvelles demandes et marquez-les comme analysées.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                        {totalPending} demande{totalPending !== 1 ? "s" : ""}
                    </Badge>
                </div>
            </div>

            {requests === null ? (
                <div className="grid place-items-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : totalPending === 0 ? (
                <div className="mt-10 rounded-3xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                    <Check className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 text-lg font-semibold text-foreground">Aucune demande à analyser</p>
                    <p className="mt-2">Toutes les demandes ont été traitées.</p>
                </div>
            ) : (
                <div className="mt-8 space-y-4">
                    {requests.map((r) => {
                        const profile = (r as any).profiles;
                        const fullName = profile
                            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                            : "Client";

                        return (
                            <article key={r.id} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* En-tête avec statut et date */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className={STATUS_COLOR[r.status]}>
                                                {STATUS_LABEL[r.status]}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                #{r.id.slice(0, 8)} · {formatDateTime(r.created_at)}
                                            </span>
                                        </div>

                                        {/* Produit */}
                                        <div>
                                            <h3 className="font-display text-xl font-semibold">
                                                {r.products?.title ?? "Produit supprimé"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Quantité : {r.quantity}
                                            </p>
                                        </div>

                                        {/* Infos client */}
                                        <div className="rounded-xl bg-muted/30 border border-border/40 p-4 space-y-2">
                                            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                                                <User className="h-3 w-3" /> Informations client
                                            </p>
                                            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                                                <span className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-primary" />
                                                    {fullName}
                                                </span>
                                                {r.phone && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-primary" />
                                                        {r.phone}
                                                    </span>
                                                )}
                                                {r.desired_date && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                                        Souhaité le {formatDate(r.desired_date)}
                                                    </span>
                                                )}
                                                {r.delivery_address && (
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                                        {r.delivery_address}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {r.notes && (
                                            <div className="rounded-xl bg-muted/50 border border-border/40 p-4">
                                                <p className="text-xs font-semibold text-foreground mb-2">
                                                    Notes du client :
                                                </p>
                                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                    {r.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-3">
                                        {/* Prix */}
                                        {r.products && (
                                            <div className="text-right">
                                                {r.products.price_upfront && r.products.price_monthly ? (
                                                    <>
                                                        <div className="font-display text-lg font-semibold text-primary">
                                                            {formatXOF(r.products.price_upfront * r.quantity)} acompte
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatXOF(r.products.price_monthly * r.quantity)}/m × {r.products.duration_months}m
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="font-display text-lg font-semibold text-primary">
                                                        {formatXOF(r.products.price_xof * r.quantity)}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Boutons d'action */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => markAsReviewed(r.id)}
                                                disabled={processing === r.id}
                                                className="bg-primary hover:bg-primary/90"
                                            >
                                                {processing === r.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="mr-2 h-4 w-4" />
                                                )}
                                                Marquer comme analysée
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link to="/admin/clients/$clientId" params={{ clientId: (r as any).profiles?.id || '' }}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Voir client
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}