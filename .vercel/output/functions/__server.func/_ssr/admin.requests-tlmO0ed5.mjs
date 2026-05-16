import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { b as useAuth, u as useNavigate, L as Link, s as supabase, t as toast } from "./router-Bz8BsrzR.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import { I as Input } from "./input-CptRtWkQ.mjs";
import { B as Badge } from "./badge-4s6YNFzg.mjs";
import { T as Textarea } from "./textarea-CLnseLBr.mjs";
import { L as Label } from "./label-BVOh3ziy.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BdM0YAI9.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-he8fblUc.mjs";
import { f as formatXOF } from "./catalog-CI_ANUy9.mjs";
import { S as STATUS_LABEL, a as STATUS_COLOR, b as formatDateTime, f as formatDate } from "./requests-05pGb9bi.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { A as ArrowLeft } from "./arrow-left-DQy1lj3k.mjs";
import { S as Search } from "./search-DtQBWA4e.mjs";
import { c as createLucideIcon } from "./createLucideIcon-BIIitENW.mjs";
import { C as Calendar } from "./calendar-CjfSo84U.mjs";
import { M as MapPin } from "./map-pin-CcWohaeH.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-CTnELKZI.mjs";
import "./check-BDnTsqvO.mjs";
import "./index-iGULmflP.mjs";
import "./x-CxTdNuHc.mjs";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
      key: "9njp5v"
    }
  ]
];
const Phone = createLucideIcon("phone", __iconNode$1);
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
const STATUSES = ["pending", "reviewing", "scheduled", "in_progress", "delivered", "completed", "cancelled"];
function AdminRequestsPage() {
  const {
    isAdmin,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = reactExports.useState(null);
  const [debugError, setDebugError] = reactExports.useState(null);
  const [rawResp, setRawResp] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(null);
  const [editStatus, setEditStatus] = reactExports.useState("pending");
  const [editNote, setEditNote] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && !isAdmin) navigate({
      to: "/dashboard"
    });
  }, [loading, isAdmin, navigate]);
  const load = async () => {
    setDebugError(null);
    setRawResp(null);
    setRequests(null);
    const res = await supabase.from("requests").select("*, products(*)").order("created_at", {
      ascending: false
    });
    setRawResp({
      requests_res: res
    });
    if (res.error) {
      console.error("Supabase error when loading requests (with products):", res.error);
      setDebugError(res.error.message);
      const fallback = await supabase.from("requests").select("*").order("created_at", {
        ascending: false
      });
      setRawResp((r) => ({
        requests_res: res,
        fallback
      }));
      if (fallback.error) {
        console.error("Supabase fallback error when loading requests:", fallback.error);
        setDebugError(`requests: ${res.error.message} | fallback: ${fallback.error.message}`);
        setRequests([]);
        return;
      }
      const reqsFallback = fallback.data ?? [];
      const userIdsFb = Array.from(new Set(reqsFallback.map((r) => r.user_id).filter(Boolean)));
      let profilesMapFb = {};
      if (userIdsFb.length > 0) {
        const {
          data: profilesFb,
          error: profilesErr
        } = await supabase.from("profiles").select("*").in("id", userIdsFb);
        setRawResp((r) => ({
          ...r,
          profiles_fetch: {
            data: profilesFb,
            error: profilesErr
          }
        }));
        if (profilesErr) {
          console.error("Error fetching profiles (fallback):", profilesErr);
          setDebugError((prev) => prev ? prev + " | profiles: " + profilesErr.message : profilesErr.message);
        }
        (profilesFb ?? []).forEach((p) => {
          profilesMapFb[p.id] = p;
        });
      }
      setRequests(reqsFallback.map((r) => ({
        ...r,
        products: null,
        profiles: profilesMapFb[r.user_id] ?? null
      })));
      return;
    }
    const reqs = res.data ?? [];
    const userIds = Array.from(new Set(reqs.map((r) => r.user_id).filter(Boolean)));
    let profilesMap = {};
    if (userIds.length > 0) {
      const {
        data: profiles,
        error: profilesErr
      } = await supabase.from("profiles").select("*").in("id", userIds);
      setRawResp((r) => ({
        ...r,
        profiles_fetch: {
          data: profiles,
          error: profilesErr
        }
      }));
      if (profilesErr) {
        console.error("Error fetching profiles:", profilesErr);
        setDebugError(profilesErr.message);
      }
      (profiles ?? []).forEach((p) => {
        profilesMap[p.id] = p;
      });
    }
    const combined = reqs.map((r) => ({
      ...r,
      profiles: profilesMap[r.user_id] ?? null
    }));
    setRequests(combined);
  };
  reactExports.useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);
  const openEdit = (r) => {
    setEditing(r);
    setEditStatus(r.status);
    setEditNote(r.admin_note ?? "");
  };
  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const {
      error
    } = await supabase.from("requests").update({
      status: editStatus,
      admin_note: editNote || null
    }).eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Demande mise à jour.");
    setEditing(null);
    load();
  };
  if (loading || !isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  const filtered = (requests ?? []).filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.products?.title.toLowerCase().includes(q) || r.delivery_address?.toLowerCase().includes(q) || `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.toLowerCase().includes(q) || r.phone?.toLowerCase().includes(q);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "-ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Retour admin"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary", children: "Administration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-semibold tracking-tight", children: "Demandes." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Suivez, planifiez et mettez à jour le statut des demandes clients." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:grid-cols-[1fr_220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Rechercher (client, produit, adresse…)", className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Statut" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tous les statuts" }),
            STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: STATUS_LABEL[s] }, s))
          ] })
        ] })
      ] }),
      debugError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Erreur lors du chargement des demandes :" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: debugError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { children: "Détails brut de la requête" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 max-h-40 overflow-auto", children: JSON.stringify(rawResp, null, 2) })
        ] })
      ] }),
      !requests ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 rounded-2xl border border-dashed border-border bg-card/40 p-16 text-center text-muted-foreground", children: "Aucune demande." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 space-y-4", children: filtered.map((r) => {
        const fullName = `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.trim() || "Client";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: STATUS_COLOR[r.status], children: STATUS_LABEL[r.status] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "#",
                r.id.slice(0, 8),
                " · ",
                formatDateTime(r.created_at)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-semibold", children: [
              r.products?.title ?? "Produit supprimé",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-sm font-normal text-muted-foreground", children: [
                "× ",
                r.quantity
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1 text-sm text-muted-foreground sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5" }),
                " ",
                fullName
              ] }),
              r.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
                " ",
                r.phone
              ] }),
              r.desired_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
                " ",
                formatDate(r.desired_date)
              ] }),
              r.delivery_address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
                " ",
                r.delivery_address
              ] })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: r.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
            r.products && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-semibold text-primary", children: formatXOF(r.products.price_xof * r.quantity) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => openEdit(r), children: "Mettre à jour" })
          ] })
        ] }) }, r.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mise à jour de la demande" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editing?.products?.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statut" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editStatus, onValueChange: (v) => setEditStatus(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: STATUS_LABEL[s] }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Note pour le client (visible)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editNote, onChange: (e) => setEditNote(e.target.value), rows: 4, maxLength: 1e3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditing(null), children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: saving, children: [
          saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Enregistrer"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AdminRequestsPage as component
};
