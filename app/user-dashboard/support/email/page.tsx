'use client';

import { useState } from 'react';
import styles from '../../UserDashboard.module.css';
import pageStyles from './EmailPage.module.css';

const emailCategories = [
  {
    category: 'Support',
    contacts: [
      { label: 'General Support', email: 'support@viewmarket.in' },
      { label: 'Technical Support', email: 'tech.support@viewmarket.in' },
      { label: 'Broker Integrations', email: 'integrations@viewmarket.in' },
    ],
  },
  {
    category: 'Management',
    contacts: [
      { label: 'Chief Executive Officer', email: 'ceo@viewmarket.in' },
      { label: 'Chief Technical Officer', email: 'cto@viewmarket.in' },
      { label: 'Operations Head', email: 'ops@viewmarket.in' },
    ],
  },
  {
    category: 'Sales & Services',
    contacts: [
      { label: 'Enterprise Sales', email: 'enterprise@viewmarket.in' },
      { label: 'Partnerships', email: 'partners@viewmarket.in' },
      { label: 'Account Management', email: 'accounts@viewmarket.in' },
    ],
  },
  {
    category: 'Legal & Compliance',
    contacts: [
      { label: 'Legal Department', email: 'legal@viewmarket.in' },
      { label: 'Privacy Officer', email: 'privacy@viewmarket.in' },
      { label: 'Compliance Team', email: 'compliance@viewmarket.in' },
    ],
  },
  {
    category: 'Human Resources',
    contacts: [
      { label: 'Careers / Jobs', email: 'careers@viewmarket.in' },
      { label: 'HR Inquiry', email: 'hr@viewmarket.in' },
      { label: 'General Information', email: 'info@viewmarket.in' },
    ],
  },
];

export default function EmailUsPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 3000);
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Email Us</h1>
        <p className={styles.subtitle}>
          Systemized contact directory for all platform departments.
        </p>
      </header>

      <div className={pageStyles.listContainer}>
        {emailCategories.map((group) => (
          <div key={group.category} className={pageStyles.categorySection}>
            <div className={pageStyles.categoryHeader}>{group.category}</div>
            {group.contacts.map((contact) => (
              <div key={contact.email} className={pageStyles.row}>
                <div className={pageStyles.labelColumn}>{contact.label}</div>
                <div className={pageStyles.emailColumn}>{contact.email}</div>

                <div className={pageStyles.actionsColumn}>
                  <button
                    className={`${pageStyles.actionButton} ${pageStyles.copyButton}`}
                    onClick={() => copyToClipboard(contact.email)}
                    title="Copy email address"
                  >
                    <svg
                      className={pageStyles.icon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </button>

                  <a
                    href={`mailto:${contact.email}`}
                    className={`${pageStyles.actionButton} ${pageStyles.sendButton}`}
                    title="Send an email"
                  >
                    <svg
                      className={pageStyles.icon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Send
                  </a>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {copiedEmail && (
        <div className={pageStyles.toast}>Copied to clipboard</div>
      )}
    </div>
  );
}
