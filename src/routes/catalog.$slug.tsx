import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sprout, Hammer, CheckCircle2, Calendar, Tag, X, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { RequestDialog } from "@/components/requests/RequestDialog";
import {
  formatXOF,
  TYPE_LABEL,
  type ProductRow,
  type ProductItemRow,
} from "@/lib/catalog";

export const Route = createFileRoute("/catalog/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — KIVA` }],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [product, setProduct] = useState<ProductRow | null | undefined>(undefined);
  const [items, setItems] = useState<ProductItemRow[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageScale, setImageScale] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: p } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!active) return;
      setProduct(p ?? null);
      if (p) {
        const { data: it } = await supabase
          .from("product_items")
          .select("*")
          .eq("product_id", p.id)
          .order("position", { ascending: true });
        if (active) setItems(it ?? []);
      }
      if (active && p && isAuthenticated && user) {
        const { data: existing } = await supabase
          .from("requests")
          .select("id")
          .eq("product_id", p.id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (active) setHasRequested(!!existing);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const handleRequest = () => {
    if (!isAuthenticated) {
      toast.message("Connectez-vous pour faire une demande.");
      navigate({ to: "/login" });
      return;
    }
    if (isAdmin) {
      toast.error("Les administrateurs ne peuvent pas créer de demandes.");
      return;
    }
    if (hasRequested) {
      toast.error("Vous avez déjà fait une demande pour ce produit.");
      return;
    }
    setRequestOpen(true);
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
    setImageScale(1);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageScale(1);
  };

  const zoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // Réinitialiser le zoom avec la molette
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isImageModalOpen) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setImageScale(prev => Math.min(prev + 0.1, 3));
        } else {
          setImageScale(prev => Math.max(prev - 0.1, 0.5));
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isImageModalOpen]);

  // Fermer avec la touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        closeImageModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen]);

  if (product === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Produit introuvable.</h1>
          <p className="mt-3 text-muted-foreground">
            Ce produit n'existe pas ou n'est plus disponible.
          </p>
          <Button asChild className="mt-6">
            <Link to="/packs">Retour au catalogue</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = product.type === "pack" ? Sprout : Hammer;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to={product.type === "pack" ? "/packs" : "/kits"}>
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image avec click pour zoom */}
          <div 
            className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-hero shadow-elegant cursor-pointer group relative"
            onClick={openImageModal}
          >
            <div className="aspect-[4/3] w-full relative">
              {product.image_url ? (
                <>
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="h-full w-full object-contain bg-white/5"
                    loading="lazy"
                  />
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-sm rounded-full p-3 text-white">
                      <ZoomIn className="h-6 w-6" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid h-full w-full place-items-center text-primary-foreground">
                  <Icon className="h-16 w-16 opacity-80" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Icon className="h-3 w-3" /> {TYPE_LABEL[product.type]}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Tag className="h-3 w-3" /> {product.category}
              </Badge>
              {product.price_upfront && product.price_monthly && product.duration_months && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" /> {product.duration_months} mois
                </Badge>
              )}
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {product.title}
            </h1>
            {product.short_description && (
              <p className="mt-4 text-lg text-muted-foreground">{product.short_description}</p>
            )}

            {product.price_upfront && product.price_monthly && product.duration_months ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-muted/5 p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Paiement échelonné
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between border-b border-border/40 pb-3">
                    <span className="text-sm text-muted-foreground">Prix total</span>
                    <span className="font-display text-2xl font-semibold text-primary">
                      {formatXOF(product.price_xof)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Paiement initial</span>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">À payer avant la livraison</p>
                    </div>
                    <span className="font-display text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {formatXOF(product.price_upfront)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
                    <div>
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Mensualités</span>
                      <p className="text-xs text-amber-600/70 dark:text-amber-400/70">À payer après la livraison</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-xl font-semibold text-amber-600 dark:text-amber-400">
                        {formatXOF(product.price_monthly)}
                      </span>
                      <span className="ml-1 text-sm text-amber-600/70 dark:text-amber-400/70">/mois</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
                    <span className="text-sm text-muted-foreground">Durée du paiement</span>
                    <span className="font-medium">
                      {product.duration_months} {product.duration_months === 1 ? 'mois' : 'mois'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-primary/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total à payer</span>
                    <span className="font-semibold">{formatXOF(product.price_xof)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dont à la commande</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{formatXOF(product.price_upfront)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dont en {product.duration_months} mensualités</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {formatXOF((product.price_monthly || 0) * (product.duration_months || 0))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold text-primary">
                    {formatXOF(product.price_xof)}
                  </span>
                  <span className="text-sm text-muted-foreground">Paiement unique</span>
                </div>
              </div>
            )}

            {!isAdmin && (
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" onClick={handleRequest} disabled={hasRequested}>
                    Faire la demande
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link
                      to="/contact"
                      search={{
                        product: product.title,
                        subject: `Question sur ${product.title}`,
                      }}
                    >
                      Poser une question
                    </Link>
                  </Button>
                </div>

                {hasRequested && (
                  <div className="rounded-3xl border border-border/60 bg-muted/5 p-5 text-sm text-muted-foreground">
                    Vous avez déjà fait une demande pour ce produit. Notre équipe vous recontactera bientôt.
                  </div>
                )}
              </div>
            )}

            {product.description && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold">Description</h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <section className="mt-16 rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
            <h2 className="font-display text-2xl font-semibold">Composition du {product.type === "pack" ? "pack" : "kit"}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/60 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{it.label}</p>
                    {(it.quantity || it.unit) && (
                      <p className="text-sm text-muted-foreground">
                        {it.quantity ?? ""} {it.unit ?? ""}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
      <RequestDialog product={product} open={requestOpen} onOpenChange={setRequestOpen} />

      {/* Modal d'image avec zoom */}
      {isImageModalOpen && product.image_url && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              aria-label="Fermer"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Contrôles de zoom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Zoom arrière"
                disabled={imageScale <= 0.5}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-white/70 text-sm min-w-[3rem] text-center">
                {Math.round(imageScale * 100)}%
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Zoom avant"
                disabled={imageScale >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>

            {/* Image avec zoom */}
            <div 
              className="overflow-auto max-h-[80vh] w-full flex items-center justify-center"
              style={{ cursor: 'grab' }}
            >
              <img
                src={product.image_url}
                alt={product.title}
                className="transition-transform duration-200 object-contain max-h-[80vh] w-full"
                style={{ 
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
            </div>

            {/* Indicateur de zoom */}
            {imageScale > 1 && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white/80 text-xs">
                Zoom {Math.round(imageScale * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}