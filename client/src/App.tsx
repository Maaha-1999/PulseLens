import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AllData from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Accounts from "@/pages/accounts";
import Timeline from "@/pages/timeline";
import Today from "@/pages/today";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/all-data">
        <ProtectedRoute>
          <AllData />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      <Route path="/accounts">
        <ProtectedRoute>
          <Accounts />
        </ProtectedRoute>
      </Route>
      <Route path="/timeline">
        <ProtectedRoute>
          <Timeline />
        </ProtectedRoute>
      </Route>
      <Route path="/today">
        <ProtectedRoute>
          <Today />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;