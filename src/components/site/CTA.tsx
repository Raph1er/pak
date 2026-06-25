import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 sm:pb-20 lg:pb-24">
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 sm:p-12 md:p-16 text-primary-foreground shadow-2xl shadow-primary/20">
        {/* Décoration */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="grain opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_70%)]" />
        </div>
        
        <div className="relative grid gap-6 sm:gap-8 md:grid-cols-2 md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium">
              <Rocket className="h-3.5 w-3.5" />
              Lancez votre projet
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="mt-3 max-w-md text-sm sm:text-base text-primary-foreground/80">
              Créez un compte, choisissez votre pack et laissez-nous nous occuper du reste.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-6 sm:px-8 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all group"
              asChild
            >
              <Link to="/signup">
                Créer un compte 
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full border-white/30 bg-white/10 backdrop-blur-sm px-6 sm:px-8 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground transition-all"
              asChild
            >
              <Link to="/packs">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Parcourir les packs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}