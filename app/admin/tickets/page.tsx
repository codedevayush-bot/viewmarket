"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import styles from "./AdminTickets.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Ticket {
  id: string;
  title: string;
  user_id: string;
  category: string;
  status: string;
  created_at: string;
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: tickets,
    error,
    isLoading,
  } = useSWR<Ticket[]>(
    `/api/tickets${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { refreshInterval: 10000 },
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return styles.statusOpen;
      case "in_progress":
        return styles.statusInProgress;
      case "resolved":
        return styles.statusResolved;
      case "closed":
        return styles.statusClosed;
      default:
        return styles.statusOpen;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (error)
    return <div className={styles.container}>Failed to load tickets.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tickets Management</h1>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Subject</th>
              <th className={styles.th}>User ID</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Loading...
                </td>
              </tr>
            ) : tickets?.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No tickets found matching the criteria.
                </td>
              </tr>
            ) : (
              tickets?.map((ticket: Ticket) => (
                <tr
                  key={ticket.id}
                  className={styles.row}
                  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                >
                  <td className={styles.td}>#{ticket.id.substring(0, 8)}</td>
                  <td className={styles.td}>{ticket.title}</td>
                  <td
                    className={styles.td}
                    style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}
                  >
                    {ticket.user_id}
                  </td>
                  <td
                    className={styles.td}
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {ticket.category}
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.status} ${getStatusClass(ticket.status)}`}
                    >
                      {formatStatus(ticket.status)}
                    </span>
                  </td>
                  <td
                    className={styles.td}
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
