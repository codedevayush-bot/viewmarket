'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './components/ErrorPage.module.css';

const statusItems = ['HTTP 404', 'Navigation mismatch', 'Verify URL'];

export default function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.container}>
      <div className={styles.backgroundGlow} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      <section className={styles.panel} aria-labelledby="not-found-title">
        <div className={styles.heroRow}>
          <div className={styles.codeBlock}>
            <p className={styles.eyebrow}>ERROR / ROUTE_NOT_FOUND</p>
            <div className={styles.code}>404</div>
            <p className={styles.signal}>Requested resource is unavailable.</p>
          </div>

          <div className={styles.content}>
            <span className={styles.kicker}>
              Enterprise navigation fallback
            </span>
            <h1 id="not-found-title" className={styles.title}>
              Requested page not found
            </h1>
            <p className={styles.description}>
              The destination you requested does not exist, may have been moved,
              or is no longer available in the current navigation structure.
            </p>

            <div className={styles.metaRow}>
              {statusItems.map((item) => (
                <span key={item} className={styles.metaChip}>
                  {item}
                </span>
              ))}
            </div>

            <div className={styles.actionRow}>
              <Link href="/" className={styles.primaryAction}>
                Return home
              </Link>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => router.back()}
              >
                Go back
              </button>
            </div>

            <div className={styles.footerNote}>
              <span className={styles.footerLabel}>Recommendation</span>
              <p className={styles.footerText}>
                Confirm the URL or restart navigation from the main dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
