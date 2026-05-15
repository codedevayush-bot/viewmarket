import AdminSidebar from '../components/AdminSidebar/AdminSidebar';
import styles from './AdminLayout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardPage}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
