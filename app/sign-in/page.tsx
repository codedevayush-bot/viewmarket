"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./SignIn.module.css";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/user-dashboard";
  const error = searchParams.get("error");

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl });
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthSignin":
        return "Error starting OAuth sign-in. Please try again.";
      case "OAuthCallback":
        return "Error completing OAuth sign-in. Please try again.";
      case "OAuthCreateAccount":
        return "Error creating account. Please try again.";
      case "OAuthAccountNotLinked":
        return "Email already exists with different provider. Please sign in with the same account you used originally.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An error occurred during sign in. Please try again.";
    }
  };

  return (
    <div className={styles.signinPage}>
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
          <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="white" />
          <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="var(--bg-page)" />
        </svg>
        <span className={styles.logoText}>ViewMarket</span>
      </Link>

      {/* Sign In Card */}
      <div className={styles.signinCard}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue to your account</p>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>{getErrorMessage(error)}</div>
        )}

        {/* Social Login Buttons */}
        <div className={styles.socialButtons}>
          <button className={styles.socialButton} onClick={handleGoogleSignIn}>
            <svg
              className={styles.socialIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </button>

          <button className={styles.socialButton} onClick={handleGitHubSignIn}>
            <svg
              className={styles.socialIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                fill="currentColor"
              />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            By signing in, you agree to our{" "}
            <Link href="/legal/terms-of-service" className={styles.footerLink}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className={styles.footerLink}>
              Privacy Policy
            </Link>
          </p>
        </div>
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

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.signinPage}>
          <div className={styles.signinCard}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Loading...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
