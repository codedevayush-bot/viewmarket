import styles from "../Admin.module.css";

export default function AdminSettingsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System Settings</h1>
        <p className={styles.subtitle}>
          Manage global platform configurations and security policies.
        </p>
      </header>
      <div className={styles.loading}>
        Global system settings are managed via configuration files.
      </div>
    </div>
  );
}
