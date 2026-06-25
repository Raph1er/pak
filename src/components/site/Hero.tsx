import { ArrowRight, ShieldCheck, Truck, Sparkles, TrendingUp, Leaf, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-farm.jpg";
import kitCoutureImg from "@/assets/Machine-a-coudre.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Pattern décoratif */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="grain opacity-30" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-20">
        {/* Contenu gauche */}
        <div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Kiva: Plateforme d'accompagnement agricole & artisanal
          </span>
          
          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-balance">
            Cultiver, créer,{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
              prospérer.
            </span>
          </h1>
          
          <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-muted-foreground text-balance leading-relaxed">
            KIVA équipe les agriculteurs et artisans avec des packs complets — semences, outils,
            machines et accompagnement — livrés, installés et suivis sur le terrain.
          </p>
          
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-6 sm:px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
              <Link to="/packs">
                Découvrir les packs <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8" asChild>
              <Link to="/kits">Voir les kits artisanaux</Link>
            </Button>
          </div>

          {/* Stats rapides */}
          <dl className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-border/60 pt-6 sm:pt-8">
            {[
              { icon: ShieldCheck, label: "Paiement sécurisé" },
              { icon: Truck, label: "Livraison & installation" },
              { icon: Sparkles, label: "Suivi terrain" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <f.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="hidden xs:inline">{f.label}</span>
              </div>
            ))}
          </dl>
        </div>

        {/* Images droite */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50" />
            <div className="grid gap-4 sm:grid-cols-2 relative">
              {/* Card 1 - Agricole */}
              <div className="group overflow-hidden rounded-2xl sm:rounded-[2rem] border border-border/60 bg-card shadow-elevated hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img
                    src={heroImg}
                    alt="Agriculteur tenant des semences au-dessus d'un champ"
                    width={1920}
                    height={1280}
                    className="h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm border-0 text-white">
                    <Leaf className="h-3 w-3 mr-1" />
                    Pack agricole
                  </Badge>
                </div>
                <div className="border-t border-border/60 bg-gradient-to-br from-background to-secondary/10 p-4 sm:p-5 backdrop-blur">
                  <p className="font-display text-base sm:text-lg font-semibold">Maraîchage 1ha</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-accent" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">4/6</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">Étape 4/6 · Préparation du terrain</p>
                </div>
              </div>

              {/* Card 2 - Artisanal */}
              <div className="group overflow-hidden rounded-2xl sm:rounded-[2rem] border border-border/60 bg-card shadow-elevated hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img
                    src={kitCoutureImg}
                    alt="Machine à coudre pour kit artisanal"
                    width={1200}
                    height={1600}
                    className="h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm border-0 text-accent-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Kit artisanal
                  </Badge>
                </div>
                <div className="border-t border-border/60 bg-gradient-to-br from-background to-secondary/10 p-4 sm:p-5 backdrop-blur">
                  <p className="font-display text-base sm:text-lg font-semibold">Machine à coudre</p>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Lancez une activité couture durable et immédiatement opérationnelle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Composant Badge local (si non importé)
const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
    {children}
  </span>
);