import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { b as useAuth, u as useNavigate, L as Link, s as supabase, t as toast } from "./router-Bz8BsrzR.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import { B as Badge } from "./badge-4s6YNFzg.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { A as ArrowLeft } from "./arrow-left-DQy1lj3k.mjs";
import { C as Check } from "./check-BDnTsqvO.mjs";
import { M as Mail } from "./mail-B36WF9Ws.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-BIIitENW.mjs";
function AdminMessagesPage() {
  const {
    isAdmin,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = reactExports.useState(null);
  const [processing, setProcessing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && !isAdmin) navigate({
      to: "/dashboard"
    });
  }, [loading, isAdmin, navigate]);
  const loadMessages = async () => {
    setMessages(null);
    const {
      data,
      error
    } = await supabase.from("contact_messages").select("*").eq("is_seen", false).order("created_at", {
      ascending: false
    });
    if (error) {
      toast.error("Impossible de charger les messages : " + error.message);
      setMessages([]);
      return;
    }
    setMessages(data ?? []);
  };
  reactExports.useEffect(() => {
    if (isAdmin) loadMessages();
  }, [isAdmin]);
  const groupedMessages = reactExports.useMemo(() => {
    if (!messages) return {};
    return messages.reduce((acc, message) => {
      const key = message.product_title || "Questions générales";
      if (!acc[key]) acc[key] = [];
      acc[key].push(message);
      return acc;
    }, {});
  }, [messages]);
  const markAsRead = async (id) => {
    setProcessing(true);
    const {
      error
    } = await supabase.from("contact_messages").update({
      is_seen: true
    }).eq("id", id);
    setProcessing(false);
    if (error) {
      toast.error("Impossible de marquer comme lu : " + error.message);
      return;
    }
    toast.success("Message marqué comme lu.");
    loadMessages();
  };
  const markAllAsRead = async () => {
    setProcessing(true);
    const {
      error
    } = await supabase.from("contact_messages").update({
      is_seen: true
    }).eq("is_seen", false);
    setProcessing(false);
    if (error) {
      toast.error("Impossible de marquer tous les messages comme lus : " + error.message);
      return;
    }
    toast.success("Tous les messages ont été marqués comme lus.");
    loadMessages();
  };
  if (loading || !isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  const totalUnread = messages?.length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "-ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Retour admin"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary", children: "Messages non lus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-semibold tracking-tight", children: "Questions clients" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Regroupez les questions par produit et traitez-les dans l’ordre." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
          totalUnread,
          " non lus"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: markAllAsRead, disabled: processing || totalUnread === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-2 h-4 w-4" }),
          " Tout marquer comme lu"
        ] })
      ] })
    ] }),
    messages === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : totalUnread === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-3xl border border-border/60 bg-card p-12 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mx-auto h-10 w-10 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg font-semibold text-foreground", children: "Aucun message non lu." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: "Toutes les questions ont été traitées." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 space-y-6", children: Object.entries(groupedMessages).map(([productTitle, group]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: productTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            group.length,
            " question",
            group.length > 1 ? "s" : "",
            " non lue",
            group.length > 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: group.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-4", children: group.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-3xl border border-border/60 bg-background/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.full_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(message.created_at).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-medium", children: message.subject }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-3", children: message.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => markAsRead(message.id), disabled: processing, children: "Marquer lu" })
      ] }) }, message.id)) })
    ] }, productTitle)) })
  ] });
}
export {
  AdminMessagesPage as component
};
