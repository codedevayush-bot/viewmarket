import { query } from "@/lib/db";
import styles from "../Admin.module.css";

async function getUsers() {
  try {
    const result = await query(
      'SELECT id, name, email, role, "createdAt", "lastLoginAt", is_active FROM users ORDER BY "createdAt" DESC',
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <p className={styles.subtitle}>
          Manage your platform users and their access levels.
        </p>
      </header>

      {/* Excel-like Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className={styles.searchInput}
          />
        </div>
        <div className={styles.metaInfo}>
          Showing {users.length} total records
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Activity</th>
              <th>Created Date</th>
              <th>Internal ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td style={{ textAlign: "center", opacity: 0.3 }}>
                  {index + 1}
                </td>
                <td>{user.name || "-"}</td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>
                  <span
                    className={`${styles.roleBadge} ${
                      user.role === "admin" ? styles.roleAdmin : styles.roleUser
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles.statusIndicator}>
                    <div
                      className={`${styles.statusDot} ${
                        user.is_active !== false
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    />
                    <span
                      style={{ opacity: user.is_active !== false ? 1 : 0.4 }}
                    >
                      {user.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className={styles.idCell}>{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
