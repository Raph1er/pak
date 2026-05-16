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
  firstName: stringType().trim().min(1, "Prénom requis").max(80),
  lastName: stringType().trim().min(1, "Nom requis").max(80),
  phone: stringType().trim().min(6, "Téléphone requis").max(30),
  email: stringType().trim().email("Email invalide").max(255),
  password: stringType().min(6, "Au moins 6 caractères").max(72)
});
function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const set = (k) => (e) => setForm((s) => ({
    ...s,
    [k]: e.target.value
  }));
  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone
        }
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Email déjà utilisé" : error.message);
      return;
    }
    toast.success("Compte créé. Vérifiez votre email pour confirmer.");
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: "Créer un compte.", subtitle: "Quelques secondes pour rejoindre KIVA.", footer: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
    "Déjà inscrit ?",
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-foreground hover:text-primary", children: "Se connecter" })
  ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "firstName", children: "Prénom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "firstName", required: true, value: form.firstName, onChange: set("firstName") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "lastName", children: "Nom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "lastName", required: true, value: form.lastName, onChange: set("lastName") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Téléphone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "phone", type: "tel", required: true, value: form.phone, onChange: set("phone"), placeholder: "+221 ..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: form.email, onChange: set("email") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Mot de passe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, value: form.password, onChange: set("password") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full rounded-full", size: "lg", disabled: loading, children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Créer mon compte"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "En créant un compte, vous acceptez nos conditions d'utilisation." })
  ] }) });
}
export {
  SignupPage as component
};
