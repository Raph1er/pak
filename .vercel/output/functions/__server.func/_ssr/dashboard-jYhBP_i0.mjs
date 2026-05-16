import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { b as useAuth, s as supabase, L as Link } from "./router-Bz8BsrzR.mjs";
import { H as Header, F as Footer, a as Circle } from "./Footer-BDJ4rQO2.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import { B as Badge } from "./badge-4s6YNFzg.mjs";
import { S as STATUS_LABEL, a as STATUS_COLOR, f as formatDate, b as formatDateTime, c as STATUS_ORDER } from "./requests-05pGb9bi.mjs";
import { c as createLucideIcon } from "./createLucideIcon-BIIitENW.mjs";
import { C as CircleCheck } from "./circle-check-R1oPSR6y.mjs";
import { f as formatXOF } from "./catalog-CI_ANUy9.mjs";
import { P as Package } from "./package-2sMf7fKN.mjs";
import { C as ClipboardList } from "./clipboard-list-DlCFgOtk.mjs";
import { P as Plus } from "./plus-BR_7TFQz.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { C as Calendar } from "./calendar-CjfSo84U.mjs";
import { M as MapPin } from "./map-pin-CcWohaeH.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-CTnELKZI.mjs";
import "./check-BDnTsqvO.mjs";
import "./sprout-qhqxizPr.mjs";
import "./mail-B36WF9Ws.mjs";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode);
function RequestTimeline({ currentStatus, events }) {
  if (currentStatus === "cancelled") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/5 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Demande annulée" })
      ] }),
      events.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2 text-sm", children: events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-muted-foreground", children: [
        STATUS_LABEL[e.status],
        " — ",
        formatDateTime(e.created_at)
      ] }, e.id)) })
    ] });
  }
  const reachedIdx = STATUS_ORDER.indexOf(currentStatus);
  const eventByStatus = /* @__PURE__ */ new Map();
  for (const ev of events) {
    if (!eventByStatus.has(ev.status)) eventByStatus.set(ev.status, ev);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative space-y-5 border-l-2 border-border/60 pl-6", children: STATUS_ORDER.map((status, idx) => {
    const reached = idx <= reachedIdx;
    const isCurrent = idx === reachedIdx;
    const ev = eventByStatus.get(status);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full border-2 ${reached ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`,
          children: reached ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3 w-3" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium ${isCurrent ? "text-primary" : reached ? "text-foreground" : "text-muted-foreground"}`, children: STATUS_LABEL[status] }),
      ev && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        formatDateTime(ev.created_at),
        ev.comment ? ` — ${ev.comment}` : ""
      ] })
    ] }, status);
  }) });
}
function Dashboard() {
  const {
    user,
    isAdmin
  } = useAuth();
  const name = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "vous";
  const [requests, setRequests] = reactExports.useState(null);
  const [eventsByReq, setEventsByReq] = reactExports.useState({});
  const [productCount, setProductCount] = reactExports.useState(null);
  const [requestCount, setRequestCount] = reactExports.useState(null);
  const [pendingCount, setPendingCount] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (isAdmin) {
      let active2 = true;
      (async () => {
        const productsRes = await supabase.from("products").select("id");
        const requestsRes = await supabase.from("requests").select("id");
        const pendingRes = await supabase.from("requests").select("id").eq("status", "pending");
        if (!active2) return;
        setProductCount((productsRes.data ?? []).length);
        setRequestCount((requestsRes.data ?? []).length);
        setPendingCount((pendingRes.data ?? []).length);
      })();
      return () => {
        active2 = false;
      };
    }
    if (!user) return;
    let active = true;
    (async () => {
      const {
        data
      } = await supabase.from("requests").select("*, products(*)").eq("user_id", user.id).order("created_at", {
        ascending: false
      });
      if (!active) return;
      const list = data ?? [];
      setRequests(list);
      if (list.length > 0) {
        const {
          data: evs
        } = await supabase.from("request_events").select("*").in("request_id", list.map((r) => r.id)).order("created_at", {
          ascending: true
        });
        if (!active) return;
        const map = {};
        (evs ?? []).forEach((e) => {
          (map[e.request_id] ??= []).push(e);
        });
        setEventsByReq(map);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin, user]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary", children: isAdmin ? "Espace admin" : "Espace personnel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl", children: [
            "Bonjour, ",
            name,
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: isAdmin ? "Suivez les statistiques et gérez les opérations." : "Suivez vos demandes et leur progression en temps réel." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/catalog", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
            "Catalogue"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/requests", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4" }),
            "Demandes"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/catalog", search: {
            openForm: "1"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Ajouter un produit"
          ] }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/packs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
          "Parcourir le catalogue"
        ] }) }) })
      ] }),
      isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-soft", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Produits" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-4xl font-semibold", children: productCount ?? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "inline-block h-6 w-6 animate-spin" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Packs et kits disponibles" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-soft", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Demandes totales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-4xl font-semibold", children: requestCount ?? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "inline-block h-6 w-6 animate-spin" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Toutes les demandes clients" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-soft", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Demandes en attente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-4xl font-semibold", children: pendingCount ?? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "inline-block h-6 w-6 animate-spin" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Statut pending" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-soft", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold", children: "Actions rapides" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/catalog", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
              "Catalogue"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/requests", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4" }),
              "Demandes"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/catalog", search: {
              openForm: "1"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Ajouter un produit"
            ] }) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-12 font-display text-2xl font-semibold", children: "Mes demandes" }),
        !requests ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-medium", children: "Aucune demande pour l'instant." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Choisissez un pack ou un kit dans notre catalogue." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/packs", children: "Voir les packs" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-6", children: requests.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-[1fr_320px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: STATUS_COLOR[r.status], children: STATUS_LABEL[r.status] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Demande #",
                r.id.slice(0, 8),
                " · créée le ",
                formatDate(r.created_at)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-display text-xl font-semibold", children: r.products?.title ?? "Produit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
                " Quantité : ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: r.quantity })
              ] }),
              r.products && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: formatXOF(r.products.price_xof * r.quantity) }) }),
              r.desired_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                " ",
                formatDate(r.desired_date)
              ] }),
              r.delivery_address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
                " ",
                r.delivery_address
              ] })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground", children: r.notes }),
            r.admin_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note de l'équipe :" }),
              " ",
              r.admin_note
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/40 bg-background/60 p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm font-medium", children: "Suivi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RequestTimeline, { currentStatus: r.status, events: eventsByReq[r.id] ?? [] })
          ] })
        ] }) }, r.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  Dashboard as component
};
