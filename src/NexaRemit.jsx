import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import Dashboard from "./pages/Dashboard";
import SendMoney from "./pages/SendMoney";
import LaunchChecklist from "./pages/LaunchChecklist";
import SecurityCompliance from "./pages/SecurityCompliance";
import AppShell from "./components/layout/AppShell";
import Recipients from "./pages/Recipients";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Integrations from "./pages/Integrations";
import TransferHistory from "./pages/TransferHistory";
import Receipt from "./pages/Receipt";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") return <UserNotRegisteredError />;
    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Setup" element={<Setup />} />
        <Route path="/SendMoney" element={<SendMoney />} />
        <Route path="/History" element={<TransferHistory />} />
        <Route path="/Receipt/:id" element={<Receipt />} />
        <Route path="/Recipients" element={<Recipients />} />
        <Route path="/Integrations" element={<Integrations />} />
        <Route path="/LaunchChecklist" element={<LaunchChecklist />} />
        <Route path="/SecurityCompliance" element={<SecurityCompliance />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AppShell>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
