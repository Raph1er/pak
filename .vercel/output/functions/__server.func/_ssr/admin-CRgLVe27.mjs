import { r as reactExports, W as jsxRuntimeExports, a1 as Outlet } from "./server-B3eHXyXy.mjs";
import { b as useAuth, u as useNavigate, L as Link } from "./router-Bz8BsrzR.mjs";
import { H as Header, F as Footer } from "./Footer-BDJ4rQO2.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { P as Package } from "./package-2sMf7fKN.mjs";
import { C as ClipboardList } from "./clipboard-list-DlCFgOtk.mjs";
import { M as Mail } from "./mail-B36WF9Ws.mjs";
import { c as createLucideIcon } from "./createLucideIcon-BIIitENW.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-B-l54qJW.mjs";
import "./Combination-CTnELKZI.mjs";
import "./check-BDnTsqvO.mjs";
import "./sprout-qhqxizPr.mjs";
const __iconNode = [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
];
const CreditCard = createLucideIcon("credit-card", __iconNode);
function AdminPage() {
  const {
    isAdmin,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !isAdmin) navigate({
      to: "/dashboard"
    });
  }, [loading, isAdmin, navigate]);
  if (loading || !isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  const isAdminIndex = typeof window !== "undefined" ? window.location.pathname === "/admin" : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    isAdminIndex ? /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary", children: "Administration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl", children: "Espace administrateur." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-xl text-muted-foreground", children: "Pilotez le catalogue, suivez les demandes et gérez les paiements." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [{
        to: "/admin/catalog",
        icon: Package,
        title: "Catalogue",
        label: "Packs & kits",
        live: true
      }, {
        to: "/admin/requests",
        icon: ClipboardList,
        title: "Demandes",
        label: "Suivi clients",
        live: true
      }, {
        to: "/admin/messages",
        icon: Mail,
        title: "Messages",
        label: "Questions non lues",
        live: true
      }, {
        to: "/admin",
        icon: CreditCard,
        title: "Paiements",
        label: "Encaissements",
        live: false
      }].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: c.to, className: "inline-flex min-w-[12rem] items-center gap-3 rounded-full border border-border/60 bg-background px-5 py-4 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          c.title,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.label })
        ] })
      ] }, c.title)) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  AdminPage as component
};
