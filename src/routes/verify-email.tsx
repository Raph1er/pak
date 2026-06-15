import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("Token de vérification manquant");
      setVerifying(false);
      return;
    }

const verifyEmail = async () => {
  try {
    console.log("🔍 Début de la vérification du token:", token);

    // 👇 Cast avec 'any' pour contourner TypeScript temporairement
    const { data, error } = await supabase.rpc('verify_email_token' as any, {
      p_token: token
    });

    if (error) {
      console.error("❌ Erreur RPC:", error);
      throw new Error(`Erreur lors de la vérification: ${error.message}`);
    }

    // 👇 Cast le résultat
    const result = data as any;
    console.log("📦 Réponse RPC:", result);

    if (!result.success) {
      throw new Error(result.error || "Échec de la vérification");
    }

    if (result.already_verified) {
      console.log("ℹ️ Token déjà vérifié");
      setSuccess(true);
      setVerifying(false);
      toast.success("Email déjà vérifié !");
      setTimeout(() => navigate({ to: "/login" }), 3000);
      return;
    }

    console.log("🎉 Vérification terminée avec succès !");
    setSuccess(true);
    toast.success("Email vérifié avec succès !");
    
    // Redirection après 3 secondes
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 3000);
    
  } catch (err: any) {
    console.error("💥 Erreur globale:", err);
    setError(err.message || "Une erreur inattendue est survenue");
    toast.error(err.message || "Erreur de vérification");
  } finally {
    setVerifying(false);
  }
};

    verifyEmail();
  }, [navigate]);

  return (
    <AuthShell
      title="Vérification d'email"
      subtitle="Confirmation de votre adresse email"
    >
      <div className="text-center space-y-4">
        {verifying && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p>Vérification en cours...</p>
          </>
        )}
        
        {success && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Email vérifié !</h3>
              <p className="text-muted-foreground mt-2">
                Votre adresse email a été confirmée avec succès.
                Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          </>
        )}
        
        {error && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <div>
              <h3 className="text-lg font-semibold">Erreur de vérification</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button 
                onClick={() => navigate({ to: "/login" })}
                className="mt-4"
              >
                Retour à la connexion
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}