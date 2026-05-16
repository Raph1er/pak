import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sprout, Hammer, Search, ArrowRight, Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatXOF, type ProductRow, type ProductType } from "@/lib/catalog";

type Props = {
  type: ProductType;
  title: string;
  intro: string;
};

export function CatalogList({ type, title, intro }: Props) {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .eq("type", type)
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setProducts(data ?? []);
      });
    return () => {
      active = false;
    };
  }, [type]);

  const categories = useMemo(() => {
    if (!products) return [] as string[];
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products.filter((p) => {
      const matchesQ =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.short_description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === "all" || p.category === category;
      return matchesQ && matchesCat;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price_xof - b.price_xof);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price_xof - a.price_xof);
    return list;
  }, [products, search, category, sort]);

  const Icon = type === "pack" ? Sprout : Hammer;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Icon className="h-4 w-4" /> {type === "pack" ? "Catalogue agricole" : "Catalogue artisanal"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{intro}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-soft md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger><SelectValue placeholder="Trier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Mis en avant</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-10">
        {!products ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-16 text-center text-muted-foreground">
            Aucun produit ne correspond à votre recherche.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: ProductRow }) {
  return (
    <Link
      to="/catalog/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-hero">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary-foreground/80">
            {product.type === "pack" ? <Sprout className="h-10 w-10" /> : <Hammer className="h-10 w-10" />}
          </div>
        )}
        {product.featured && (
          <Badge className="absolute left-3 top-3 gap-1 bg-accent text-accent-foreground">
            <Star className="h-3 w-3" /> Mis en avant
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">{product.category}</span>
          {product.duration_months && <span>· {product.duration_months} mois</span>}
        </div>
        <h3 className="font-display text-xl font-semibold leading-tight">{product.title}</h3>
        {product.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.short_description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg font-semibold text-primary">
            {formatXOF(product.price_xof)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
            Découvrir <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
