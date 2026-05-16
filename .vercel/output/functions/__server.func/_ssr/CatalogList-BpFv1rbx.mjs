import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { s as supabase, L as Link } from "./router-Bz8BsrzR.mjs";
import { I as Input } from "./input-CptRtWkQ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BdM0YAI9.mjs";
import { B as Badge } from "./badge-4s6YNFzg.mjs";
import { f as formatXOF } from "./catalog-CI_ANUy9.mjs";
import { S as Sprout } from "./sprout-qhqxizPr.mjs";
import { H as Hammer } from "./hammer-Bc7g5o_R.mjs";
import { S as Search } from "./search-DtQBWA4e.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { S as Star, A as ArrowRight } from "./star-6-XdZrvm.mjs";
function CatalogList({ type, title, intro }) {
  const [products, setProducts] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("featured");
  reactExports.useEffect(() => {
    let active = true;
    supabase.from("products").select("*").eq("type", type).eq("published", true).order("featured", { ascending: false }).order("created_at", { ascending: false }).then(({ data }) => {
      if (active) setProducts(data ?? []);
    });
    return () => {
      active = false;
    };
  }, [type]);
  const categories = reactExports.useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);
  const filtered = reactExports.useMemo(() => {
    if (!products) return [];
    let list = products.filter((p) => {
      const matchesQ = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.short_description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === "all" || p.category === category;
      return matchesQ && matchesCat;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price_xof - b.price_xof);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price_xof - a.price_xof);
    return list;
  }, [products, search, category, sort]);
  const Icon = type === "pack" ? Sprout : Hammer;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "inline-flex items-center gap-2 text-sm font-medium text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
        " ",
        type === "pack" ? "Catalogue agricole" : "Catalogue artisanal"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-muted-foreground", children: intro })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-soft md:grid-cols-[1fr_220px_220px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Rechercher un produit…",
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: setCategory, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Catégorie" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Toutes les catégories" }),
          categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sort, onValueChange: (v) => setSort(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trier" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "featured", children: "Mis en avant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "price-asc", children: "Prix croissant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "price-desc", children: "Prix décroissant" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10", children: !products ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card/40 p-16 text-center text-muted-foreground", children: "Aucun produit ne correspond à votre recherche." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p }, p.id)) }) })
  ] });
}
function ProductCard({ product }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/catalog/$slug",
      params: { slug: product.slug },
      className: "group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-elegant",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] overflow-hidden bg-gradient-hero", children: [
          product.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: product.image_url,
              alt: product.title,
              className: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
              loading: "lazy"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center text-primary-foreground/80", children: product.type === "pack" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "h-10 w-10" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Hammer, { className: "h-10 w-10" }) }),
          product.featured && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "absolute left-3 top-3 gap-1 bg-accent text-accent-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
            " Mis en avant"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-3 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5", children: product.category }),
            product.duration_months && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· ",
              product.duration_months,
              " mois"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-semibold leading-tight", children: product.title }),
          product.short_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: product.short_description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-semibold text-primary", children: formatXOF(product.price_xof) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100", children: [
              "Découvrir ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
            ] })
          ] })
        ] })
      ]
    }
  );
}
export {
  CatalogList as C
};
