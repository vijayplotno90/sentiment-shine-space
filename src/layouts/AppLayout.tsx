import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { useStoreLoaded, useMembershipStatus } from "@/data/store";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NoAccess = () => {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-destructive/10 text-destructive grid place-items-center">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">You no longer have access</h1>
        <p className="text-muted-foreground">
          Your account is not an active member of any workspace. If you believe this is a
          mistake, please ask your company owner to re-activate or re-invite you.
        </p>
        <Button onClick={signOut} className="mt-2">Sign out</Button>
      </div>
    </div>
  );
};

const AppLayout = () => {
  const loaded = useStoreLoaded();
  const membership = useMembershipStatus();

  if (loaded && membership === "none") return <NoAccess />;

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
