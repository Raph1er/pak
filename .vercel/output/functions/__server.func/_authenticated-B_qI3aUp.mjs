import { r as reactExports, W as jsxRuntimeExports, a1 as Outlet } from "./_ssr/server-B3eHXyXy.mjs";
import { b as useAuth, u as useNavigate } from "./_ssr/router-Bz8BsrzR.mjs";
import { L as LoaderCircle } from "./_ssr/loader-circle-CXyMuCs0.mjs";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./_ssr/createLucideIcon-BIIitENW.mjs";
function AuthGuard() {
  const {
    isAuthenticated,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({
        to: "/login"
      });
    }
  }, [loading, isAuthenticated, navigate]);
  if (loading || !isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
}
export {
  AuthGuard as component
};
