import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { useStoreLoaded } from "@/data/store";
import { Loader2 } from "lucide-react";

const AppLayout = () => {
  const loaded = useStoreLoaded();
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
        {loaded ? (
          <Outlet />
        ) : (
          <div className="min-h-[60vh] grid place-items-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm">Loading your workspace…</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
