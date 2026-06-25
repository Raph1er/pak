import { Star, Quote } from "lucide-react";
import t1 from "@/assets/testi-1.jpg";
import t2 from "@/assets/testi-2.jpg";
import t3 from "@/assets/testi-3.jpg";

const items = [
  { 
    img: t1, 
    name: "Awa Diallo", 
    role: "Maraîchère, Thiès", 
    quote: "L'accompagnement KIVA m'a permis de doubler ma production en une saison. Le suivi est exceptionnel.",
    rating: 5
  },
  { 
    img: t2, 
    name: "Mamadou Sow", 
    role: "Aviculteur, Kaolack", 
    quote: "Du jour de la demande à l'installation, tout a été fluide. L'équipe est passée plusieurs fois sur place.",
    rating: 5
  },
  { 
    img: t3, 
    name: "Fatou Ndiaye", 
    role: "Couturière, Dakar", 
    quote: "Mon atelier tourne enfin à plein régime. Les machines sont robustes et la formation très claire.",
    rating: 5
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <span className="h-px w-8 bg-primary/30" />
          Témoignages
        </div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
          Des résultats concrets, <br className="hidden sm:inline" />racontés par les nôtres.
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Découvrez les retours d'expérience de nos bénéficiaires
        </p>
      </div>
      
      <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 md:grid-cols-3">
        {items.map((it, index) => (
          <figure 
            key={it.name} 
            className="group relative rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20"
          >
            {/* Guillemet décoratif */}
            <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
            
            {/* Étoiles */}
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: it.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            
            <blockquote className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/80">
              « {it.quote} »
            </blockquote>
            
            <figcaption className="mt-5 sm:mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
              <div className="relative shrink-0">
                <img 
                  src={it.img} 
                  alt={it.name} 
                  loading="lazy" 
                  width={512} 
                  height={512} 
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary/10 p-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}