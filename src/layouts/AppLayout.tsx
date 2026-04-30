import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

const AppLayout = () => (
  <div className="flex min-h-screen">
    <AppSidebar />
    <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
