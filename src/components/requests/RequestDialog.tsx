import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatXOF } from "@/lib/catalog";
import type { ProductRow } from "@/lib/catalog";

const schema = z.object({
  quantity: z.number().int().min(1).max(10000),
  desired_date: z.string().optional(),
  delivery_address: z.string().trim().min(3, "Adresse requise").max(500),
  phone: z.string().trim().min(6, "Téléphone requis").max(30),
  notes: z.string().trim().max(1000).optional(),
});

type Props = {
  product: ProductRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RequestDialog({ product, open, onOpenChange }: Props) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [desiredDate, setDesiredDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isAdmin) {
      toast.error("Les administrateurs ne peuvent pas créer de demandes.");
      onOpenChange(false);
      return;
    }
    const parsed = schema.safeParse({
      quantity: parseInt(quantity, 10),
      desired_date: desiredDate || undefined,
      delivery_address: address,
      phone,
      notes: notes || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    const { data: existingRequest } = await supabase
      .from("requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existingRequest) {
      toast.error("Vous avez déjà fait une demande pour ce produit.");
      onOpenChange(false);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("requests").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: parsed.data.quantity,
      desired_date: parsed.data.desired_date ?? null,
      delivery_address: parsed.data.delivery_address,
      phone: parsed.data.phone,
      notes: parsed.data.notes ?? null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    toast.success("Demande envoyée. Vous serez recontacté très rapidement.");
    onOpenChange(false);
    navigate({ to: "/dashboard" });
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Faire une demande</DialogTitle>
          <DialogDescription>{product.title}</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2">
          {product.price_upfront && product.price_monthly ? (
            <>
              <div className="text-sm text-muted-foreground">Paiement échelonné</div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Acompte :</span>
                <span className="font-display font-semibold text-primary">{formatXOF(product.price_upfront)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">Puis :</span>
                <span className="font-display font-semibold text-primary">{formatXOF(product.price_monthly)}/mois × {product.duration_months} mois</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between items-baseline">
                <span className="text-sm font-medium">Total :</span>
                <span className="font-display font-semibold text-primary">{formatXOF(product.price_xof)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium">Prix :</span>
              <span className="font-display font-semibold text-primary">{formatXOF(product.price_xof)}</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date souhaitée</Label>
              <Input type="date" min={minDate} value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Téléphone *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 ..." maxLength={30} />
          </div>
          <div className="space-y-2">
            <Label>Adresse de livraison *</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, ville" maxLength={500} />
          </div>
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} placeholder="Précisions sur votre besoin…" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Envoyer la demande
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
