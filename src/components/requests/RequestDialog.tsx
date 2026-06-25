import { useState, useEffect } from "react";
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
  desired_date: z.string().min(1, "Date de livraison requise"),
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

  // Charger le profil de l'utilisateur pour pré-remplir les champs
  useEffect(() => {
    if (!open || !user) return;
    
    const loadUserProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, address, department, city, neighborhood")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        // Pré-remplir le téléphone
        if (profile.phone) {
          setPhone(profile.phone);
        }
        
        // Pré-remplir l'adresse avec les infos du profil
        const addressParts = [];
        if (profile.neighborhood) addressParts.push(profile.neighborhood);
        if (profile.city) addressParts.push(profile.city);
        if (profile.department) addressParts.push(profile.department);
        if (profile.address) addressParts.push(profile.address);
        
        if (addressParts.length > 0) {
          setAddress(addressParts.join(", "));
        }
      }
    };
    
    loadUserProfile();
  }, [open, user]);

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
      desired_date: desiredDate,
      delivery_address: address,
      phone,
      notes: notes || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("requests").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: parsed.data.quantity,
      desired_date: parsed.data.desired_date,
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
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Faire une demande</DialogTitle>
          <DialogDescription>{product.title}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4">
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
                <Label>Date de livraison souhaitée *</Label>
                <Input 
                  type="date" 
                  min={minDate} 
                  value={desiredDate} 
                  onChange={(e) => setDesiredDate(e.target.value)} 
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Indiquez la date à laquelle vous souhaitez recevoir votre commande
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 ..." maxLength={30} />
              <p className="text-xs text-muted-foreground">
                Pré-rempli depuis votre profil. Vous pouvez le modifier si nécessaire.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Adresse de livraison *</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, ville" maxLength={500} />
              <p className="text-xs text-muted-foreground">
                Pré-rempli depuis votre profil. Vous pouvez le modifier si nécessaire.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} placeholder="Précisions sur votre besoin…" />
            </div>
          </form>
        </div>
        
        <DialogFooter className="shrink-0 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="submit" disabled={submitting} onClick={handleSubmit}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
