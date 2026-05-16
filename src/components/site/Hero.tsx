import { ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-farm.jpg";
import kitCoutureImg from "@/assets/Machine-a-coudre.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grain opacity-60" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-24">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Kiva: La plateforme d'accompagnement agricole & artisanal
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
            Cultiver, créer,{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">prospérer.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
            KIVA équipe les agriculteurs et artisans avec des packs complets — semences, outils,
            machines et accompagnement — livrés, installés et suivis sur le terrain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-6" asChild>
              <Link to="/packs">
                Découvrir les packs <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
              <Link to="/kits">Voir les kits artisanaux</Link>
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
            {[
              { icon: ShieldCheck, label: "Paiement sécurisé" },
              { icon: Truck, label: "Livraison & installation" },
              { icon: Sparkles, label: "Suivi terrain" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <f.icon className="h-4 w-4 text-primary" />
                <span>{f.label}</span>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-warm opacity-20 blur-2xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-elevated">
                <img
                  src={heroImg}
                  alt="Agriculteur tenant des semences au-dessus d'un champ"
                  width={1920}
                  height={1280}
                  className="h-[320px] w-full object-cover sm:h-[360px] md:h-[520px]"
                />
                <div className="border-t border-border/60 bg-background/90 p-5 backdrop-blur">
                  <div className="inline-flex items-center rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-foreground shadow-soft">
                    Pack agricole
                  </div>
                  <p className="mt-3 font-display text-lg">Maraîchage 1ha</p>
                  <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 rounded-full bg-gradient-hero" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Étape 4/6 · Préparation</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-elevated">
                <img
                  src={kitCoutureImg}
                  alt="Machine à coudre pour kit artisanal"
                  width={1200}
                  height={1600}
                  className="h-[320px] w-full object-cover sm:h-[360px] md:h-[520px]"
                />
                <div className="border-t border-border/60 bg-background/90 p-5 backdrop-blur">
                  <div className="inline-flex items-center rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-foreground shadow-soft">
                    Kit artisanal
                  </div>
                  <p className="mt-3 font-display text-lg">Machine à coudre</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Un kit pensé pour lancer une activité couture propre, durable et immédiatement opérationnelle.
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
