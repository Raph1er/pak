import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/verify-pending")({
    component: VerifyPendingPage,
});

function VerifyPendingPage() {
    const search = Route.useSearch() as { email?: string };

    return (
        <AuthShell
            title="Vérifiez votre email"
            subtitle="Un dernier pas avant de commencer"
        >
            <div className="text-center space-y-4">
                <Mail className="h-12 w-12 mx-auto text-primary" />

                <div>
                    <h3 className="text-lg font-semibold">Email de vérification envoyé</h3>
                    <p className="text-muted-foreground mt-2">
                        Nous avons envoyé un lien de vérification à votre adresse email.
                    </p>
                    {search.email && (
                        <p className="text-sm font-medium mt-1">{search.email}</p>
                    )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-left">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium">Instructions :</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-muted-foreground">
                                <li>Ouvrez l'email que vous venez de recevoir</li>
                                <li>Cliquez sur le lien de vérification</li>
                                <li>Connectez-vous à votre compte</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <Button variant="outline" className="w-full" asChild>
                        <Link to="/login">
                            Aller à la page de connexion
                        </Link>
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            retournez à la connexion
                        </Link>
                    </p>
                </div>
            </div>
        </AuthShell>
    );
}