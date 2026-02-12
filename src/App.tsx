import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Ranking from "./pages/Ranking";
import Penalties from "./pages/Penalties";
import CashFlow from "./pages/CashFlow";
import ClubRules from "./pages/ClubRules";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./admin/dashboard/AdminDashboard";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import Lineup from "@/pages/Lineup";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAUpdatePrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="players" element={<Players />} />
              <Route path="matches" element={<Matches />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="penalties" element={<Penalties />} />
              <Route path="cashflow" element={<CashFlow />} />
              <Route path="rules" element={<ClubRules />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="/escalacao" element={<Lineup />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
