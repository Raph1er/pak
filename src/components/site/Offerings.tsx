import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2, Star, Sparkles, Package as PackageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatXOF, TYPE_LABEL, type ProductRow } from "@/lib/catalog";

// Icônes par type
const TYPE_ICONS = {
  pack: PackageIcon,
  kit: Sparkles,
};

export function Offerings() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setProducts(data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = useMemo(() => {
    if (!products) return [];
    return products;
  }, [products]);

  const pageCount = Math.max(1, Math.ceil(featuredProducts.length / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const visibleProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return featuredProducts.slice(start, start + pageSize);
  }, [featuredProducts, page]);

  const paginationItems = useMemo(() => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const items: Array<number | "ellipsis"> = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pageCount - 1, page + 1);

    if (start > 2) items.push("ellipsis");
    for (let current = start; current <= end; current += 1) {
      items.push(current);
    }
    if (end < pageCount - 1) items.push("ellipsis");
    items.push(pageCount);
    return items;
  }, [page, pageCount]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <span className="h-px w-8 bg-primary/30" />
            Nos solutions
          </div>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            Tous nos produits publiés.
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
            Parcourez l'ensemble du catalogue, 10 produits par page, avec les offres publiées en direct.
          </p>
        </div>
        <Link 
          to="/packs" 
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors shrink-0"
        >
          Voir tous les packs 
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="mt-8 sm:mt-12">
        {products === null ? (
          <div className="grid place-items-center py-16 sm:py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 sm:p-16 text-center text-muted-foreground">
            <PackageIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 font-medium text-foreground">Aucun produit publié</p>
            <p className="mt-1 text-sm">Revenez bientôt, de nouvelles offres arrivent !</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {visibleProducts.map((product) => {
                const TypeIcon = TYPE_ICONS[product.type as keyof typeof TYPE_ICONS] || PackageIcon;
                const typeLabel = TYPE_LABEL[product.type] || product.type;
                
                return (
                  <Link
                    key={product.id}
                    to="/catalog/$slug"
                    params={{ slug: product.slug }}
                    className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-card shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <TypeIcon className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground border-0 shadow-sm">
                        {typeLabel}
                      </Badge>
                      {product.featured && (
                        <Badge className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          À la une
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-0.5">{product.category}</span>
                        {product.duration_months ? (
                          <span className="text-muted-foreground/60">· {product.duration_months} mois</span>
                        ) : null}
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      {product.short_description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                          {product.short_description}
                        </p>
                      ) : null}
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
                        <span className="font-display text-lg sm:text-xl font-bold text-primary">
                          {formatXOF(product.price_xof)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Voir <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {pageCount > 1 && (
              <Pagination className="mt-8 sm:mt-12">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage((current) => Math.max(1, current - 1));
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : "hover:bg-primary/5"}
                    />
                  </PaginationItem>

                  {paginationItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={page === item}
                          onClick={(event) => {
                            event.preventDefault();
                            setPage(item);
                          }}
                          className={page === item ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/5"}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage((current) => Math.min(pageCount, current + 1));
                      }}
                      className={page === pageCount ? "pointer-events-none opacity-50" : "hover:bg-primary/5"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </section>
  );
}