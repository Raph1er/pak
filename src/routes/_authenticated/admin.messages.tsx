import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Mail, Check, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { emailToPhone } from "@/lib/email-to-phone";

type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/messages")({
    head: () => ({ meta: [{ title: "Messages — Admin KIVA" }] }),
    component: AdminMessagesPage,
});

function AdminMessagesPage() {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ContactMessage[] | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) navigate({ to: "/dashboard" });
    }, [loading, isAdmin, navigate]);

    const loadMessages = async () => {
        setMessages(null);
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .eq("is_seen", false)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Impossible de charger les messages : " + error.message);
            setMessages([]);
            return;
        }

        setMessages(data ?? []);
    };

    useEffect(() => {
        if (isAdmin) loadMessages();
    }, [isAdmin]);

    const groupedMessages = useMemo(() => {
        if (!messages) return {} as Record<string, ContactMessage[]>;
        return messages.reduce((acc, message) => {
            const key = message.product_title || "Questions générales";
            if (!acc[key]) acc[key] = [];
            acc[key].push(message);
            return acc;
        }, {} as Record<string, ContactMessage[]>);
    }, [messages]);

    const markAsRead = async (id: string) => {
        setProcessing(true);
        const { error } = await supabase
            .from("contact_messages")
            .update({ is_seen: true })
            .eq("id", id);

        setProcessing(false);
        if (error) {
            toast.error("Impossible de marquer comme lu : " + error.message);
            return;
        }
        toast.success("Message marqué comme lu.");
        loadMessages();
    };

    const markAllAsRead = async () => {
        setProcessing(true);
        const { error } = await supabase
            .from("contact_messages")
            .update({ is_seen: true })
            .eq("is_seen", false);
        setProcessing(false);
        if (error) {
            toast.error("Impossible de marquer tous les messages comme lus : " + error.message);
            return;
        }
        toast.success("Tous les messages ont été marqués comme lus.");
        loadMessages();
    };

    if (loading || !isAdmin) {
        return (
            <div className="grid min-h-screen place-items-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const totalUnread = messages?.length ?? 0;

    return (
        <main className="mx-auto max-w-7xl px-6 py-12">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link to="/admin"><ArrowLeft className="h-4 w-4" />Retour admin</Link>
            </Button>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">Messages non lus</p>
                    <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Questions clients</h1>
                    <p className="mt-2 text-muted-foreground">Regroupez les questions par produit et traitez-les dans l’ordre.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary">{totalUnread} non lus</Badge>
                    <Button variant="outline" onClick={markAllAsRead} disabled={processing || totalUnread === 0}>
                        <Check className="mr-2 h-4 w-4" /> Tout marquer comme lu
                    </Button>
                </div>
            </div>

            {messages === null ? (
                <div className="grid place-items-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : totalUnread === 0 ? (
                <div className="mt-10 rounded-3xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                    <Mail className="mx-auto h-10 w-10 text-primary" />
                    <p className="mt-4 text-lg font-semibold text-foreground">Aucun message non lu.</p>
                    <p className="mt-2">Toutes les questions ont été traitées.</p>
                </div>
            ) : (
                <div className="mt-8 space-y-6">
                    {Object.entries(groupedMessages).map(([productTitle, group]) => (
                        <section key={productTitle} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{productTitle}</h2>
                                    <p className="text-sm text-muted-foreground">{group.length} question{group.length > 1 ? "s" : ""} non lue{group.length > 1 ? "s" : ""}</p>
                                </div>
                                <Badge variant="secondary">{group.length}</Badge>
                            </div>
                            <div className="mt-6 space-y-4">
                                {group.map((message) => (
                                    <article key={message.id} className="rounded-3xl border border-border/60 bg-background/80 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{message.full_name}</span>
                                                    <span>·</span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {message.phone || emailToPhone(message.email)}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{new Date(message.created_at).toLocaleString()}</span>
                                                </div>
                                                <h3 className="mt-3 font-medium">{message.subject}</h3>
                                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{message.message}</p>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => markAsRead(message.id)} disabled={processing}>
                                                Marquer lu
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
