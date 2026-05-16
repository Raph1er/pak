import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Loader2, Package, ClipboardList, CreditCard, ArrowRight, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — KIVA" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const isAdminIndex = typeof window !== "undefined" ? window.location.pathname === "/admin" : false;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {isAdminIndex ? (
        <main className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-medium text-primary">Administration</p>

          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Espace administrateur.
          </h1>

          <p className="mt-3 max-w-xl text-muted-foreground">
            Pilotez le catalogue, suivez les demandes et gérez les paiements.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {[
              {
                to: "/admin/catalog",
                icon: Package,
                title: "Catalogue",
                label: "Packs & kits",
                live: true,
              },
              {
                to: "/admin/requests",
                icon: ClipboardList,
                title: "Demandes",
                label: "Suivi clients",
                live: true,
              },
              {
                to: "/admin/messages",
                icon: Mail,
                title: "Messages",
                label: "Questions non lues",
                live: true,
              },
              {
                to: "/admin",
                icon: CreditCard,
                title: "Paiements",
                label: "Encaissements",
                live: false,
              },
            ].map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="inline-flex min-w-[12rem] items-center gap-3 rounded-full border border-border/60 bg-background px-5 py-4 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
              >
                <c.icon className="h-5 w-5 text-primary" />
                <span>
                  {c.title}
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </span>
              </Link>
            ))}
          </div>
        </main>
      ) : (
        <Outlet />
      )}

      <Footer />
    </div>
  );
}