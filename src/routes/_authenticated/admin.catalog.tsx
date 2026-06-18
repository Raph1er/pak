import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/ProductForm";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatXOF, type ProductRow } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/catalog")({
  head: () => ({ meta: [{ title: "Catalogue — Admin KIVA" }] }),
  component: AdminCatalogPage,
});

function AdminCatalogPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);

  const load = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
  };

  useEffect(() => {
    if (isAdmin) {
      load();
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("openForm")) {
          setEditingId(undefined);
          setShowForm(true);
          // remove the query param without adding a history entry
          const clean = window.location.pathname + window.location.hash;
          window.history.replaceState(null, "", clean);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isAdmin]);

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", toDelete.id);
    if (error) {
      toast.error("Suppression impossible : " + error.message);
    } else {
      toast.success("Produit supprimé.");
      setProducts((prev) => prev?.filter((p) => p.id !== toDelete.id) ?? null);
    }
    setToDelete(null);
  };

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = (products ?? []).filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4" />Retour admin</Link>
        </Button>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Administration</p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">Catalogue.</h1>
            <p className="mt-2 text-muted-foreground">Gérer tous les packs agricoles et kits artisanaux.</p>
          </div>
          <Button size="lg" onClick={() => { setEditingId(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4" />Ajouter un produit
          </Button>
        </div>

        {showForm && (
          <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <ProductForm id={editingId} embed onSaved={() => { load(); setShowForm(false); setEditingId(undefined); }} onCancel={() => { setShowForm(false); setEditingId(undefined); }} />
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="border-b border-border/60 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="pl-9"
              />
            </div>
          </div>

          {!products ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">Aucun produit.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.type === "pack" ? "Pack" : "Kit"}</Badge>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      {p.price_upfront && p.price_monthly ? (
                        <div className="space-y-1">
                          <div className="text-sm">{formatXOF(p.price_upfront)} acompte</div>
                          <div className="text-xs text-muted-foreground">{formatXOF(p.price_monthly)}/m × {p.duration_months}m</div>
                        </div>
                      ) : (
                        formatXOF(p.price_xof)
                      )}
                    </TableCell>
                    <TableCell>
                      {p.published ? (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/20">Publié</Badge>
                      ) : (
                        <Badge variant="outline">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingId(p.id); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(p)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
      <Outlet />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. « {toDelete?.title} » sera retiré du catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
