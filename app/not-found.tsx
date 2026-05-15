import Link from 'next/link';
import styles from './components/ErrorPage.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.badge}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className={styles.button}>
          Go home
        </Link>
      </div>
    </div>
  );
}
