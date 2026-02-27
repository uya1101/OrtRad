import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { T } from './constants/tokens';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/admin/LoginModal';
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

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

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
    return <LoginModal onLogin={async () => false} />;
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

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
          <Background />
          <Header onAdminLogin={() => setShowLoginModal(true)} />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
            <Route path="/admin/sources" element={<AdminRoute><AdminSources /></AdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          </Routes>

          {/* Login Modal */}
          {showLoginModal && <LoginModal onLogin={async (password) => {
            // This will be handled by the ProtectedRoute component
            setShowLoginModal(false);
            return false;
          }} onClose={() => setShowLoginModal(false)} />}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
