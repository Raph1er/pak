import { ClipboardList, MapPin, Wrench, BadgeCheck } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Demande", desc: "Choisissez un pack et soumettez votre demande en quelques minutes." },
  { icon: MapPin, title: "Visite terrain", desc: "Notre équipe se déplace, évalue et produit un rapport détaillé." },
  { icon: Wrench, title: "Installation", desc: "Livraison, installation et formation sur l'utilisation du matériel." },
  { icon: BadgeCheck, title: "Suivi & attestation", desc: "Suivi continu, facture et attestation officielle générées." },
];

export function Process() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Comment ça marche</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            De la demande à l'attestation, sans friction.
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
              <span className="absolute right-5 top-5 font-display text-5xl text-muted/60">0{i + 1}</span>
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-6 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
