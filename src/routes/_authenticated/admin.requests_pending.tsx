import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Package, Check, Calendar, MapPin, Phone, User, Eye, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { STATUS_COLOR, STATUS_LABEL, formatDate, formatDateTime, type RequestRow } from "@/lib/requests";
import { formatXOF, type ProductRow } from "@/lib/catalog";
import { Separator } from "@/components/ui/separator";

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
            const { data: requestsData, error: requestsError } = await supabase
                .from("requests")
                .select("*, products(*)")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (requestsError) throw requestsError;

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
        <main className="min-h-screen bg-background px-4 py-6 md:px-6 md:py-12">
            {/* Header avec retour */}
            <div className="mx-auto max-w-7xl">
                <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
                    <Link to="/admin">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Retour
                    </Link>
                </Button>

                {/* En-tête */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Demandes non traitées</p>
                        <h1 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                            À analyser
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:mt-2">
                            Examinez les nouvelles demandes
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2">
                            {totalPending} demande{totalPending !== 1 ? "s" : ""}
                        </Badge>
                    </div>
                </div>

                {/* Contenu */}
                {requests === null ? (
                    <div className="grid place-items-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : totalPending === 0 ? (
                    <Card className="mt-8 border-border/60">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Check className="mx-auto h-10 w-10 text-primary" />
                            <p className="mt-4 text-lg font-semibold text-foreground">Aucune demande à analyser</p>
                            <p className="mt-2 text-sm">Toutes les demandes ont été traitées.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
                        {requests.map((r) => {
                            const profile = (r as any).profiles;
                            const fullName = profile
                                ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                                : "Client";

                            return (
                                <Card key={r.id} className="border-border/60 shadow-sm overflow-hidden">
                                    <CardContent className="p-4 md:p-6">
                                        {/* En-tête de la carte */}
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge className={`${STATUS_COLOR[r.status]} text-xs sm:text-sm`}>
                                                    {STATUS_LABEL[r.status]}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                   
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDateTime(r.created_at)}
                                            </span>
                                        </div>

                                        {/* Infos produit */}
                                        <div className="mb-4">
                                            <h3 className="font-display text-lg sm:text-xl font-semibold break-words">
                                                {r.products?.title ?? "Produit supprimé"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Quantité : {r.quantity}
                                            </p>
                                        </div>

                                        {/* Prix */}
                                        {r.products && (
                                            <div className="mb-4 p-3 bg-primary/5 rounded-xl">
                                                {r.products.price_upfront && r.products.price_monthly ? (
                                                    <div className="flex flex-wrap items-baseline gap-2">
                                                        <span className="font-display text-lg font-semibold text-primary">
                                                            {formatXOF(r.products.price_upfront * r.quantity)}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            acompte
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            • {formatXOF(r.products.price_monthly * r.quantity)}/m
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            × {r.products.duration_months}m
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-display text-lg font-semibold text-primary">
                                                        {formatXOF(r.products.price_xof * r.quantity)}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <Separator className="mb-4" />

                                        {/* Infos client - version mobile friendly */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-primary flex-shrink-0" />
                                                <span className="font-medium">{fullName}</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                {r.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                                        <span className="break-words">{r.phone}</span>
                                                    </div>
                                                )}
                                                {r.desired_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                                        <span>Souhaité le {formatDate(r.desired_date)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {r.delivery_address && (
                                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span className="break-words">{r.delivery_address}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes client */}
                                        {r.notes && (
                                            <div className="mb-4 p-3 bg-muted/30 rounded-xl">
                                                <p className="text-xs font-semibold text-foreground mb-1.5">
                                                    Notes du client :
                                                </p>
                                                <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
                                                    {r.notes}
                                                </p>
                                            </div>
                                        )}

                                        <Separator className="mb-4" />

                                        {/* Actions - empilées sur mobile */}
                                        <div className="flex flex-col sm:flex-row-reverse gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => markAsReviewed(r.id)}
                                                disabled={processing === r.id}
                                                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                                            >
                                                {processing === r.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="mr-2 h-4 w-4" />
                                                )}
                                                Marquer analysée
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                                className="w-full sm:w-auto"
                                            >
                                                <Link 
                                                    to="/admin/clients/$clientId" 
                                                    params={{ clientId: (r as any).profiles?.id || '' }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Voir le client
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}