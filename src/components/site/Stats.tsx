import { Users, Package, Star, MapPin, TrendingUp, Award } from "lucide-react";

const items = [
  { value: "1 240+", label: "Membres associatifs", icon: Users },
  { value: "38", label: "Packs & kits actifs", icon: Package },
  { value: "94%", label: "Taux de satisfaction", icon: Star },
  { value: "12", label: "Régions couvertes", icon: MapPin },
];

export function Stats() {
  return (
    <section className="relative border-y border-border/60 bg-gradient-to-b from-card to-background overflow-hidden">
      {/* Décoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 py-10 sm:py-14 md:grid-cols-4">
          {items.map((it, index) => (
            <div 
              key={it.label} 
              className="group relative text-center transition-all duration-300 hover:scale-105"
            >
              {/* Cercle décoratif */}
              <div className="absolute -inset-4 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              
              <div className="relative flex flex-col items-center">
                <div className="rounded-full bg-primary/10 p-2.5 mb-3 group-hover:bg-primary/20 transition-colors">
                  <it.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  {it.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
                  {it.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}