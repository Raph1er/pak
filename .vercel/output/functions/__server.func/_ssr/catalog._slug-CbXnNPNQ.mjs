import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { R as Route$7, u as useNavigate, b as useAuth, s as supabase, L as Link, t as toast, o as objectType, a as stringType, n as numberType } from "./router-Bz8BsrzR.mjs";
import { H as Header, F as Footer } from "./Footer-BDJ4rQO2.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import { B as Badge } from "./badge-4s6YNFzg.mjs";
import { I as Input } from "./input-CptRtWkQ.mjs";
import { L as Label } from "./label-BVOh3ziy.mjs";
import { T as Textarea } from "./textarea-CLnseLBr.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-he8fblUc.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { T as TYPE_LABEL, f as formatXOF } from "./catalog-CI_ANUy9.mjs";
import { S as Sprout } from "./sprout-qhqxizPr.mjs";
import { H as Hammer } from "./hammer-Bc7g5o_R.mjs";
import { A as ArrowLeft } from "./arrow-left-DQy1lj3k.mjs";
import { c as createLucideIcon } from "./createLucideIcon-BIIitENW.mjs";
import { C as Calendar } from "./calendar-CjfSo84U.mjs";
import { C as CircleCheck } from "./circle-check-R1oPSR6y.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-CTnELKZI.mjs";
import "./check-BDnTsqvO.mjs";
import "./mail-B36WF9Ws.mjs";
import "./index-iGULmflP.mjs";
import "./x-CxTdNuHc.mjs";
const __iconNode = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode);
const schema = objectType({
  quantity: numberType().int().min(1).max(1e4),
  desired_date: stringType().optional(),
  delivery_address: stringType().trim().min(3, "Adresse requise").max(500),
  phone: stringType().trim().min(6, "Téléphone requis").max(30),
  notes: stringType().trim().max(1e3).optional()
});
function RequestDialog({ product, open, onOpenChange }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [quantity, setQuantity] = reactExports.useState("1");
  const [desiredDate, setDesiredDate] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (isAdmin) {
      toast.error("Les administrateurs ne peuvent pas créer de demandes.");
      onOpenChange(false);
      return;
    }
    const parsed = schema.safeParse({
      quantity: parseInt(quantity, 10),
      desired_date: desiredDate || void 0,
      delivery_address: address,
      phone,
      notes: notes || void 0
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    const { data: existingRequest } = await supabase.from("requests").select("id").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
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
      notes: parsed.data.notes ?? null
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
  const minDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Faire une demande" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: product.title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantité" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: quantity, onChange: (e) => setQuantity(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date souhaitée" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: minDate, value: desiredDate, onChange: (e) => setDesiredDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Téléphone *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+229 ...", maxLength: 30 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Adresse de livraison *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: address, onChange: (e) => setAddress(e.target.value), placeholder: "Quartier, ville", maxLength: 500 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optionnel)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, maxLength: 1e3, placeholder: "Précisions sur votre besoin…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: submitting, children: [
          submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Envoyer la demande"
        ] })
      ] })
    ] })
  ] }) });
}
function ProductDetailPage() {
  const {
    slug
  } = Route$7.useParams();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isAdmin
  } = useAuth();
  const [product, setProduct] = reactExports.useState(void 0);
  const [items, setItems] = reactExports.useState([]);
  const [requestOpen, setRequestOpen] = reactExports.useState(false);
  const [hasRequested, setHasRequested] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: p
      } = await supabase.from("products").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (!active) return;
      setProduct(p ?? null);
      if (p) {
        const {
          data: it
        } = await supabase.from("product_items").select("*").eq("product_id", p.id).order("position", {
          ascending: true
        });
        if (active) setItems(it ?? []);
      }
      if (active && p && isAuthenticated && user) {
        const {
          data: existing
        } = await supabase.from("requests").select("id").eq("product_id", p.id).eq("user_id", user.id).maybeSingle();
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
      navigate({
        to: "/login"
      });
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
  if (product === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  if (product === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-6 py-24 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Produit introuvable." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Ce produit n'existe pas ou n'est plus disponible." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/packs", children: "Retour au catalogue" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
    ] });
  }
  const Icon = product.type === "pack" ? Sprout : Hammer;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "mb-6 -ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: product.type === "pack" ? "/packs" : "/kits", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Retour au catalogue"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl border border-border/60 bg-gradient-hero shadow-elegant", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3] w-full", children: product.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image_url, alt: product.title, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-16 w-16 opacity-80" }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
              " ",
              TYPE_LABEL[product.type]
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3 w-3" }),
              " ",
              product.category
            ] }),
            product.duration_months && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
              " ",
              product.duration_months,
              " mois"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl", children: product.title }),
          product.short_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg text-muted-foreground", children: product.short_description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-baseline gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-3xl font-semibold text-primary", children: formatXOF(product.price_xof) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "à partir de" })
          ] }),
          !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", onClick: handleRequest, disabled: hasRequested, children: "Faire une demande" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", search: {
                product: product.title,
                subject: `Question sur ${product.title}`
              }, children: "Poser une question" }) })
            ] }),
            hasRequested && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-border/60 bg-muted/5 p-5 text-sm text-muted-foreground", children: "Vous avez déjà fait une demande pour ce produit. Notre équipe vous recontactera bientôt." })
          ] }),
          product.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-line text-muted-foreground", children: product.description })
          ] })
        ] })
      ] }),
      items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-16 rounded-3xl border border-border/60 bg-card p-8 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-semibold", children: [
          "Composition du ",
          product.type === "pack" ? "pack" : "kit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 rounded-xl border border-border/50 bg-background/60 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: it.label }),
            (it.quantity || it.unit) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              it.quantity ?? "",
              " ",
              it.unit ?? ""
            ] })
          ] })
        ] }, it.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RequestDialog, { product, open: requestOpen, onOpenChange: setRequestOpen })
  ] });
}
export {
  ProductDetailPage as component
};
