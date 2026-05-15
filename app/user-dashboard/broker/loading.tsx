import styles from '@/app/components/ErrorPage.module.css';

export default function BrokerLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
    </div>
  );
}
