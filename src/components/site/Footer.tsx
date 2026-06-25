import { Sprout, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="relative border-t border-border/60 bg-gradient-to-b from-card to-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-10 py-12 sm:py-16 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold">KIVA</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Plateforme moderne pour la gestion et le suivi des packs agricoles et kits artisanaux en Afrique.
            </p>
            
            {/* Social links */}
            <div className="mt-5 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="rounded-full border border-border/60 bg-card p-2 text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <p className="text-sm font-semibold text-foreground">Solutions</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <Link to="/packs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Packs agricoles
                </Link>
              </li>
              <li>
                <Link to="/kits" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kits artisanaux
                </Link>
              </li>
              <li>
                <Link to="/process" className="text-muted-foreground hover:text-foreground transition-colors">
                  Notre démarche
                </Link>
              </li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <p className="text-sm font-semibold text-foreground">Compte</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                  Créer un compte
                </Link>
              </li>
              {!isAdmin && (
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 py-5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KIVA. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Conçu avec <Heart className="h-3 w-3 text-red-500 fill-red-500" /> en Afrique
          </p>
        </div>
      </div>
    </footer>
  );
}