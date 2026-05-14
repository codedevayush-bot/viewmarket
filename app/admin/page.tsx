import { auth } from '@/auth';
import styles from '../user-dashboard/UserDashboard.module.css';
import { query } from '@/lib/db';

async function getSystemStats() {
  try {
    const [userCount, brokerCount, tradeCount] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM broker_connections'),
      query('SELECT COUNT(*) FROM trades'),
    ]);

    return {
      totalUsers: userCount.rows[0].count,
      activeConnections: brokerCount.rows[0].count,
      totalTrades: tradeCount.rows[0].count,
      systemHealth: 'Optimal',
    };
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return {
      totalUsers: 'N/A',
      activeConnections: 'N/A',
      totalTrades: 'N/A',
      systemHealth: 'Degraded',
    };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getSystemStats();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Console</h1>
        <p className={styles.subtitle}>
          System-wide overview for {session?.user?.name || session?.user?.email}
        </p>
      </header>

      {/* System Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalUsers}</div>
          <div className={styles.statLabel}>Total Registered Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.activeConnections}</div>
          <div className={styles.statLabel}>Active Broker Connections</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalTrades}</div>
          <div className={styles.statLabel}>Total Trades Executed</div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statNumber}
            style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}
          >
            {stats.systemHealth}
          </div>
          <div className={styles.statLabel}>System Health Status</div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Administrative Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>👥</span>
            <span className={styles.actionText}>Manage Users</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>🔧</span>
            <span className={styles.actionText}>System Config</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📊</span>
            <span className={styles.actionText}>Global Analytics</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>🛡️</span>
            <span className={styles.actionText}>Security Audit</span>
          </button>
        </div>
      </section>

      {/* Placeholder for System Logs */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>System Events</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>ℹ️</div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>
                Admin Dashboard successfully initialized for{' '}
                <strong>{session?.user?.email}</strong>
              </p>
              <span className={styles.activityTime}>Just now</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>✓</div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>
                Database migration for RBAC completed successfully
              </p>
              <span className={styles.activityTime}>Few minutes ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
