import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CatalogList } from "@/components/catalog/CatalogList";

export const Route = createFileRoute("/packs")({
  head: () => ({
    meta: [
      { title: "Packs agricoles — KIVA" },
      { name: "description", content: "Découvrez nos packs agricoles : maraîchage, aviculture, céréales et bien plus." },
    ],
  }),
  component: PacksPage,
});

function PacksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CatalogList
        type="pack"
        title="Packs agricoles."
        intro="Des solutions clé en main pour démarrer ou consolider votre exploitation : semences certifiées, intrants, outillage et accompagnement technique."
      />
      <Footer />
    </div>
  );
}
