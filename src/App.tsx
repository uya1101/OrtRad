import { useAuth as useClerkAuth, ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { T } from './constants/tokens';
import { AuthProvider, useAuth as useAppAuth } from './contexts/AuthContext';
import AdminLayout from './components/admin/AdminLayout';
import './styles/global.css';

import Background from './components/layout/Background';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import About from './pages/About';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminSources from './pages/admin/AdminSources';
import AdminLogs from './pages/admin/AdminLogs';
import AdminSettings from './pages/admin/AdminSettings';
import { SignIn } from '@clerk/clerk-react';
import { DebugCheck } from './components/DebugCheck'; // ← 追加

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: T.bgBase,
      }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: T.neonBlue }}>
          LOADING...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: T.bgBase,
      }}>
        <SignIn
          afterSignInUrl="/admin/dashboard"
          redirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              card: {
                background: 'rgba(8,15,30,0.95)',
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              },
              headerTitle: {
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: '1.4rem',
                color: T.textPrimary,
              },
              headerSubtitle: {
                color: T.textDim,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.6rem',
              },
              formButtonPrimary: {
                background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`,
                color: '#050b14',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: 700,
              },
              formFieldLabel: {
                color: T.neonBlue,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.6rem',
              },
              formFieldInput: {
                background: 'rgba(5,11,20,0.6)',
                border: `1px solid ${T.border}`,
                color: T.textPrimary,
                fontFamily: "'Share Tech Mono', monospace",
              },
            },
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
        <Background />
        <Header />

        {/* ★ デバッグ用：確認が終わったら削除 */}
        <DebugCheck />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
          <Route path="/admin/sources" element={<AdminRoute><AdminSources /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  if (!clerkPubKey) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: T.bgBase,
        color: T.textPrimary,
        fontFamily: "'Share Tech Mono', monospace",
      }}>
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: '1rem', marginBottom: 12 }}>Configuration Error</div>
          <div style={{ fontSize: '0.7rem', color: T.textDim }}>
            VITE_CLERK_PUBLISHABLE_KEY is not set.<br />
            Please configure Clerk in your environment variables.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ClerkProvider>
  );
}