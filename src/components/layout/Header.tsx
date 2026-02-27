import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { T } from '../../constants/tokens';
import { NAV_ITEMS } from '../../constants/navigation';
import LogoIcon from '../common/LogoIcon';
import Dot from '../common/Dot';
import HudBtn from '../common/HudBtn';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  label: string;
  sub: string;
  index: number;
}

function NavItem({ label, sub, index }: NavItemProps) {
  const [h, setH] = useState(false);
  return (
    <Link to="/#" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        padding: "6px 10px", textDecoration: "none", position: "relative",
        animation: "slideInLeft 0.4s ease both",
        animationDelay: `${0.38 + index * 0.08}s`,
        opacity: 0, animationFillMode: "forwards",
      }}>
      <div style={{
        position: "absolute", bottom: 0, left: "50%", height: 2,
        width: h ? "78%" : "0%", transform: "translateX(-50%)",
        transition: "width 0.22s ease",
        background: `linear-gradient(90deg,transparent,${T.neonBlue},transparent)`,
        boxShadow: h ? `0 0 10px ${T.neonBlue}` : "none",
      }} />
      <span style={{
        fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: "0.8rem",
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: h ? T.neonBlue : T.textSecond,
        transition: "color 0.2s ease",
        textShadow: h ? `0 0 14px rgba(56,189,248,0.65)` : "none",
      }}>{label}</span>
      {sub && (
        <span style={{
          fontFamily: "'Share Tech Mono',monospace", fontSize: "0.52rem",
          color: h ? T.neonTeal : T.textDim, letterSpacing: "0.08em",
          transition: "color 0.2s ease",
        }}>{sub}</span>
      )}
    </Link>
  );
}

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px",
        background: "rgba(56,189,248,0.06)",
        border: `1px solid ${T.border}`,
        borderRadius: 4, cursor: "pointer",
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: "0.58rem",
        color: T.textSecond, letterSpacing: "0.08em",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = T.neonBlue;
        e.currentTarget.style.background = "rgba(56,189,248,0.12)";
        e.currentTarget.style.color = T.neonBlue;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.background = "rgba(56,189,248,0.06)";
        e.currentTarget.style.color = T.textSecond;
      }}
    >
      <span style={{ fontSize: "0.7rem" }}>{i18n.language === 'ja' ? '🇯🇵' : '🇺🇸'}</span>
      <span>{i18n.language === 'ja' ? 'JA' : 'EN'}</span>
    </button>
  );
}

export default function Header({ onAdminLogin }: { onAdminLogin?: () => void }) {
  const { t, isAuthenticated: isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => { clearInterval(id); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      transition: "background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease",
      background: scrolled ? "rgba(5,11,20,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(22px) saturate(180%)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "3px 24px",
        borderBottom: "1px solid rgba(56,189,248,0.06)",
        background: "rgba(56,189,248,0.022)",
        overflow: "hidden",
      }}>
        <span className="header-top-text" style={{
          fontFamily: "'Share Tech Mono',monospace", fontSize: "0.57rem",
          color: T.textDim, letterSpacing: "0.13em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {t('dashboard.system_version')}
        </span>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
          <Dot color={T.neonGreen} label={t('common.online')} />
          <span style={{
            fontFamily: "'Share Tech Mono',monospace", fontSize: "0.57rem",
            color: T.neonBlue, letterSpacing: "0.1em",
          }}>{time} JST</span>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 62, maxWidth: 1400, margin: "0 auto", width: "100%",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <LogoIcon size={40} />
          <div>
            <div style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
              fontSize: "1.12rem", letterSpacing: "0.08em",
              textTransform: "uppercase", lineHeight: 1.1,
            }}>
              OrthoRad<span style={{ color: T.neonBlue }}>.hub</span>
            </div>
            <div style={{
              fontFamily: "'Share Tech Mono',monospace", fontSize: "0.53rem",
              color: T.neonTeal, letterSpacing: "0.14em",
            }}>IMAGING KNOWLEDGE SYSTEM</div>
          </div>
        </Link>

        <nav className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV_ITEMS.map((n, i) => <NavItem key={n.label} {...n} index={i} />)}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageToggle />
          <Link to="/admin" onClick={(e) => {
            e.preventDefault();
            if (isAdmin) {
              window.location.href = '/admin/dashboard';
            } else {
              onAdminLogin?.();
            }
          }}
            style={{
              fontSize: "0.5rem",
              color: T.textDim,
              textDecoration: "none",
              fontFamily: "'Share Tech Mono',monospace",
              letterSpacing: "0.08em",
              opacity: isAdmin ? 1 : 0.6,
              transition: "opacity 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = T.neonBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = isAdmin ? 1 : 0.6;
              e.currentTarget.style.color = T.textDim;
            }}
          >{isAdmin ? 'ADMIN' : 'ADMIN_LOGIN'}</Link>
          <HudBtn label="SEARCH" small icon={
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          } onClick={() => window.location.href = '/search'} />
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="メニュー"
            style={{
              display: "none", alignItems: "center", justifyContent: "center",
              width: 36, height: 36,
              background: mobileOpen ? "rgba(56,189,248,0.14)" : "rgba(56,189,248,0.07)",
              border: `1px solid ${mobileOpen ? T.neonBlue : T.border}`,
              borderRadius: 8, cursor: "pointer", color: T.neonBlue,
              fontSize: "1rem",
            }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{
          background: "rgba(5,11,20,0.97)", backdropFilter: "blur(24px)",
          borderTop: `1px solid ${T.border}`, padding: "12px 24px 18px",
          display: "flex", flexDirection: "column",
        }}>
          {NAV_ITEMS.map(n => (
            <Link key={n.label} to="/#" onClick={() => setMobileOpen(false)} style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
              fontSize: "1.05rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.textSecond, textDecoration: "none",
              padding: "13px 0", borderBottom: `1px solid rgba(56,189,248,0.08)`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              {n.label}
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.55rem", color: T.textDim }}>{n.sub}</span>
            </Link>
          ))}
          <Link to="/admin" onClick={() => setMobileOpen(false)} style={{
            fontFamily: "'Share Tech Mono',monospace", fontWeight: 600,
            fontSize: "0.9rem", letterSpacing: "0.08em",
            color: T.textDim, textDecoration: "none",
            padding: "13px 0", borderBottom: `1px solid rgba(56,189,248,0.08)`,
          }}>
            {t('nav.admin')}
          </Link>
        </div>
      )}
    </header>
  );
}
