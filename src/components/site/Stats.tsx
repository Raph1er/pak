const items = [
  { value: "1 240+", label: "Membres associatifs" },
  { value: "38", label: "Packs & kits actifs" },
  { value: "94%", label: "Taux de satisfaction" },
  { value: "12", label: "Régions couvertes" },
];

export function Stats() {
  return (
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label}>
            <p className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {it.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
