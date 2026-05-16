import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { b as useAuth, u as useNavigate, L as Link, s as supabase, t as toast, o as objectType, a as stringType } from "./router-Bz8BsrzR.mjs";
import { H as Header, F as Footer } from "./Footer-BDJ4rQO2.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import { I as Input } from "./input-CptRtWkQ.mjs";
import { L as Label } from "./label-BVOh3ziy.mjs";
import { T as Textarea } from "./textarea-CLnseLBr.mjs";
import { A as ArrowLeft } from "./arrow-left-DQy1lj3k.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-CTnELKZI.mjs";
import "./createLucideIcon-BIIitENW.mjs";
import "./check-BDnTsqvO.mjs";
import "./sprout-qhqxizPr.mjs";
import "./mail-B36WF9Ws.mjs";
const schema = objectType({
  fullName: stringType().trim().min(3, "Nom requis"),
  email: stringType().trim().email("Email invalide"),
  subject: stringType().trim().min(5, "Sujet requis"),
  message: stringType().trim().min(10, "Message requis").max(2e3),
  productTitle: stringType().trim().optional()
});
function ContactPage() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [subject, setSubject] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [productTitle, setProductTitle] = reactExports.useState(void 0);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const [existingQuestionsCount, setExistingQuestionsCount] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!loading && isAdmin) {
      navigate({
        to: "/admin"
      });
      return;
    }
    if (isAuthenticated && user) {
      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.first_name || "");
    }
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    const initialSubject = params.get("subject");
    if (product) {
      setProductTitle(product);
    }
    if (initialSubject) {
      setSubject(initialSubject);
    } else if (product) {
      setSubject(`Question sur ${product}`);
    }
  }, [isAuthenticated, isAdmin, loading, navigate, user]);
  reactExports.useEffect(() => {
    let active = true;
    if (!user || !productTitle) {
      setExistingQuestionsCount(null);
      return;
    }
    const fetchCount = async () => {
      const res = await supabase.from("contact_messages").select("id", {
        head: true,
        count: "exact"
      }).eq("user_id", user.id).eq("product_title", productTitle);
      if (!active) return;
      setExistingQuestionsCount(res.count ?? 0);
    };
    void fetchCount();
    return () => {
      active = false;
    };
  }, [user, productTitle]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsed = schema.safeParse({
      fullName,
      email,
      subject,
      message,
      productTitle
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setSubmitting(true);
    if (user && parsed.data.productTitle) {
      const res = await supabase.from("contact_messages").select("id", {
        head: true,
        count: "exact"
      }).eq("user_id", user.id).eq("product_title", parsed.data.productTitle);
      if (res.error) {
        setSubmitting(false);
        toast.error("Impossible de vérifier le nombre de questions : " + res.error.message);
        return;
      }
      const count = res.count ?? 0;
      if (count >= 3) {
        setSubmitting(false);
        toast.error("Vous avez atteint la limite de 3 questions pour ce produit.");
        return;
      }
    }
    const payload = {
      user_id: user?.id ?? void 0,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      subject: parsed.data.subject,
      message: parsed.data.message,
      product_title: parsed.data.productTitle ?? void 0
    };
    const {
      error
    } = await supabase.from("contact_messages").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Impossible d'envoyer votre message : " + error.message);
      return;
    }
    setSent(true);
    toast.success("Votre message a bien été envoyé. Nous revenons vers vous rapidement.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-4xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "-ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Retour à l'accueil"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl border border-border/60 bg-card p-8 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary", children: "Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-3xl font-semibold tracking-tight", children: "Posez votre question" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Nous avons bien reçu votre demande. Expliquez votre besoin et nous vous répondons rapidement." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-primary/10 p-4 text-sm text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Support professionnel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Votre message est transmis directement à l’équipe KIVA." })
          ] })
        ] }),
        sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-3xl border border-green-200 bg-green-50 p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground", children: "Merci !" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Votre message a bien été envoyé. Nous vous contacterons très prochainement." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-6", onClick: () => navigate({
            to: "/"
          }), children: "Retour à l'accueil" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-10 space-y-6", children: [
          productTitle ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-background/80 p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Produit lié" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-medium", children: productTitle })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nom complet *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Jean Dupont" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "jean@exemple.com" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sujet *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Sujet de votre question" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: message, onChange: (e) => setMessage(e.target.value), rows: 8, placeholder: "Expliquez votre demande, votre question ou votre besoin..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => navigate({
              to: "/"
            }), children: "Annuler" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: submitting, children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Envoyer ma question" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  ContactPage as component
};
