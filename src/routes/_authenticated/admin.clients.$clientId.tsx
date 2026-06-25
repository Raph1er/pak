import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Phone, Calendar, User, Package, MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/integrations/supabase/types";
import { STATUS_COLOR, STATUS_LABEL, formatDate, formatDateTime, type RequestRow, type RequestStatus } from "@/lib/requests";
import { formatXOF, type ProductRow } from "@/lib/catalog";
import { ImageModal } from "@/components/ui/image-modal";
import { emailToPhone } from "@/lib/email-to-phone";

// Composant pour l'avatar cliquable
function ClickableAvatar({ src, alt, className = "h-20 w-20 rounded-full border-3 border-primary/20 shadow-md" }: { src: string; alt: string; className?: string }) {
    const handleClick = () => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            cursor: pointer;
            backdrop-filter: blur(8px);
        `;
        modal.onclick = () => modal.remove();

        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = `
            max-width: 90vw;
            max-height: 90vh;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            object-fit: contain;
            animation: zoomIn 0.25s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes zoomIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        modal.appendChild(img);
        document.body.appendChild(modal);

        // Nettoyer les styles après fermeture
        modal.addEventListener('click', () => {
            setTimeout(() => style.remove(), 300);
        });
    };

    return (
        <button
            onClick={handleClick}
            className={`${className} hover:scale-105 transition-transform cursor-pointer overflow-hidden`}
        >
            <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
            />
        </button>
    );
}
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];
type RequestFull = RequestRow & { products: ProductRow | null };

export const Route = createFileRoute("/_authenticated/admin/clients/$clientId")({
    head: () => ({ meta: [{ title: "Détail Client — Admin KIVA" }] }),
    component: ClientDetailPage,
});

function ClientDetailPage() {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const { clientId } = Route.useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [requests, setRequests] = useState<RequestFull[] | null>(null);
    const [messages, setMessages] = useState<ContactMessage[] | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [familyMembers, setFamilyMembers] = useState<any[] | null>(null);

    useEffect(() => {
        if (!loading && !isAdmin) navigate({ to: "/dashboard" });
    }, [loading, isAdmin, navigate]);

    const loadClientData = async () => {
        setPageLoading(true);
        try {
            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", clientId)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Fetch requests
            const { data: requestsData, error: requestsError } = await supabase
                .from("requests")
                .select("*, products(*)")
                .eq("user_id", clientId)
                .order("created_at", { ascending: false });

            if (requestsError) throw requestsError;
            setRequests(requestsData as RequestFull[]);

            // Fetch messages
            const { data: messagesData, error: messagesError } = await supabase
                .from("contact_messages")
                .select("*")
                .eq("user_id", clientId)
                .order("created_at", { ascending: false });

            if (messagesError) throw messagesError;
            setMessages(messagesData);

            // Fetch family members
            const { data: familyData, error: familyError } = await supabase
                .from("family_members")
                .select("*")
                .eq("user_id", clientId)
                .order("created_at", { ascending: false });

            if (familyError) throw familyError;
            setFamilyMembers(familyData);
        } catch (error) {
            console.error("Error loading client data:", error);
        } finally {
            setPageLoading(false);
        }

        console.log("Client ID:", clientId);

        const { data: familyData, error: familyError } = await supabase
            .from("family_members")
            .select("*")
            .eq("user_id", clientId);

        console.log("Family Data:", familyData);
        console.log("Family Error:", familyError);
    };

    useEffect(() => {
        if (isAdmin) loadClientData();
    }, [isAdmin, clientId]);

    if (loading || !isAdmin || pageLoading) {
        return (
            <div className="grid min-h-screen place-items-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="grid min-h-screen place-items-center bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground">Client non trouvé</p>
                    <Link to="/admin/clients" className="mt-4 inline-block text-primary hover:underline">
                        Retour aux clients
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-12">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link to="/admin/clients">
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux clients
                </Link>
            </Button>

            {/* Client Header */}
            <div className="mt-8 rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {profile.avatar_url ? (
                        <ClickableAvatar
                            src={profile.avatar_url}
                            alt={`${profile.first_name} ${profile.last_name}`}
                            className="h-28 w-28 rounded-full border-4 border-primary/20 shadow-lg"
                        />
                    ) : (
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/20 shadow-lg">
                            <User className="h-14 w-14 text-primary" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold">
                                {profile.first_name} {profile.last_name}
                            </h1>
                            <Badge variant="secondary" className="text-sm">
                                Client
                            </Badge>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {profile.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{profile.phone}</span>
                                </div>
                            )}

                            {profile.created_at && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Inscrit le {new Date(profile.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                            {profile.profession && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="h-4 w-4 text-primary">💼</span>
                                    <span>{profile.profession}</span>
                                </div>
                            )}
                        </div>

                        {/* Localisation complète */}
                        {(profile.department || profile.city || profile.address) && (
                            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <span>📍</span> Localisation
                                </p>
                                <div className="grid gap-1 text-sm text-muted-foreground">
                                    {profile.department && profile.city && (
                                        <p><span className="font-medium text-foreground">Département/Commune:</span> {profile.department}, {profile.city}</p>
                                    )}
                                    {profile.neighborhood && (
                                        <p><span className="font-medium text-foreground">Quartier:</span> {profile.neighborhood}</p>
                                    )}
                                    {profile.address && (
                                        <p><span className="font-medium text-foreground">Adresse:</span> {profile.address}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                        <Badge variant="secondary" className="flex items-center gap-2 text-sm px-3 py-1.5">
                            <Package className="h-4 w-4" />
                            {requests?.length || 0} demande{(requests?.length || 0) !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-2 text-sm px-3 py-1.5">
                            <MessageSquare className="h-4 w-4" />
                            {messages?.length || 0} message{(messages?.length || 0) !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-2 text-sm px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
                            <Users className="h-4 w-4" />
                            {familyMembers?.length || 0} membre{(familyMembers?.length || 0) !== 1 ? "s" : ""}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            {/* Tabs Content */}
            <Tabs defaultValue="requests" className="mt-8">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="requests" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Demandes ({requests?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Messages ({messages?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="family" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Membres ({familyMembers?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Requests Tab */}
                <TabsContent value="requests" className="mt-6 space-y-4">
                    {requests === null ? (
                        <div className="grid place-items-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="rounded-3xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                            <p className="text-lg font-semibold text-foreground">Aucune demande trouvée</p>
                            <p className="mt-2">Ce client n'a pas encore passé de demande.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => {
                                const productTitle = request.products?.title ?? "Produit non disponible";
                                const requestNotes = (request as any).notes ?? (request as any).message ?? "";
                                const deliveryAddress = request.delivery_address ?? (request as any).address ?? "Aucune adresse fournie";
                                return (
                                    <div key={request.id} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={STATUS_COLOR[request.status] ?? "bg-muted text-muted-foreground"}>
                                                        {STATUS_LABEL[request.status] ?? request.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        #{String(request.id).slice(0, 8)} · {request.created_at ? formatDateTime(request.created_at) : "-"}
                                                    </span>
                                                </div>
                                                <h3 className="font-display text-xl font-semibold">{productTitle}</h3>
                                                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                                    {request.quantity != null && (
                                                        <span>Quantité : {request.quantity}</span>
                                                    )}
                                                    <span>Adresse : {deliveryAddress}</span>
                                                    {request.phone && <span>Téléphone : {request.phone}</span>}
                                                    {request.desired_date && (
                                                        <span>Date souhaitée : {formatDate(request.desired_date)}</span>
                                                    )}
                                                </div>
                                                {requestNotes && (
                                                    <p className="rounded-2xl border border-border/60 bg-muted/50 p-4 text-sm text-muted-foreground">{requestNotes}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="mt-6 space-y-4">
                    {messages === null ? (
                        <div className="grid place-items-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="rounded-3xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                            <p className="text-lg font-semibold text-foreground">Aucun message trouvé</p>
                            <p className="mt-2">Ce client n'a pas encore envoyé de message.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => {
                                const senderName = message.full_name || "Client";
                                const senderPhone = message.phone || emailToPhone(message.email);
                                const body = message.message || "Aucun contenu disponible";
                                return (
                                    <div key={message.id} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-semibold text-lg">{senderName}</span>
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                                                        <Phone className="h-3.5 w-3.5 text-primary" />
                                                        {senderPhone}
                                                    </span>
                                                </div>
                                                {message.subject && (
                                                    <h4 className="font-medium text-foreground">{message.subject}</h4>
                                                )}
                                                {message.created_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Envoyé le {new Date(message.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                                                    </p>
                                                )}
                                                <p className="rounded-2xl border border-border/60 bg-muted/50 p-4 text-sm text-foreground whitespace-pre-line">
                                                    {body}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Family Members Tab */}
                <TabsContent value="family" className="mt-6 space-y-4">
                    {familyMembers === null ? (
                        <div className="grid place-items-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : familyMembers.length === 0 ? (
                        <div className="rounded-3xl border border-border/60 bg-card p-12 text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-semibold text-foreground">Aucun membre associé</p>
                            <p className="mt-2 text-sm text-muted-foreground">Ce client n'a pas encore ajouté de membres à son compte</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Membres associés ({familyMembers.length}/2)
                                </h3>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {familyMembers.map((member) => (
                                    <div key={member.id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft hover:shadow-lg hover:border-primary/30 transition-all">
                                        <div className="flex items-start gap-4">
                                            {member.avatar_url ? (
                                                <ClickableAvatar
                                                    src={member.avatar_url}
                                                    alt={`${member.first_name} ${member.last_name}`}
                                                />
                                            ) : (
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-3 border-primary/20 shadow-md">
                                                    <User className="h-10 w-10 text-primary" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-xl font-bold">
                                                        {member.first_name} {member.last_name}
                                                    </h3>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {member.relationship}
                                                    </Badge>
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    {member.phone && (
                                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                                            <span className="font-medium">{member.phone}</span>
                                                        </p>
                                                    )}
                                                    {member.profession && (
                                                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span className="h-3.5 w-3.5 text-primary">💼</span>
                                                            <span>{member.profession}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Localisation du membre */}
                                                {(member.department || member.city || member.address) && (
                                                    <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                                                        <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                                                            <span>📍</span> Localisation
                                                        </p>
                                                        <div className="space-y-0.5 text-xs text-muted-foreground">
                                                            {member.department && member.city && (
                                                                <p>{member.department}, {member.city}</p>
                                                            )}
                                                            {member.neighborhood && (
                                                                <p>Quartier: {member.neighborhood}</p>
                                                            )}
                                                            {member.address && (
                                                                <p className="truncate">{member.address}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="mt-3 text-xs text-muted-foreground">
                                                    Ajouté le {new Date(member.created_at).toLocaleDateString("fr-FR")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </main>
    );
}
