import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleRoute";
import AppLayout from "./layouts/AppLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import Developers from "./pages/Developers";
import Meetings from "./pages/Meetings";
import Finance from "./pages/Finance";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<RoleRoute allow={["owner", "admin"]}><Index /></RoleRoute>} />
              <Route path="/clients" element={<RoleRoute allow={["owner", "admin"]}><Clients /></RoleRoute>} />
              <Route path="/developers" element={<RoleRoute allow={["owner", "admin"]}><Developers /></RoleRoute>} />
              <Route path="/meetings" element={<RoleRoute allow={["owner", "admin"]}><Meetings /></RoleRoute>} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/finance" element={<RoleRoute allow={["owner", "admin"]}><Finance /></RoleRoute>} />
              <Route path="/reports" element={<RoleRoute allow={["owner", "admin"]}><Reports /></RoleRoute>} />
              <Route path="/team" element={<RoleRoute allow={["owner"]}><Team /></RoleRoute>} />

            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
