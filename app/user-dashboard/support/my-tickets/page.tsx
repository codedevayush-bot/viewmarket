'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import styles from './MyTickets.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Ticket {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

export default function MyTicketsPage() {
  const router = useRouter();
  const {
    data: tickets,
    error,
    isLoading,
  } = useSWR<Ticket[]>('/api/tickets', fetcher, {
    refreshInterval: 10000, // refresh every 10 seconds
  });

  const [searchTerm, setSearchTerm] = useState('');

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return styles.statusOpen;
      case 'in_progress':
        return styles.statusInProgress;
      case 'resolved':
        return styles.statusResolved;
      case 'closed':
        return styles.statusClosed;
      default:
        return styles.statusOpen;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error)
    return <div className={styles.container}>Failed to load tickets.</div>;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Fetching your tickets...</span>
      </div>
    );
  }

  const filteredTickets = tickets?.filter(
    (ticket: Ticket) =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Tickets</h1>
        <Link
          href="/user-dashboard/support/raise-ticket"
          className={styles.newTicketBtn}
        >
          Raise New Ticket
        </Link>
      </div>

      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
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
          className={styles.searchInput}
          placeholder="Search tickets by subject or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Ticket ID</th>
              <th className={styles.th}>Subject</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets?.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  {searchTerm
                    ? 'No tickets match your search.'
                    : "You haven't raised any tickets yet."}
                </td>
              </tr>
            ) : (
              filteredTickets?.map((ticket: Ticket) => (
                <tr
                  key={ticket.id}
                  className={styles.row}
                  onClick={() =>
                    router.push(
                      `/user-dashboard/support/my-tickets/${ticket.id}`
                    )
                  }
                >
                  <td className={styles.td}>#{ticket.id.substring(0, 8)}</td>
                  <td className={styles.td}>{ticket.title}</td>
                  <td
                    className={styles.td}
                    style={{ color: 'var(--text-secondary)' }}
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
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {formatDate(ticket.created_at)}
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
