import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail, isValidPhone } from "@/lib/phone";
import { getPostAuthDestination } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const schema = z.object({
  phone: z.string().trim().refine(isValidPhone, {
    message: "Numéro de téléphone invalide. Format: 01 56 90 41 09",
  }),
  password: z.string().min(6, { message: "Au moins 6 caractères" }).max(72),
});

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — KIVA" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ phone, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    
    // Formater le téléphone en email fictif
    const fakeEmail = phoneToEmail(parsed.data.phone);
    
    // Connexion Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: parsed.data.password,
    });
    
    if (error) {
      setLoading(false);
      toast.error(
        error.message === "Invalid login credentials" 
          ? "Numéro de téléphone ou mot de passe incorrect" 
          : error.message
      );
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      toast.error("Impossible de récupérer l'utilisateur");
      return;
    }

    // Pas besoin de vérifier email_verified car c'est toujours true
    setLoading(false);
    toast.success("Connexion réussie");
    const destination = await getPostAuthDestination(userId);
    navigate({ to: destination, replace: true });
  };

  return (
    <AuthShell
      title="Bon retour."
      subtitle="Connectez-vous pour suivre vos demandes et paiements."
      footer={
        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="hover:text-foreground">Mot de passe oublié ?</Link>
          <span>
            Pas de compte ?{" "}
            <Link to="/signup" className="font-medium text-foreground hover:text-primary">Créer un compte</Link>
          </span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <Input 
            id="phone" 
            type="tel" 
            autoComplete="tel"
            required 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder=" 01 56 90 41 09" 
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            type="password" 
            autoComplete="current-password"
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Se connecter
        </Button>
      </form>
    </AuthShell>
  );
}