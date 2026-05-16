import { W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { L as Link } from "./router-Bz8BsrzR.mjs";
import { H as Header, F as Footer } from "./Footer-BDJ4rQO2.mjs";
import { B as Button } from "./button-B-l54qJW.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Combination-CTnELKZI.mjs";
import "./createLucideIcon-BIIitENW.mjs";
import "./check-BDnTsqvO.mjs";
import "./sprout-qhqxizPr.mjs";
import "./mail-B36WF9Ws.mjs";
function makeStub(title, desc) {
  return function Stub() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-6 py-32 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary", children: "Bientôt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-5xl font-semibold tracking-tight", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-8 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Retour à l'accueil" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
    ] });
  };
}
const SplitComponent = makeStub("Notre démarche", "Le détail de notre démarche d'accompagnement sera publié prochainement.");
export {
  SplitComponent as component
};
