import { Sprout } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">KIVA</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Plateforme moderne pour la gestion et le suivi des packs agricoles et kits artisanaux.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Solutions</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/packs" className="hover:text-foreground">Packs agricoles</Link></li>
            <li><Link to="/kits" className="hover:text-foreground">Kits artisanaux</Link></li>
            <li><Link to="/process" className="hover:text-foreground">Notre démarche</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Compte</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Connexion</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Créer un compte</Link></li>
            {!isAdmin && <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KIVA. Tous droits réservés.</p>
          <p>Conçu avec soin · Made in Africa</p>
        </div>
      </div>
    </footer>
  );
}
