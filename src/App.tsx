import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ControlTower from "./pages/ControlTower";
import HistoryPage from "./pages/HistoryPage";
import TemplatesPage from "./pages/TemplatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import OpsPage from "./pages/OpsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/control-tower" element={<ControlTower />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ops" element={<OpsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
