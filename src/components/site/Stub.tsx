import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";

function makeStub(title: string, desc: string) {
  return function Stub() {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="text-sm font-medium text-primary">Bientôt</p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-muted-foreground">{desc}</p>
          <Button asChild className="mt-8 rounded-full"><Link to="/">Retour à l'accueil</Link></Button>
        </main>
        <Footer />
      </div>
    );
  };
}

export { makeStub };
