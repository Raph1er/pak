import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { L as Link, s as supabase, t as toast } from "./router-Bz8BsrzR.mjs";
import { A as AuthShell } from "./AuthShell-DP0BdOi6.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import { I as Input } from "./input-CptRtWkQ.mjs";
import { L as Label } from "./label-BVOh3ziy.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./hero-farm-DDrHG8r9.mjs";
import "./sprout-qhqxizPr.mjs";
import "./createLucideIcon-BIIitENW.mjs";
function ForgotPage() {
  const [email, setEmail] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Email envoyé si le compte existe");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: "Mot de passe oublié ?", subtitle: "Entrez votre email, nous vous enverrons un lien.", footer: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "hover:text-foreground", children: "← Retour à la connexion" }), children: sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 text-sm", children: [
    "Un email de réinitialisation vient d'être envoyé à ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: email }),
    ". Vérifiez votre boîte de réception."
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full rounded-full", size: "lg", disabled: loading, children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Envoyer le lien"
    ] })
  ] }) });
}
export {
  ForgotPage as component
};
