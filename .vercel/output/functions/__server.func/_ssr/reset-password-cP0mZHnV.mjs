import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { u as useNavigate, t as toast, s as supabase } from "./router-Bz8BsrzR.mjs";
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
function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Au moins 6 caractères");
    if (password !== confirm) return toast.error("Les mots de passe ne correspondent pas");
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Mot de passe mis à jour");
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: "Nouveau mot de passe", subtitle: "Choisissez un mot de passe sécurisé.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Nouveau mot de passe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm", children: "Confirmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirm", type: "password", required: true, value: confirm, onChange: (e) => setConfirm(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full rounded-full", size: "lg", disabled: loading, children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Mettre à jour"
    ] })
  ] }) });
}
export {
  ResetPage as component
};
