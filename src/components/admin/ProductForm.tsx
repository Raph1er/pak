import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ProductRow, ProductItemRow, ProductType } from "@/lib/catalog";

type ItemDraft = {
  id?: string;
  label: string;
  quantity: string;
  unit: string;
};

type Props = { id?: string; embed?: boolean; onSaved?: () => void; onCancel?: () => void };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProductForm({ id, embed, onSaved, onCancel }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [type, setType] = useState<ProductType>("pack");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [priceXof, setPriceXof] = useState<string>("0");
  const [durationMonths, setDurationMonths] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [pricingMode, setPricingMode] = useState<"simple" | "installment">("simple");
  const [priceUpfront, setPriceUpfront] = useState<string>("");
  const [priceMonthly, setPriceMonthly] = useState<string>("");

  // Auto-calculate monthly price based on total - upfront divided by months
  useEffect(() => {
    if (pricingMode === "installment" && durationMonths && priceUpfront && priceXof) {
      const total = parseInt(priceXof, 10) || 0;
      const upfront = parseInt(priceUpfront, 10) || 0;
      const months = parseInt(durationMonths, 10) || 1;

      if (months > 0 && total > upfront) {
        const monthly = Math.round((total - upfront) / months);
        setPriceMonthly(String(Math.max(0, monthly)));
      }
    }
  }, [pricingMode, priceXof, priceUpfront, durationMonths]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (p) {
        const product = p as ProductRow;
        setType(product.type);
        setTitle(product.title);
        setSlug(product.slug);
        setSlugTouched(true);
        setCategory(product.category);
        setShortDescription(product.short_description ?? "");
        setDescription(product.description ?? "");
        setPriceXof(String(product.price_xof));
        setDurationMonths(product.duration_months ? String(product.duration_months) : "");
        setImageUrl(product.image_url ?? "");
        setFeatured(product.featured);
        setPublished(product.published);
        if (product.price_upfront && product.price_monthly) {
          setPricingMode("installment");
          setPriceUpfront(String(product.price_upfront));
          setPriceMonthly(String(product.price_monthly));
        } else {
          setPricingMode("simple");
        }
      }
      const { data: it } = await supabase
        .from("product_items").select("*").eq("product_id", id).order("position");
      setItems(((it as ProductItemRow[]) ?? []).map((i) => ({
        id: i.id,
        label: i.label,
        quantity: i.quantity ? String(i.quantity) : "",
        unit: i.unit ?? "",
      })));
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast.error("Upload échoué : " + error.message);
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !category) {
      toast.error("Titre, slug et catégorie sont requis.");
      return;
    }
    setSaving(true);

    const basePayload = {
      type,
      title,
      slug,
      category,
      short_description: shortDescription || null,
      description: description || null,
      image_url: imageUrl || null,
      featured,
      published,
    };

    const payload = pricingMode === "simple"
      ? {
        ...basePayload,
        price_xof: parseInt(priceXof, 10) || 0,
        price_upfront: null,
        price_monthly: null,
        duration_months: null,
      }
      : {
        ...basePayload,
        price_xof: parseInt(priceXof, 10) || 0,
        price_upfront: parseInt(priceUpfront, 10) || 0,
        price_monthly: parseInt(priceMonthly, 10) || 0,
        duration_months: durationMonths ? parseInt(durationMonths, 10) : null,
      };

    let productId = id;
    if (isEdit) {
      const { error } = await supabase.from("products").update(payload as any).eq("id", id!);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("products").insert(payload as any).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      productId = data.id;
    }

    // Replace items
    if (productId) {
      await supabase.from("product_items").delete().eq("product_id", productId);
      const validItems = items.filter((i) => i.label.trim());
      if (validItems.length > 0) {
        await supabase.from("product_items").insert(
          validItems.map((it, idx) => ({
            product_id: productId!,
            label: it.label,
            quantity: it.quantity ? Number(it.quantity) : null,
            unit: it.unit || null,
            position: idx,
          })),
        );
      }
    }

    toast.success(isEdit ? "Produit mis à jour." : "Produit créé.");
    setSaving(false);

    if (onSaved) {
      onSaved();
      if (!isEdit) {
        setTitle("");
        setSlug("");
        setSlugTouched(false);
        setCategory("");
        setShortDescription("");
        setDescription("");
        setPriceXof("0");
        setDurationMonths("");
        setImageUrl("");
        setFeatured(false);
        setPublished(true);
        setItems([]);
        setPricingMode("simple");
        setPriceUpfront("");
        setPriceMonthly("");
      }
      return;
    }

    navigate({ to: "/admin/catalog" });
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const content = (
    <>
      {!embed && (
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/catalog"><ArrowLeft className="h-4 w-4" />Retour</Link>
        </Button>
      )}

      <h1 className={embed ? "font-display text-2xl font-semibold tracking-tight" : "mt-4 font-display text-4xl font-semibold tracking-tight"}>
        {isEdit ? "Modifier le produit" : "Nouveau produit"}
      </h1>

      <form onSubmit={handleSubmit} className={embed ? "mt-6 space-y-8" : "mt-8 space-y-8"}>
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ProductType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pack">Pack agricole</SelectItem>
                  <SelectItem value="kit">Kit artisanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Maraîchage, Couture…" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pack Maraîchage Démarrage" />
          </div>

          {/* <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={slug}
              onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
              placeholder="pack-marachage-demarrage"
            />
          </div> */}

          <div className="space-y-2">
            <Label>Description courte</Label>
            <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label>Description complète</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pricing" value="simple" checked={pricingMode === "simple"} onChange={() => setPricingMode("simple")} className="h-4 w-4" />
                  <span className="text-sm font-medium">Prix unique</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pricing" value="installment" checked={pricingMode === "installment"} onChange={() => setPricingMode("installment")} className="h-4 w-4" />
                  <span className="text-sm font-medium">Paiement échelonné</span>
                </label>
              </div>
            </div>

            {pricingMode === "simple" ? (
              <div className="space-y-2">
                <Label>Prix total (FCFA)</Label>
                <Input type="number" min="0" value={priceXof} onChange={(e) => setPriceXof(e.target.value)} placeholder="50000" />
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Prix total (FCFA)</Label>
                  <Input type="number" min="0" value={priceXof} onChange={(e) => setPriceXof(e.target.value)} placeholder="50000" />
                </div>
                <div className="space-y-2">
                  <Label>Acompte (FCFA)</Label>
                  <Input type="number" min="0" value={priceUpfront} onChange={(e) => setPriceUpfront(e.target.value)} placeholder="20000" />
                </div>
                <div className="space-y-2">
                  <Label>Durée (mois)</Label>
                  <Input type="number" min="0" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="12" />
                </div>
                <div className="space-y-2 md:col-span-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                  <div className="text-sm font-medium text-muted-foreground">Résumé du paiement</div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Acompte :</span>
                      <span className="font-medium">{priceUpfront ? `${parseInt(priceUpfront, 10).toLocaleString("fr-FR")} FCFA` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix/mois :</span>
                      <span className="font-medium">{priceMonthly ? `${parseInt(priceMonthly, 10).toLocaleString("fr-FR")} FCFA` : "—"} × {durationMonths || "?"} mois</span>
                    </div>
                    <div className="border-t border-border/60 pt-2 flex justify-between font-semibold">
                      <span>Total :</span>
                      <span className="text-primary">{priceXof ? `${parseInt(priceXof, 10).toLocaleString("fr-FR")} FCFA` : "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {imageUrl ? (
              <div className="relative inline-block">
                <img src={imageUrl} alt="" className="h-40 w-60 rounded-xl object-cover" />
                <Button
                  type="button" size="icon" variant="secondary"
                  className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                  onClick={() => setImageUrl("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Téléverser une image
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-3">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <span className="text-sm font-medium">Mis en avant</span>
            </label>
            <label className="flex items-center gap-3">
              <Switch checked={published} onCheckedChange={setPublished} />
              <span className="text-sm font-medium">Publié</span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Composition</h2>
            <Button type="button" variant="outline" size="sm"
              onClick={() => setItems([...items, { label: "", quantity: "", unit: "" }])}
            >
              <Plus className="h-4 w-4" />Ajouter
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun élément. Ajoutez les composants du {type === "pack" ? "pack" : "kit"}.</p>
            )}
            {items.map((it, idx) => (
              <div key={idx} className="grid gap-2 md:grid-cols-[1fr_120px_120px_auto]">
                <Input
                  placeholder="Élément (ex. Semences tomate)"
                  value={it.label}
                  onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                />
                <Input
                  type="number" placeholder="Qté"
                  value={it.quantity}
                  onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))}
                />
                <Input
                  placeholder="Unité"
                  value={it.unit}
                  onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))}
                />
                <Button type="button" variant="ghost" size="icon"
                  className="text-destructive"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          {!embed && (
            <Button asChild type="button" variant="outline">
              <Link to="/admin/catalog">Annuler</Link>
            </Button>
          )}
          {embed && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le produit"}
          </Button>
        </div>
      </form>
    </>
  );

  if (embed) {
    return content;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {content}
      </main>
      <Footer />
    </div>
  );
}
