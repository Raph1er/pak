import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { isValidPhone, normalizePhone } from "@/lib/phone";

const schema = z.object({
    fullName: z.string().trim().min(3, "Nom requis"),
    phone: z.string().trim().refine(isValidPhone, {
        message: "Numéro de téléphone invalide. Format: 01 56 90 41 09",
    }),
    subject: z.string().trim().min(5, "Sujet requis"),
    message: z.string().trim().min(5, "Message : 5 caractères obligatoires").max(2000),
    productTitle: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
    head: () => ({ meta: [{ title: "Contact — KIVA" }] }),
    component: ContactPage,
});

function ContactPage() {
    const { user, isAuthenticated, isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [productTitle, setProductTitle] = useState<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [existingQuestionsCount, setExistingQuestionsCount] = useState<number | null>(null);

    useEffect(() => {
        if (!loading && isAdmin) {
            navigate({ to: "/admin" });
            return;
        }

        if (isAuthenticated && user) {
            // Charger les infos depuis le profil
            const fetchUserProfile = async () => {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("first_name, last_name, phone")
                    .eq("id", user.id)
                    .single();

                if (!error && data) {
                    setFullName(`${data.first_name || ""} ${data.last_name || ""}`.trim());
                    setPhone(data.phone || "");
                } else {
                    // Fallback aux métadonnées
                    setFullName((user.user_metadata?.first_name as string) || "");
                    setPhone((user.user_metadata?.phone as string) || "");
                }
            };
            fetchUserProfile();
        }

        const params = new URLSearchParams(window.location.search);
        const product = params.get("product");
        const initialSubject = params.get("subject");

        if (product) {
            setProductTitle(product);
        }

        if (initialSubject) {
            setSubject(initialSubject);
        } else if (product) {
            setSubject(`Question sur ${product}`);
        }
    }, [isAuthenticated, isAdmin, loading, navigate, user]);

    // If productTitle and authenticated, fetch how many questions this user already sent for that product
    useEffect(() => {
        let active = true;
        if (!user || !productTitle) {
            setExistingQuestionsCount(null);
            return;
        }

        const fetchCount = async () => {
            const res = await supabase
                .from("contact_messages")
                .select("id", { head: true, count: "exact" })
                .eq("user_id", user.id)
                .eq("product_title", productTitle);
            if (!active) return;
            setExistingQuestionsCount(res.count ?? 0);
        };

        void fetchCount();

        return () => {
            active = false;
        };
    }, [user, productTitle]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = schema.safeParse({
            fullName,
            phone,
            subject,
            message,
            productTitle,
        });

        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
            return;
        }

        setSubmitting(true);
        // Enforce max 3 questions per product for authenticated users
        if (user && parsed.data.productTitle) {
            const res = await supabase
                .from("contact_messages")
                .select("id", { head: true, count: "exact" })
                .eq("user_id", user.id)
                .eq("product_title", parsed.data.productTitle);
            if (res.error) {
                setSubmitting(false);
                toast.error("Impossible de vérifier le nombre de questions : " + res.error.message);
                return;
            }
            const count = res.count ?? 0;
            if (count >= 3) {
                setSubmitting(false);
                toast.error("Vous avez atteint la limite de 3 questions pour ce produit.");
                return;
            }
        }
        const payload = {
            user_id: user?.id ?? undefined,
            email: user?.email ?? "", // On garde l'email fictif pour la BD
            full_name: parsed.data.fullName,
            subject: parsed.data.subject,
            message: parsed.data.message,
            product_title: parsed.data.productTitle ?? undefined,
            phone: normalizePhone(parsed.data.phone), // Nouveau champ
        };
        const { error } = await ((supabase as any).from("contact_messages") as any).insert(payload);
        setSubmitting(false);

        if (error) {
            toast.error("Impossible d'envoyer votre message : " + error.message);
            return;
        }

        setSent(true);
        toast.success("Votre message a bien été envoyé. Nous revenons vers vous rapidement.");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="mx-auto max-w-4xl px-6 py-12">
                <Button asChild variant="ghost" size="sm" className="-ml-2">
                    <Link to="/"> <ArrowLeft className="h-4 w-4" /> Retour à l'accueil</Link>
                </Button>

                <div className="mt-6 rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">Contact</p>
                            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Posez votre question</h1>
                            <p className="mt-2 text-muted-foreground">
                                Nous avons bien reçu votre demande. Expliquez votre besoin et nous vous répondons rapidement.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-primary/10 p-4 text-sm text-primary">
                            <p className="font-semibold">Support professionnel</p>
                            <p>Votre message est transmis directement à l’équipe KIVA.</p>
                        </div>
                    </div>

                    {sent ? (
                        <div className="mt-10 rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
                            <p className="text-lg font-semibold text-foreground">Merci !</p>
                            <p className="mt-2 text-muted-foreground">
                                Votre message a bien été envoyé. Nous vous contacterons très prochainement.
                            </p>
                            <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
                                Retour à l'accueil
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                            {productTitle ? (
                                <div className="rounded-3xl border border-border/60 bg-background/80 p-5">
                                    <p className="text-sm text-muted-foreground">Produit lié</p>
                                    <p className="mt-1 font-medium">{productTitle}</p>
                                </div>
                            ) : null}

                                                 <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nom complet *</Label>
                                    <Input 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        placeholder="Jean Dupont"
                                        readOnly={isAuthenticated}
                                        className={isAuthenticated ? "bg-muted cursor-not-allowed" : ""}
                                    />
                                    {isAuthenticated && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            🔒 Information de votre profil
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Numéro de téléphone *</Label>
                                    <Input 
                                        type="tel"
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        placeholder="01 56 90 41 09"
                                        readOnly={isAuthenticated}
                                        className={isAuthenticated ? "bg-muted cursor-not-allowed" : ""}
                                    />
                                    {isAuthenticated && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            🔒 Information de votre profil
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Sujet *</Label>
                                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de votre question" />
                            </div>

                            <div className="space-y-2">
                                <Label>Message *</Label>
                                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Expliquez votre demande, votre question ou votre besoin..." />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer ma question"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
