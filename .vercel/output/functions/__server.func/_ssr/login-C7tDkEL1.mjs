import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { u as useNavigate, L as Link, t as toast, s as supabase, o as objectType, a as stringType } from "./router-Bz8BsrzR.mjs";
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
const schema = objectType({
  email: stringType().trim().email({
    message: "Email invalide"
  }).max(255),
  password: stringType().min(6, {
    message: "Au moins 6 caractères"
  }).max(72)
});
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      email,
      password
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Identifiants invalides" : error.message);
      return;
    }
    toast.success("Connexion réussie");
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: "Bon retour.", subtitle: "Connectez-vous pour suivre vos demandes et paiements.", footer: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "hover:text-foreground", children: "Mot de passe oublié ?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      "Pas de compte ?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "font-medium text-foreground hover:text-primary", children: "Créer un compte" })
    ] })
  ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "vous@exemple.com" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Mot de passe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", autoComplete: "current-password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full rounded-full", size: "lg", disabled: loading, children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Se connecter"
    ] })
  ] }) });
}
export {
  LoginPage as component
};
