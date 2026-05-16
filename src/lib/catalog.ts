import type { Database } from "@/integrations/supabase/types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductItemRow = Database["public"]["Tables"]["product_items"]["Row"];
export type ProductType = Database["public"]["Enums"]["product_type"];

export const TYPE_LABEL: Record<ProductType, string> = {
  pack: "Pack agricole",
  kit: "Kit artisanal",
};

export function formatXOF(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}
