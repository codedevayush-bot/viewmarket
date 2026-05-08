import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div className={styles.heroWrapper}>
      {/* Hero Header Section */}
      <section className={styles.heroHeader}>
        <div className={styles.heroHeaderContent}>
          <div className={styles.heroTextContent}>
            <h1 className={styles.heroMainTitle}>
              The product development
              <br />
              system for teams and agents
            </h1>
            <p className={styles.heroMainSubtitle}>
              Purpose-built for planning and building products. Designed for the
              AI era.
            </p>
          </div>

          {/* Top Right Notification */}
          <div className={styles.heroNotificationBadge}>
            <span className={styles.notificationIndicator}></span>
            <span className={styles.notificationLabel}>
              Issue tracking is dead
            </span>
            <a href="#" className={styles.notificationCta}>
              viewmarket.app/next →
            </a>
          </div>
        </div>
      </section>

      {/* App Interface Mockup */}
      <section className={styles.appMockup}>
        <div className={styles.appContainer}>
          {/* Left Sidebar */}
          <aside className={styles.appSidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarWorkspace}>
                <span className={styles.workspaceIcon}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 100 100"
                    fill="none"
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  >
                    <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="white" />
                    <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="#0d0d0d" />
                  </svg>
                </span>
                <span className={styles.workspaceName}>View Market</span>
                <span className={styles.workspaceDropdown}>▼</span>
              </div>
              <button className={styles.sidebarSearch}>
                <span className="search-icon">⌘</span>
              </button>
              <button className={styles.sidebarNew}>
                <span>+</span>
              </button>
            </div>

            <nav className={styles.sidebarNav}>
              <div className={styles.navSection}>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>📥</span>
                  <span>Inbox</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>📋</span>
                  <span>My Issues</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>👁</span>
                  <span>Reviews</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>⚡</span>
                  <span>Pulse</span>
                </a>
              </div>

              <div className={styles.navSection}>
                <div className={styles.navSectionHeader}>
                  <span>Workspaces</span>
                  <span className={styles.sectionToggle}>▼</span>
                </div>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>🚀</span>
                  <span>Initiatives</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>📊</span>
                  <span>Projects</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span>More</span>
                </a>
              </div>

              <div className={styles.navSection}>
                <div className={styles.navSectionHeader}>
                  <span>Favorites</span>
                  <span className={styles.sectionToggle}>+</span>
                </div>
                <a href="#" className={`${styles.navItem} ${styles.active}`}>
                  <span className={styles.navIcon}>📈</span>
                  <span>Optimize WebSocket</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>🤖</span>
                  <span>Algo strategies</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>🔌</span>
                  <span>Broker API integration</span>
                </a>
                <a href="#" className={styles.navItem}>
                  <span className={styles.navIcon}>📊</span>
                  <span>Risk analysis</span>
                </a>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className={styles.appMain}>
            <div className={styles.issueHeader}>
              <div className={styles.issueTitleBar}>
                <span className={`${styles.issueBadge} ${styles.starred}`}>
                  📈 Optimize WebSocket
                </span>
                <div className={styles.issueMeta}>
                  <span className={styles.issueId}>01 / 82</span>
                  <button className={styles.iconBtn}>↑</button>
                  <button className={styles.iconBtn}>↓</button>
                  <span className={styles.issueCode}>ALGO-102</span>
                  <button className={styles.iconBtn}>🔗</button>
                  <button className={styles.iconBtn}>📋</button>
                  <button className={styles.iconBtn}>⋯</button>
                </div>
              </div>
            </div>

            <div className={styles.issueContent}>
              <h2 className={styles.issueHeading}>Optimize WebSocket execution</h2>
              <p className={styles.issueDescription}>
                Reduce latency in the <code className={styles.inlineCode}>OrderManager</code> by implementing a priority queue for high-frequency broker updates during peak market volatility.
              </p>

              <div className={styles.issueSection}>
                <h3 className={styles.sectionTitle}>Activity</h3>
                <div className={styles.activityFeed}>
                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>👤</span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>View Market</strong> created the issue via Slack
                        on behalf of <strong>karri</strong>
                      </span>
                      <span className={styles.activityTime}>2min ago</span>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>🔧</span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>Triage Intelligence</strong> added the label
                        Performance and iOS
                      </span>
                      <span className={styles.activityTime}>2min ago</span>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>👤</span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>karri</strong> · 4 min ago
                      </span>
                      <p className={styles.activityComment}>
                        Right now we show a spinner forever, which makes it look
                        like the car disappeared...
                      </p>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>👤</span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>jori</strong> · just now
                      </span>
                      <p className={styles.activityComment}>
                        @Codex can you take a stab at this?
                      </p>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>🤖</span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>jori</strong> connected <strong>Codex</strong> ·
                        just now
                      </span>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityIcon}>🤖</span>
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>
                        <strong>Codex</strong>
                      </span>
                      <p className={styles.activityComment}>
                        Examining issue{" "}
                        <code className={styles.inlineCode}>ENG-2703</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Issue Details */}
            <aside className={styles.issueSidebar}>
              <div className={styles.issueProperties}>
                <div className={styles.propertyItem}>
                  <span className={`${styles.propertyIcon} ${styles.status}`}>
                    ⚠
                  </span>
                  <span className={styles.propertyLabel}>In Progress</span>
                </div>
                <div className={styles.propertyItem}>
                  <span className={`${styles.propertyIcon} ${styles.priority}`}>
                    📊
                  </span>
                  <span className={styles.propertyLabel}>High</span>
                </div>
                <div className={styles.propertyItem}>
                  <span className={`${styles.propertyIcon} ${styles.assignee}`}>
                    👤
                  </span>
                  <span className={styles.propertyLabel}>jori</span>
                </div>
                <div className={styles.propertyItem}>
                  <span className={`${styles.propertyIcon} ${styles.agent}`}>
                    🤖
                  </span>
                  <span className={styles.propertyLabel}>Codex</span>
                </div>
              </div>

              <div className={styles.labelsSection}>
                <h4 className={styles.sidebarSectionTitle}>Labels</h4>
                <div className={styles.labelsList}>
                  <span className={styles.labelTag}>Codex</span>
                </div>
              </div>
            </aside>

            {/* Code Panel Overlay */}
            <div className={styles.codePanel}>
              <div className={styles.codePanelHeader}>
                <span className={styles.codePanelTitle}>🤖 Codex</span>
                <button className={styles.codePanelClose}>×</button>
              </div>
              <div className={styles.codePanelContent}>
                <pre className={styles.codeBlock}>
                  <code>
                    const order = orders.find(o =&gt; o.id === orderId);
                    if (!order) return null; // Locating order logic
                    for market_volatility // Optimized in 12ms Summary Replaced{" "}
                    <span className={styles.codeHighlight}>sequentialSync</span>{" "}
                    with{" "}
                    <span className={styles.codeHighlight}>priorityQueue</span> and
                    gated the execution on{" "}
                    <span className={styles.codeHighlight}>
                      OrderState.READY
                    </span>
                    . Passed validation and{" "}
                    <span className={styles.codeHighlight}>backtestStatus</span> to
                    ensure low-latency routing.
                  </code>
                </pre>
                <div className={styles.codeChanges}>
                  <p className={styles.changesSummary}>Changed 1 file +4 -3</p>
                  <p className={styles.changesFile}>
                    <span className={styles.fileIcon}>▸</span> Merged Render UI
                    before vehicle state sync
                  </p>
                  <p className={styles.changesDetail}>
                    <code>master → codex/ENG-2703-render-sync.9916...</code>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
