import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { b as useAuth, u as useNavigate } from "./router-Bz8BsrzR.mjs";
import { P as ProductForm } from "./ProductForm-V7vwESp1.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./Footer-BDJ4rQO2.mjs";
import "./button-B-l54qJW.mjs";
import "./Combination-CTnELKZI.mjs";
import "./createLucideIcon-BIIitENW.mjs";
import "./check-BDnTsqvO.mjs";
import "./sprout-qhqxizPr.mjs";
import "./mail-B36WF9Ws.mjs";
import "./input-CptRtWkQ.mjs";
import "./label-BVOh3ziy.mjs";
import "./textarea-CLnseLBr.mjs";
import "./select-BdM0YAI9.mjs";
import "./arrow-left-DQy1lj3k.mjs";
import "./x-CxTdNuHc.mjs";
import "./plus-BR_7TFQz.mjs";
function NewProductPage() {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProductForm, { embed: true });
}
export {
  NewProductPage as component
};
