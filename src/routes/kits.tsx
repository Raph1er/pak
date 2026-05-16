import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CatalogList } from "@/components/catalog/CatalogList";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Kits artisanaux — KIVA" },
      { name: "description", content: "Kits artisanaux KIVA : couture, menuiserie, soudure, équipements et formations." },
    ],
  }),
  component: KitsPage,
});

function KitsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CatalogList
        type="kit"
        title="Kits artisanaux."
        intro="Des équipements professionnels prêts à l'emploi pour lancer votre activité artisanale, livrés avec formation et accompagnement."
      />
      <Footer />
    </div>
  );
}
