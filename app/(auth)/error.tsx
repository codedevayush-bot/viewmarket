'use client';

import { useEffect } from 'react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AuthError]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>
          Authentication Error
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: 24,
          }}
        >
          Something went wrong during authentication. Please try signing in
          again.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '8px 20px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            background: 'var(--bg-surface-alt)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
