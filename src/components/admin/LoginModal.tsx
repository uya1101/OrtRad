import React, { useState } from 'react';
import { T } from '../../constants/tokens';

interface LoginModalProps {
  onLogin: (password: string) => Promise<boolean>;
  onClose?: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('パスワードを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    const success = await onLogin(password);
    setIsLoading(false);

    if (success) {
      onClose?.();
    } else {
      setError('パスワードが正しくありません');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5,11,20,0.98)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: 'rgba(8,15,30,0.95)',
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: '40px',
        maxWidth: 400,
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
            fontSize: '1.8rem', color: T.textPrimary,
            letterSpacing: '0.05em', marginBottom: 8,
          }}>
            ADMIN ACCESS
          </h1>
          <p style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: '0.55rem', color: T.textDim,
            letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0,
          }}>
            Restricted Area · Authorized Personnel Only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: '0.55rem', color: T.neonBlue,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="•••••••••••••"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(5,11,20,0.60)',
                border: error ? `1px solid ${T.neonCoral}` : `1px solid ${T.border}`,
                borderRadius: 8,
                color: T.textPrimary,
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = T.neonBlue;
              }}
              onBlur={(e) => {
                if (!error) e.currentTarget.style.borderColor = T.border;
              }}
            />
            {error && (
              <p style={{
                fontFamily: "'Noto Sans JP',sans-serif",
                fontSize: '0.8rem', color: T.neonCoral,
                marginTop: 8, margin: 0,
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`,
              border: 'none', borderRadius: 8, cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: '0.65rem', letterSpacing: '0.08em',
              color: '#050b14', fontWeight: 700,
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'AUTHENTICATING...' : 'ACCESS ADMIN PANEL'}
          </button>
        </form>
      </div>
    </div>
  );
}
