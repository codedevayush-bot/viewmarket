'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './error.module.css';

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthSignin':
        return 'An error occurred during sign in. Please try again.';
      case 'OAuthCallback':
        return 'An error occurred during authentication. Please try again.';
      case 'OAuthCreateAccount':
        return "We couldn't create your account. Please try again.";
      case 'EmailCreateAccount':
        return "We couldn't create your account. Please try again.";
      case 'Callback':
        return 'An error occurred during callback. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in using the same method you used originally.';
      case 'EmailSignin':
        return 'Check your email address.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check your details.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className={styles.errorPage}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="var(--logo-diamond)" />
          <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="var(--bg-page)" />
        </svg>
        <span className={styles.logoText}>ViewMarket</span>
      </Link>

      {/* Error Card */}
      <div className={styles.errorCard}>
        {/* Error Icon */}
        <div className={styles.errorIcon}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M15 9L9 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 9L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Authentication Error</h1>
        <p className={styles.message}>{getErrorMessage(error)}</p>

        <Link href="/sign-in" className={styles.backButton}>
          Back to Sign In
        </Link>
      </div>

      {/* Back Link */}
      <Link href="/" className={styles.backLink}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to home
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.errorPage}>
          <div className={styles.errorCard}>
            <h1 className={styles.title}>Authentication Error</h1>
            <p className={styles.message}>Loading...</p>
          </div>
        </div>
      }
    >
      <ErrorMessage />
    </Suspense>
  );
}
