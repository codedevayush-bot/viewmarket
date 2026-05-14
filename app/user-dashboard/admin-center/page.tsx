'use client';

import { useState } from 'react';
import styles from '../TradingWorkspace.module.css';

type AdminTab = 'overview' | 'settings' | 'config';

interface AdminSetting {
  id: string;
  name: string;
  description: string;
  type: 'toggle' | 'input' | 'select';
  value: boolean | string;
}

interface Holiday {
  date: string;
  name: string;
  day: string;
}

const tabConfig: { id: AdminTab; label: string; description: string }[] = [
  { id: 'overview', label: 'Overview', description: 'Admin dashboard' },
  { id: 'settings', label: 'Settings', description: 'System settings' },
  { id: 'config', label: 'Config', description: 'Market configuration' },
];

const mockSettings: AdminSetting[] = [
  {
    id: '1',
    name: 'Allow Demo Trading',
    description: 'Enable paper trading for users',
    type: 'toggle',
    value: true,
  },
  {
    id: '2',
    name: 'Auto-square off',
    description: 'Auto-square positions at market close',
    type: 'toggle',
    value: true,
  },
  {
    id: '3',
    name: 'Max Open Positions',
    description: 'Maximum positions per user',
    type: 'input',
    value: '10',
  },
  {
    id: '4',
    name: 'Default Broker',
    description: 'Default broker for new users',
    type: 'select',
    value: 'zerodha',
  },
];

const mockHolidays: Holiday[] = [
  { date: '2024-05-15', name: 'Ramzan Eid', day: 'Wednesday' },
  { date: '2024-08-15', name: 'Independence Day', day: 'Thursday' },
  { date: '2024-10-02', name: 'Mahatma Gandhi Jayanti', day: 'Wednesday' },
  { date: '2024-11-01', name: 'Diwali', day: 'Friday' },
  { date: '2024-12-25', name: 'Christmas', day: 'Wednesday' },
];

const mockMarketTimings = [
  { segment: 'Equity', open: '09:15', close: '15:30', status: 'Active' },
  { segment: 'Futures', open: '09:15', close: '15:30', status: 'Active' },
  { segment: 'Options', open: '09:15', close: '15:30', status: 'Active' },
  { segment: 'Commodity', open: '09:00', close: '17:00', status: 'Active' },
];

export default function AdminCenterPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Admin</p>
          <h1 className={styles.title}>Admin Center</h1>
          <p className={styles.subtitle}>
            Manage system settings, market configuration, and platform
            administration.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.adminBadge}>Admin Access</span>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Admin tools">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.tabButtonActive : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Users</span>
          <strong className={styles.metricValue}>1,248</strong>
          <span className={styles.metricDetail}>+45 this month</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Active Brokers</span>
          <strong className={styles.metricValue}>12</strong>
          <span className={styles.metricDetail}>3 pending</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Open Tickets</span>
          <strong className={styles.metricValue}>23</strong>
          <span className={styles.metricDetail}>5 urgent</span>
        </div>
      </section>

      <section className={styles.workspaceGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>
                {tabConfig.find((t) => t.id === activeTab)?.label}
              </p>
              <h2 className={styles.panelTitle}>
                {tabConfig.find((t) => t.id === activeTab)?.description}
              </h2>
            </div>
            <span className={styles.badge}>
              {activeTab === 'overview' && 'Summary'}
              {activeTab === 'settings' && '8 settings'}
              {activeTab === 'config' && 'Market'}
            </span>
          </div>

          <div className={styles.list}>
            {activeTab === 'overview' && (
              <div className={styles.adminOverview}>
                <div className={styles.overviewCard}>
                  <h3>Recent Activity</h3>
                  <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                      <span className={styles.activityIcon}>👤</span>
                      <div className={styles.activityInfo}>
                        <p>New user registered</p>
                        <span>rahul@example.com</span>
                      </div>
                      <span className={styles.activityTime}>5 mins ago</span>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={styles.activityIcon}>🔗</span>
                      <div className={styles.activityInfo}>
                        <p>Broker connected</p>
                        <span>Upstox API linked</span>
                      </div>
                      <span className={styles.activityTime}>12 mins ago</span>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={styles.activityIcon}>⚙️</span>
                      <div className={styles.activityInfo}>
                        <p>Settings updated</p>
                        <span>Max position limit changed</span>
                      </div>
                      <span className={styles.activityTime}>1 hour ago</span>
                    </div>
                  </div>
                </div>
                <div className={styles.overviewCard}>
                  <h3>Quick Stats</h3>
                  <div className={styles.quickStats}>
                    <div className={styles.statItem}>
                      <span>Total Strategies</span>
                      <strong>342</strong>
                    </div>
                    <div className={styles.statItem}>
                      <span>Active Trades Today</span>
                      <strong>1,856</strong>
                    </div>
                    <div className={styles.statItem}>
                      <span>System Uptime</span>
                      <strong>99.8%</strong>
                    </div>
                    <div className={styles.statItem}>
                      <span>API Calls Today</span>
                      <strong>45.2K</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsList}>
                {mockSettings.map((setting) => (
                  <div key={setting.id} className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <p className={styles.settingName}>{setting.name}</p>
                      <p className={styles.settingDesc}>
                        {setting.description}
                      </p>
                    </div>
                    <div className={styles.settingControl}>
                      {setting.type === 'toggle' && (
                        <label className={styles.toggleSwitch}>
                          <input
                            type="checkbox"
                            defaultChecked={setting.value as boolean}
                          />
                          <span className={styles.toggleSlider} />
                        </label>
                      )}
                      {setting.type === 'input' && (
                        <input
                          type="text"
                          className={styles.settingInput}
                          defaultValue={setting.value as string}
                        />
                      )}
                      {setting.type === 'select' && (
                        <select
                          className={styles.settingSelect}
                          defaultValue={setting.value as string}
                        >
                          <option value="zerodha">Zerodha</option>
                          <option value="upstox">Upstox</option>
                          <option value="aliceblue">Alice Blue</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'config' && (
              <div className={styles.configSection}>
                <div className={styles.configBlock}>
                  <h3 className={styles.configTitle}>Market Timings</h3>
                  <div className={styles.timingTable}>
                    <div className={styles.timingHeader}>
                      <span>Segment</span>
                      <span>Open</span>
                      <span>Close</span>
                      <span>Status</span>
                    </div>
                    {mockMarketTimings.map((timing, i) => (
                      <div key={i} className={styles.timingRow}>
                        <span>{timing.segment}</span>
                        <span>{timing.open}</span>
                        <span>{timing.close}</span>
                        <span className={styles.statusBadgeActive}>
                          {timing.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.configBlock}>
                  <h3 className={styles.configTitle}>Market Holidays 2024</h3>
                  <div className={styles.holidayList}>
                    {mockHolidays.map((holiday, i) => (
                      <div key={i} className={styles.holidayItem}>
                        <div className={styles.holidayDate}>
                          <span className={styles.holidayMonth}>
                            {new Date(holiday.date).toLocaleString('default', {
                              month: 'short',
                            })}
                          </span>
                          <span className={styles.holidayDay}>
                            {new Date(holiday.date).getDate()}
                          </span>
                        </div>
                        <div className={styles.holidayInfo}>
                          <p className={styles.holidayName}>{holiday.name}</p>
                          <p className={styles.holidayWeekday}>{holiday.day}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.panelActions}>
            <button className={styles.primaryButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Save Changes
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
