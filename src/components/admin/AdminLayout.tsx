import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { T } from '../../constants/tokens';
import Background from '../layout/Background';
import Dot from '../common/Dot';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '📊', path: '/admin' },
  { id: 'articles', label: 'ARTICLES', icon: '📄', path: '/admin/articles' },
  { id: 'sources', label: 'SOURCES', icon: '📡', path: '/admin/sources' },
  { id: 'logs', label: 'LOGS', icon: '📋', path: '/admin/logs' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙️', path: '/admin/settings' },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{ background: T.bgBase, minHeight: '100vh', position: 'relative' }}>
      <Background />

      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(5,11,20,0.96)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${T.border}`,
        height: 62,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 24px', height: '100%',
        }}>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: `linear-gradient(135deg,${T.neonCoral},${T.neonPurple})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  🔧
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
                    fontSize: '1.05rem', color: T.textPrimary,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    ADMIN PANEL
                  </div>
                  <div style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '0.48rem', color: T.neonCoral,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    OrtRad Management System
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Dot color={T.neonGreen} label="SYSTEM ONLINE" />
            <Link
              to="/"
              style={{
                padding: '6px 14px',
                background: 'rgba(56,189,248,0.08)',
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.textSecond,
                textDecoration: 'none',
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: '0.52rem', letterSpacing: '0.06em',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.15)';
                e.currentTarget.style.borderColor = T.neonBlue;
                e.currentTarget.style.color = T.neonBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.08)';
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.color = T.textSecond;
              }}
            >
              → PUBLIC SITE
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Button */}
      <button
        className="admin-mobile-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 72, right: 20, zIndex: 999,
          display: 'none',
          padding: '10px 14px',
          background: 'rgba(56,189,248,0.1)',
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          color: T.neonBlue,
          cursor: 'pointer',
        }}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Layout */}
      <div style={{ display: 'flex', paddingTop: 62 }}>
        {/* Sidebar */}
        <aside style={{
          width: 240,
          background: 'rgba(8,15,30,0.60)',
          borderRight: `1px solid ${T.border}`,
          height: 'calc(100vh - 62px)',
          position: 'fixed', left: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          <nav style={{ padding: '20px 0', flex: 1 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    margin: '4px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    background: isActive ? 'rgba(56,189,248,0.12)' : 'transparent',
                    border: isActive ? `1px solid ${T.neonBlue}` : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(56,189,248,0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '0.6rem', letterSpacing: '0.08em',
                    textTransform: 'uppercase', fontWeight: 600,
                    color: isActive ? T.neonBlue : T.textSecond,
                  }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{
            padding: '20px',
            borderTop: `1px solid ${T.border}`,
            background: 'rgba(5,11,20,0.30)',
          }}>
            <div style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: '0.45rem', color: T.textDim,
              letterSpacing: '0.06em', textAlign: 'center',
            }}>
              v2.1 · ADMIN MODE
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1, marginLeft: 240,
          padding: '30px 40px',
          minHeight: 'calc(100vh - 62px)',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
          background: 'rgba(5,11,20,0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 998,
          padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                background: location.pathname === item.path ? 'rgba(56,189,248,0.12)' : 'transparent',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: '0.65rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontWeight: 600,
                color: location.pathname === item.path ? T.neonBlue : T.textSecond,
              }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Styles */}
      <style>{`
        @media (max-width: 1024px) {
          aside { display: none !important; }
          main { margin-left: 0 !important; padding: 30px 20px !important; }
          .admin-mobile-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
