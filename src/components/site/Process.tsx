import { ClipboardList, MapPin, Wrench, BadgeCheck, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const steps = [
  { 
    icon: ClipboardList, 
    title: "Demande", 
    desc: "Choisissez un pack et soumettez votre demande en quelques minutes."
  },
  { 
    icon: MapPin, 
    title: "Visite terrain", 
    desc: "Notre équipe se déplace, évalue et produit un rapport détaillé."
  },
  { 
    icon: Wrench, 
    title: "Installation", 
    desc: "Livraison, installation et formation sur l'utilisation du matériel."
  },
  { 
    icon: BadgeCheck, 
    title: "Suivi & attestation", 
    desc: "Suivi continu, facture et attestation officielle générées."
  },
];

export function Process() {
  return (
    <section className="bg-secondary/20 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Comment ça marche</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            De la demande à l'attestation, <br className="hidden sm:inline" />sans friction.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Un processus clair et transparent en 4 étapes pour vous accompagner de A à Z.
          </p>
        </div>
        
        {/* Steps */}
        <ol className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li 
              key={s.title} 
              className="group relative rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="absolute right-4 top-4 font-display text-4xl font-bold text-muted/30">
                0{i + 1}
              </span>
              <s.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
        
        {/* CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <Button variant="outline" className="rounded-full px-6 sm:px-8" asChild>
            <Link to="/packs">
              Commencer maintenant
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}