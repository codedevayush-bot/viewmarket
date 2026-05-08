"use client";

import { useSearchParams } from "next/navigation";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./UserDashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const isPopout = searchParams.get("popout") === "true";

  return (
    <div className={styles.dashboardPage}>
      {/* Sidebar persists across all sub-pages, hidden in popout mode */}
      {!isPopout && <Sidebar />}

      {/* Main Content Area */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
