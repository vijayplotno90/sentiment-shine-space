import { Navigate, useLocation } from "react-router-dom";
import { useOrgRole, allowedTabs, canAccessTab } from "@/data/store";

/**
 * Guards a route by the current user's organization role.
 * If the user's role can't access the current tab, redirect to their first allowed tab.
 * While the role is still loading (null), render children — the sidebar already hides
 * disallowed tabs, and RLS enforces data access on the server regardless.
 */
export const RoleRoute = ({ children }: { children: JSX.Element }) => {
  const role = useOrgRole();
  const location = useLocation();

  if (role && !canAccessTab(location.pathname)) {
    const fallback = allowedTabs()[0] || "/";
    return <Navigate to={fallback} replace />;
  }
  return children;
};
