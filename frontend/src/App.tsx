// App entry point: initialises providers, routing, theme, and global UI components
import { Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import Navbar from "./components/Navbar";

// Lazy load page components for better initial load performance
import { lazy } from "react";
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const IndividualDashboard = lazy(() => import("./pages/IndividualDashboard"));
const InstitutionDashboard = lazy(() => import("./pages/InstitutionDashboard"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));

/**
 * Configure React Query client with optimised settings
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data remains fresh for 1 minute
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.response?.status === 404 || error?.response?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Don't refetch on window focus in production
    },
  },
});

// Component displayed while lazy-loaded routes are loading
const LoadingFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
  </div>
);

// Root application component: sets up QueryClient, theme, user context, routing and notifications
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <UserProvider>
        <TooltipProvider>
          {/* Main app container for theme, navigation, notifications and routes */}
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Theme toggle button positioned above all other elements */}
            <div className="fixed top-4 right-4 z-[100]">
              <ThemeToggle />
            </div>

            {/* Router setup for handling application routes */}
            <BrowserRouter>
              {/* Site navigation bar */}
              <Navbar />

              {/* Toast notifications positioned below theme toggle */}
              <Sonner
                className="toaster group"
                position="top-right"
                expand
                closeButton
                richColors
                toastOptions={{
                  classNames: {
                    toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                  },
                  duration: 4000,
                }}
              />

              {/* Suspense boundary for lazy-loaded pages */}
              <Suspense fallback={<LoadingFallback />}>
                {/* Define application routes */}
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard/individual" element={<IndividualDashboard />} />
                  <Route path="/dashboard/institution" element={<InstitutionDashboard />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;