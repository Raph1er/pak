import { Star } from "lucide-react";
import t1 from "@/assets/testi-1.jpg";
import t2 from "@/assets/testi-2.jpg";
import t3 from "@/assets/testi-3.jpg";

const items = [
  { img: t1, name: "Awa Diallo", role: "Maraîchère, Thiès", quote: "L'accompagnement KIVA m'a permis de doubler ma production en une saison. Le suivi est exceptionnel." },
  { img: t2, name: "Mamadou Sow", role: "Aviculteur, Kaolack", quote: "Du jour de la demande à l'installation, tout a été fluide. L'équipe est passée plusieurs fois sur place." },
  { img: t3, name: "Fatou Ndiaye", role: "Couturière, Dakar", quote: "Mon atelier tourne enfin à plein régime. Les machines sont robustes et la formation très claire." },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Témoignages</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Des résultats concrets, racontés par les nôtres.
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <figure key={it.name} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex gap-0.5 text-amber">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 text-base leading-relaxed text-foreground">
              « {it.quote} »
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <img src={it.img} alt={it.name} loading="lazy" width={512} height={512} className="h-11 w-11 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
