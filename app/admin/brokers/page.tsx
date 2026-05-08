import styles from "../Admin.module.css";

export default function AdminBrokersPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Broker Management</h1>
        <p className={styles.subtitle}>
          Configure and monitor system-wide broker integrations.
        </p>
      </header>
      <div className={styles.loading}>
        Broker management interface is under development.
      </div>
    </div>
  );
}
