const TYPE_LABEL = {
  pack: "Pack agricole",
  kit: "Kit artisanal"
};
function formatXOF(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0
  }).format(value);
}
export {
  TYPE_LABEL as T,
  formatXOF as f
};
