import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search, Phone, User, Calendar, Users, Package, MessageSquare, ChevronRight } from "lucide-react";
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
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 shrink-0">
                        <Link to="/admin">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Retour admin</span>
                        </Link>
                    </Button>
                </div>

                {/* Title Section */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Gestion</p>
                        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">Clients</h1>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                            Liste de tous les utilisateurs avec leurs informations et leurs demandes.
                        </p>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-auto shrink-0">
                        {filtered.length} clients
                    </Badge>
                </div>

                {/* Search */}
                <div className="mt-6 sm:mt-8">
                    <div className="flex items-center rounded-full border border-input bg-background px-3 sm:px-4 py-1.5 sm:py-2">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                            type="text"
                            placeholder="Rechercher par nom ou téléphone..."
                            className="border-0 bg-transparent focus-visible:ring-0 text-sm sm:text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Loading / Empty State */}
                {clients === null ? (
                    <div className="grid place-items-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mt-8 sm:mt-10 rounded-3xl border border-border/60 bg-card p-8 sm:p-12 text-center text-muted-foreground">
                        <User className="mx-auto h-8 sm:h-10 w-8 sm:w-10 text-primary" />
                        <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-foreground">Aucun client trouvé.</p>
                    </div>
                ) : (
                    /* Client Cards */
                    <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                        {filtered.map((client) => (
                            <div 
                                key={client.profile.id} 
                                className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-4 sm:p-6 shadow-soft hover:shadow-md transition-shadow"
                            >
                                <Link
                                    to="/admin/clients/$clientId"
                                    params={{ clientId: client.profile.id }}
                                    className="block"
                                >
                                    <div className="flex flex-col gap-4">
                                        {/* Client Header - Always visible */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {client.profile.avatar_url ? (
                                                    <img
                                                        src={client.profile.avatar_url}
                                                        alt={`${client.profile.first_name} ${client.profile.last_name}`}
                                                        className="h-10 sm:h-12 w-10 sm:w-12 rounded-full object-cover border-2 border-primary/20 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                        <User className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-semibold truncate">
                                                        {client.profile.first_name} {client.profile.last_name}
                                                    </h3>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                                        {client.profile.phone && (
                                                            <span className="flex items-center gap-0.5 sm:gap-1">
                                                                <Phone className="h-3 w-3 shrink-0" />
                                                                <span className="truncate max-w-[120px] sm:max-w-none">{client.profile.phone}</span>
                                                            </span>
                                                        )}
                                                        {client.profile.department && client.profile.city && (
                                                            <>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="truncate">
                                                                    {client.profile.city}, {client.profile.department}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Stats - Mobile friendly */}
                                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                <Badge variant="outline" className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs">
                                                    <Package className="h-3 w-3" />
                                                    {client.requestCount}
                                                </Badge>
                                                <Badge variant="outline" className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {client.messageCount}
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/5 border-primary/20 text-primary">
                                                    <Users className="h-3 w-3" />
                                                    {client.familyMembers.length}
                                                </Badge>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                            </div>
                                        </div>

                                        {/* Expandable Details - Hidden on very small screens, visible on tablet+ */}
                                        <div className="hidden sm:block">
                                            {/* Client Details */}
                                            {(client.profile.profession || client.profile.address || client.profile.created_at) && (
                                                <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground border-t border-border/40 pt-3">
                                                    {client.profile.profession && (
                                                        <p><span className="font-medium text-foreground">Profession:</span> {client.profile.profession}</p>
                                                    )}
                                                    {client.profile.address && (
                                                        <p><span className="font-medium text-foreground">Adresse:</span> {client.profile.address}</p>
                                                    )}
                                                    {client.profile.created_at && (
                                                        <p className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 shrink-0" />
                                                            <span>Inscrit le {new Date(client.profile.created_at).toLocaleDateString("fr-FR")}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Family Members */}
                                            {client.familyMembers.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-border/60">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-primary shrink-0" />
                                                            Membres associés ({client.familyMembers.length})
                                                        </p>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {client.familyMembers.length}/2
                                                        </Badge>
                                                    </div>
                                                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                                                        {client.familyMembers.map((member) => (
                                                            <div
                                                                key={member.id}
                                                                className="flex items-center gap-3 rounded-xl border border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-3 hover:border-primary/30 transition-colors"
                                                            >
                                                                {member.avatar_url ? (
                                                                    <img
                                                                        src={member.avatar_url}
                                                                        alt={`${member.first_name} ${member.last_name}`}
                                                                        className="h-10 sm:h-12 w-10 sm:w-12 rounded-full object-cover border-2 border-primary/20 shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 shrink-0">
                                                                        <User className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate">
                                                                        {member.first_name} {member.last_name}
                                                                    </p>
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                            {member.relationship}
                                                                        </Badge>
                                                                        {member.phone && (
                                                                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                                                                <Phone className="h-2.5 w-2.5 shrink-0" />
                                                                                <span className="truncate max-w-[80px] sm:max-w-none">{member.phone}</span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {member.department && member.city && (
                                                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
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

                                        {/* Mobile quick info */}
                                        <div className="flex flex-wrap items-center gap-2 sm:hidden pt-2 border-t border-border/40">
                                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                                <Package className="h-3 w-3" />
                                                {client.requestCount} demande{client.requestCount !== 1 ? "s" : ""}
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                                <MessageSquare className="h-3 w-3" />
                                                {client.messageCount} message{client.messageCount !== 1 ? "s" : ""}
                                            </Badge>
                                            {client.profile.profession && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {client.profile.profession.length > 20 ? client.profile.profession.substring(0, 20) + '...' : client.profile.profession}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Mobile - Show first family member if exists */}
                                        {client.familyMembers.length > 0 && (
                                            <div className="sm:hidden pt-2 border-t border-border/40">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Users className="h-3 w-3 shrink-0 text-primary" />
                                                    <span className="font-medium text-foreground">{client.familyMembers.length} membre{client.familyMembers.length !== 1 ? "s" : ""}</span>
                                                    <span className="truncate">
                                                        : {client.familyMembers[0].first_name} {client.familyMembers[0].last_name}
                                                        {client.familyMembers.length > 1 && ` +${client.familyMembers.length - 1} autre${client.familyMembers.length > 2 ? "s" : ""}`}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Outlet />
        </>
    );
}