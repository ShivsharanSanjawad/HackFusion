import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { IncidentProvider } from "@/contexts/IncidentContext";
import { UserRole } from "@/data/mockData";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import FieldStaffDashboard from "./pages/FieldStaffDashboard";
import MyReportsPage from "./pages/MyReportsPage";
import MapViewPage from "./pages/MapViewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role || 'citizen')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Role-based Dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <MyReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/dashboard"
        element={
          <ProtectedRoute allowedRoles={['authority']}>
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/field-staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={['field-staff']}>
            <FieldStaffDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Map View - Available to all authenticated users */}
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'authority', 'field-staff']}>
            <MapViewPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <IncidentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </IncidentProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
