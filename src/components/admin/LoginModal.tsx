import React from 'react';
import { SignIn, useClerk } from '@clerk/clerk-react';
import { T } from '../../constants/tokens';

interface LoginModalProps {
  onLogin?: () => Promise<boolean>;
  onClose?: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const { closeSignIn } = useClerk();

  const handleAfterSignIn = () => {
    onClose?.();
    onLogin?.();
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
        padding: '32px',
        maxWidth: 420,
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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

        {/* Clerk SignIn Component */}
        <SignIn
          afterSignInUrl="/admin/dashboard"
          signUpUrl="/sign-up"
          redirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              card: {
                background: 'transparent',
                boxShadow: 'none',
                border: 'none',
              },
              headerTitle: {
                display: 'none',
              },
              headerSubtitle: {
                display: 'none',
              },
              socialButtonsBlockButton: {
                background: 'rgba(56,189,248,0.1)',
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.7rem',
                padding: '12px 20px',
                color: T.textSecond,
              },
              socialButtonsBlockButtonText: {
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.7rem',
              },
              formButtonPrimary: {
                background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`,
                color: '#050b14',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                borderRadius: 8,
                padding: '14px 20px',
              },
              dividerLine: {
                background: `1px solid ${T.border}33`,
              },
              dividerText: {
                color: T.textDim,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.65rem',
              },
              formFieldLabel: {
                color: T.neonBlue,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              },
              formFieldInput: {
                background: 'rgba(5,11,20,0.6)',
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                color: T.textPrimary,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.9rem',
              },
              formFieldInputFocus: {
                borderColor: T.neonBlue,
                boxShadow: `0 0 10px ${T.neonBlue}22`,
              },
              footer: {
                display: 'none',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
