import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { Offerings } from "@/components/site/Offerings";
import { Process } from "@/components/site/Process";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KIVA — Packs agricoles & Kits artisanaux" },
      { name: "description", content: "Plateforme moderne pour gérer, équiper et suivre packs agricoles et kits artisanaux : demande, visite terrain, paiement et attestation." },
      { property: "og:title", content: "KIVA — Cultiver, créer, prospérer." },
      { property: "og:description", content: "Packs agricoles et kits artisanaux livrés, installés et suivis sur le terrain." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Offerings />
        <Process />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
