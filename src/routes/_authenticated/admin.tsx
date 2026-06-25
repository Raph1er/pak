import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ClipboardList, CreditCard, ArrowRight, Mail, Users } from "lucide-react";

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
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                to: "/admin/clients",
                icon: Users,
                title: "Clients",
                label: "Gestion utilisateurs et membres",
                live: true,
              },
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
                to: "/admin/requests_pending",
                icon: Package,
                title: "À analyser",
                label: "Demandes non traitées",
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
                className={`group relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary hover:shadow-lg ${
                  !c.live ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <c.icon className="h-6 w-6 text-primary" />
                  </div>
                  {c.live && (
                    <Badge variant="secondary" className="text-xs">
                      Actif
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Accéder
                  <ArrowRight className="h-4 w-4" />
                </div>
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