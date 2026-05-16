import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero p-10 text-primary-foreground shadow-glow md:p-16">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Créez un compte, choisissez votre pack et laissez-nous nous occuper du reste.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button size="lg" variant="secondary" className="rounded-full px-6" asChild>
              <Link to="/signup">
                Créer un compte <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link to="/packs">Parcourir les packs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
