import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search, Phone, User, Calendar, Users, Package, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ClientWithStats {
    profile: Profile;
    requestCount: number;
    messageCount: number;
    familyMembers: any[];
}

export const Route = createFileRoute("/_authenticated/admin/clients")({
    head: () => ({ meta: [{ title: "Clients — Admin KIVA" }] }),
    component: AdminClientsPage,
});

function AdminClientsPage() {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState<ClientWithStats[] | null>(null);
    const [search, setSearch] = useState("");
    const isClientIndex = typeof window !== "undefined" ? window.location.pathname === "/admin/clients" : false;

    useEffect(() => {
        if (!loading && !isAdmin) navigate({ to: "/dashboard" });
    }, [loading, isAdmin, navigate]);
    const loadClients = async () => {
        setClients(null);

        try {
            // ÉTAPE 1 : Récupérer TOUS les profiles d'abord
            const { data: allProfiles, error: profilesError } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (profilesError) throw profilesError;
            console.log("📋 Tous les profiles:", allProfiles?.length);

            // ÉTAPE 2 : Récupérer les rôles pour filtrer les admins
            const { data: allRoles, error: rolesError } = await supabase
                .from("user_roles")
                .select("user_id, role");

            if (rolesError) throw rolesError;

            // Identifier les admins
            const adminIds = new Set(
                allRoles?.filter(r => r.role === "admin").map(r => r.user_id) || []
            );

            // Filtrer pour garder uniquement les non-admins (clients)
            const clientProfiles = (allProfiles || []).filter(p => !adminIds.has(p.id));
            const clientIds = clientProfiles.map(p => p.id);

            if (clientIds.length === 0) {
                setClients([]);
                return;
            }

            // ÉTAPE 3 : Récupérer les demandes
            const { data: requests, error: requestsError } = await supabase
                .from("requests")
                .select("user_id");

            if (requestsError) throw requestsError;

            // ÉTAPE 4 : Récupérer les messages
            const { data: messages, error: messagesError } = await supabase
                .from("contact_messages")
                .select("user_id");

            if (messagesError) throw messagesError;

            // ÉTAPE 5 : Récupérer TOUS les membres de famille
            const { data: allFamilyMembers, error: familyError } = await supabase
                .from("family_members")
                .select("*");

            if (familyError) throw familyError;

            // Compter les demandes par user
            const requestCounts = requests?.reduce((acc: Record<string, number>, req: any) => {
                acc[req.user_id] = (acc[req.user_id] || 0) + 1;
                return acc;
            }, {}) || {};

            // Compter les messages par user
            const messageCounts = messages?.reduce((acc: Record<string, number>, msg: any) => {
                if (msg.user_id) {
                    acc[msg.user_id] = (acc[msg.user_id] || 0) + 1;
                }
                return acc;
            }, {}) || {};

            // Grouper les membres par user_id
            const membersByUser = allFamilyMembers?.reduce((acc: Record<string, any[]>, member: any) => {
                if (!acc[member.user_id]) {
                    acc[member.user_id] = [];
                }
                acc[member.user_id].push(member);
                return acc;
            }, {}) || {};


            // Combiner les données
            const clientsData: ClientWithStats[] = clientProfiles.map((profile) => ({
                profile,
                requestCount: requestCounts[profile.id] || 0,
                messageCount: messageCounts[profile.id] || 0,
                familyMembers: membersByUser[profile.id] || [],
            }));

            clientsData.forEach(c => {
             
            });

            setClients(clientsData);
        } catch (error) {

            setClients([]);
        }
    };
    useEffect(() => {
        if (isAdmin && isClientIndex) loadClients();
    }, [isAdmin, isClientIndex]);

    if (loading || !isAdmin) {
        return (
            <div className="grid min-h-screen place-items-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!isClientIndex) {
        return <Outlet />;
    }

    const filtered = (clients ?? []).filter((client) => {
        const q = search.toLowerCase();
        const fullName = `${client.profile.first_name || ""} ${client.profile.last_name || ""}`.toLowerCase();
        return fullName.includes(q) || client.profile.phone?.includes(q);
    });

    return (
        <>
            <main className="mx-auto max-w-7xl px-6 py-12">
                <Button asChild variant="ghost" size="sm" className="-ml-2">
                    <Link to="/admin">
                        <ArrowLeft className="h-4 w-4" />
                        Retour admin
                    </Link>
                </Button>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Gestion</p>
                        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Clients</h1>
                        <p className="mt-2 text-muted-foreground">Liste de tous les utilisateurs avec leurs informations et leurs demandes.</p>
                    </div>
                    <Badge variant="secondary">{filtered.length} clients</Badge>
                </div>

                <div className="mt-8">
                    <div className="mb-6 flex items-center rounded-full border border-input bg-background px-4 py-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Rechercher par nom ou téléphone..."
                            className="border-0 bg-transparent focus-visible:ring-0"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {clients === null ? (
                    <div className="grid place-items-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                        <User className="mx-auto h-10 w-10 text-primary" />
                        <p className="mt-4 text-lg font-semibold text-foreground">Aucun client trouvé.</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-8 space-y-4">
                            {filtered.map((client) => (
                                <div key={client.profile.id} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                                    <Link
                                        to="/admin/clients/$clientId"
                                        params={{ clientId: client.profile.id }}
                                        className="block"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    {client.profile.avatar_url ? (
                                                        <img
                                                            src={client.profile.avatar_url}
                                                            alt={`${client.profile.first_name} ${client.profile.last_name}`}
                                                            className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg font-semibold">
                                                            {client.profile.first_name} {client.profile.last_name}
                                                        </h3>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                            {client.profile.phone && (
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {client.profile.phone}
                                                                </span>
                                                            )}
                                                            {client.profile.department && client.profile.city && (
                                                                <span>• {client.profile.city}, {client.profile.department}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Informations détaillées */}
                                                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                                                    {client.profile.profession && (
                                                        <p><span className="font-medium text-foreground">Profession:</span> {client.profile.profession}</p>
                                                    )}
                                                    {client.profile.address && (
                                                        <p><span className="font-medium text-foreground">Adresse:</span> {client.profile.address}</p>
                                                    )}
                                                    {client.profile.created_at && (
                                                        <p className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Inscrit le {new Date(client.profile.created_at).toLocaleDateString("fr-FR")}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Membres de famille */}
                                                {client.familyMembers.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-border/60">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-primary" />
                                                                Membres associés ({client.familyMembers.length})
                                                            </p>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {client.familyMembers.length}/2
                                                            </Badge>
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {client.familyMembers.map((member) => (
                                                                <div
                                                                    key={member.id}
                                                                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-3 hover:border-primary/30 transition-colors"
                                                                >
                                                                    {member.avatar_url ? (
                                                                        <img
                                                                            src={member.avatar_url}
                                                                            alt={`${member.first_name} ${member.last_name}`}
                                                                            className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                                                            <User className="h-5 w-5 text-primary" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold truncate">
                                                                            {member.first_name} {member.last_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                                {member.relationship}
                                                                            </Badge>
                                                                            {member.phone && (
                                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                    <Phone className="h-2.5 w-2.5" />
                                                                                    {member.phone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {member.department && member.city && (
                                                                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                                                                📍 {member.city}, {member.department}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Badge variant="outline" className="flex items-center gap-1.5">
                                                    <Package className="h-3 w-3" />
                                                    {client.requestCount} demande{client.requestCount !== 1 ? "s" : ""}
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1.5">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {client.messageCount} message{client.messageCount !== 1 ? "s" : ""}
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/5 border-primary/20 text-primary">
                                                    <Users className="h-3 w-3" />
                                                    {client.familyMembers.length} membre{client.familyMembers.length !== 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
            <Outlet />
        </>
    );
}
