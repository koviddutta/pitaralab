import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ErrorBoundary from "./components/ui/error-boundary";

const queryClient = new QueryClient();

// Environment validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Lazy-load all routes that may import the Supabase client
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ReverseEngineer = lazy(() => import("./components/ReverseEngineer"));

const EnvErrorScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'system-ui, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '3rem',
      maxWidth: '500px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
        ⚠️ Environment Configuration Missing
      </h1>
      <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
        Backend connection variables are not loaded. This usually happens after code changes.
      </p>
      <div style={{
        background: '#f3f4f6',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        fontSize: '0.875rem',
        textAlign: 'left'
      }}>
        <strong>Quick Fix:</strong>
        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Press <kbd style={{ background: '#fff', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>Ctrl+Shift+R</kbd> (or <kbd style={{ background: '#fff', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>Cmd+Shift+R</kbd> on Mac)</li>
          <li>Or click the refresh button in your browser</li>
        </ol>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#667eea',
          color: 'white',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
        onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
      >
        🔄 Refresh Now
      </button>
    </div>
  </div>
);

const App = () => {
  // Show error screen if environment variables are missing
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return (
      <QueryClientProvider client={queryClient}>
        <EnvErrorScreen />
      </QueryClientProvider>
    );
  }

  // Normal app rendering
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div style={{padding:'2rem'}}>Loading…</div>}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Index />} />
                <Route path="/reverse-engineer" element={<ReverseEngineer palette={[]} />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
