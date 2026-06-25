import { ClipboardList, MapPin, Wrench, BadgeCheck, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const steps = [
  { 
    icon: ClipboardList, 
    title: "Demande", 
    desc: "Choisissez un pack et soumettez votre demande en quelques minutes.", 
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-500"
  },
  { 
    icon: MapPin, 
    title: "Visite terrain", 
    desc: "Notre équipe se déplace, évalue et produit un rapport détaillé.", 
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500"
  },
  { 
    icon: Wrench, 
    title: "Installation", 
    desc: "Livraison, installation et formation sur l'utilisation du matériel.", 
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-500"
  },
  { 
    icon: BadgeCheck, 
    title: "Suivi & attestation", 
    desc: "Suivi continu, facture et attestation officielle générées.", 
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-500"
  },
];

export function Process() {
  return (
    <section className="relative bg-gradient-to-b from-secondary/30 via-background to-background overflow-hidden">
      {/* Décoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="grain opacity-20" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <span className="h-px w-8 bg-primary/30" />
            Comment ça marche
          </div>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            De la demande à l'attestation, <br className="hidden sm:inline" />sans friction.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Un processus clair et transparent en 4 étapes pour vous accompagner de A à Z.
          </p>
        </div>
        
        <ol className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li 
              key={s.title} 
              className={`group relative rounded-2xl sm:rounded-3xl border ${s.border} bg-gradient-to-br ${s.color} p-5 sm:p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated`}
            >
              <span className="absolute right-4 sm:right-5 top-4 sm:top-5 font-display text-4xl sm:text-5xl font-bold text-muted-foreground/20 group-hover:text-muted-foreground/30 transition-colors">
                0{i + 1}
              </span>
              <div className={`rounded-xl ${s.border} bg-background/50 p-2.5 w-fit group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <h3 className="mt-4 sm:mt-6 font-display text-lg sm:text-xl font-semibold">{s.title}</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
        
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