import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2, Star } from "lucide-react";
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
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-primary">Nos solutions</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Tous nos produits publiés.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Parcourez l’ensemble du catalogue, 10 produits par page, avec les offres publiées en direct.
          </p>
        </div>
        <Link to="/packs" className="hidden text-sm font-medium text-foreground hover:text-primary md:inline-flex md:items-center md:gap-1">
          Voir tous les packs <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12">
        {products === null ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
            Aucun produit publié pour le moment.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/catalog/$slug"
                  params={{ slug: product.slug }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-primary-foreground/80">
                        <Star className="h-10 w-10" />
                      </div>
                    )}
                    <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">
                      {TYPE_LABEL[product.type]}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5">{product.category}</span>
                      {product.duration_months ? <span>· {product.duration_months} mois</span> : null}
                    </div>
                    <h3 className="font-display text-xl font-semibold leading-tight">{product.title}</h3>
                    {product.short_description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.short_description}</p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-display text-lg font-semibold text-primary">{formatXOF(product.price_xof)}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                        Voir <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pageCount > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage((current) => Math.max(1, current - 1));
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : undefined}
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
                      className={page === pageCount ? "pointer-events-none opacity-50" : undefined}
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
