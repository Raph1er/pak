import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Mot de passe oublié — KIVA" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [firstName, setFirstName] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isValidPhone(phone)) {
      toast.error("Numéro de téléphone invalide");
      return;
    }
    
    setLoading(true);

    const normalizedPhone = normalizePhone(phone);
    
    // ✅ Utiliser la fonction RPC qui contourne RLS
    const { data, error } = await supabase.rpc('check_phone_exists' as any, {
      p_phone: normalizedPhone
    });
    
    setLoading(false);
    
    if (error) {
      console.error("Erreur RPC:", error);
      toast.error("Erreur lors de la vérification");
      return;
    }

    // ✅ Caster le résultat pour TypeScript
    const result = data as any;

    if (!result.exists) {
      toast.error("Aucun compte trouvé avec ce numéro");
      return;
    }
    
    setFirstName(result.first_name);
    setFound(true);
    toast.success(`Compte trouvé : ${result.first_name}`);
  };

  return (
    <AuthShell
      title="Mot de passe oublié ?"
      subtitle="Entrez votre numéro de téléphone pour vérifier votre compte."
      footer={<Link to="/login" className="hover:text-foreground">← Retour à la connexion</Link>}
    >
      {found ? (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm space-y-3">
          <p className="font-semibold text-green-600">✓ Compte trouvé !</p>
          <p>
            Bonjour <strong>{firstName}</strong>, pour des raisons de sécurité, la réinitialisation du mot de passe doit être effectuée par notre équipe.
          </p>
          <p className="text-muted-foreground">
            Contactez-nous à <strong>support@kiva.app</strong> ou appelez le <strong>+229 XX XX XX XX</strong> en précisant votre numéro de téléphone.
          </p>
          <Button 
            asChild 
            variant="outline" 
            className="w-full rounded-full mt-4"
          >
            <Link to="/login">Retour à la connexion</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input 
              id="phone" 
              type="tel" 
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="01 56 90 41 09"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vérifier mon compte
          </Button>
        </form>
      )}
    </AuthShell>
  );
}