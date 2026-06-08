import { Navigate } from "react-router-dom";
import { useRole, type Role } from "@/data/store";

export const RoleRoute = ({ allow, children }: { allow: Role[]; children: JSX.Element }) => {
  const role = useRole();
  // Store is loaded before route elements render (AppLayout gates on load).
  if (role && !allow.includes(role)) {
    return <Navigate to={role === "ca" ? "/billing" : "/"} replace />;
  }
  return children;
};
