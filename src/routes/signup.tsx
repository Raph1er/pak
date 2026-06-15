import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  phone: z.string().trim().min(6, "Téléphone requis").max(30),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Au moins 6 caractères").max(72),
});

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Créer un compte — KIVA" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const sendVerificationEmail = async (email: string, token: string, firstName: string) => {
    // Appel à votre API d'envoi d'email (Edge Function, Resend, etc.)
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, firstName })
    });
    
    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi de l'email");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    
    setLoading(true);

const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await supabase.auth.signOut();
}
    
    // 1. Créer l'utilisateur dans Supabase Auth (sans auto-confirmation)
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone,
        },
      },
    });
    
    if (error) {
      setLoading(false);
      toast.error(
        error.message.includes("already")
          ? "Email déjà utilisé"
          : error.message
      );
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      toast.error("Impossible de récupérer l'utilisateur créé");
      return;
    }

    // 2. Créer un token de vérification
const token = crypto.randomUUID(); 
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 3. Insérer dans email_verifications
    const { error: verificationError } = await supabase
      .from("email_verifications")
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
        verified: false,
      });

    if (verificationError) {
      setLoading(false);
      toast.error("Erreur lors de la création du token de vérification.");
      console.error(verificationError);
      return;
    }

    // 4. Envoyer l'email de vérification
    try {
      await sendVerificationEmail(parsed.data.email, token, parsed.data.firstName);
      toast.success("Compte créé ! Vérifiez vos emails pour confirmer votre adresse.");
      navigate({ to: "/verify-pending", search: { email: parsed.data.email } });
    } catch (emailError) {
      console.error("Erreur d'envoi d'email:", emailError);
      toast.warning("Compte créé mais l'email n'a pas pu être envoyé. Contactez le support.");
      navigate({ to: "/login" });
    }
    
    setLoading(false);
  };

  return (
    <AuthShell
      title="Créer un compte."
      subtitle="Quelques secondes pour rejoindre KIVA."
      footer={
        <span>
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-medium text-foreground hover:text-primary">Se connecter</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" required value={form.firstName} onChange={set("firstName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" required value={form.lastName} onChange={set("lastName")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" required value={form.phone} onChange={set("phone")} placeholder="+229 01 56 90 41 09" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={set("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required value={form.password} onChange={set("password")} />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer mon compte
        </Button>
        <p className="text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos conditions d'utilisation.
        </p>
      </form>
    </AuthShell>
  );
}