import styles from './ProductOpsSection.module.css';

export default function ProductOpsSection() {
  return (
    <>
      {/* Section 1: Make product operations self-driving */}
      <section className={styles.productOpsSection}>
        <div className={styles.productOpsContainer}>
          <div className={styles.productOpsHeader}>
            <h2 className={styles.productOpsTitle}>
              Make trading
              <br />
              operations self-driving
            </h2>
            <div className={styles.productOpsDescription}>
              <p className={styles.productOpsText}>
                Turn market signals and strategy alerts into actionable tasks
                that are routed, executed, and monitored for the right account.
              </p>
              <a href="#" className={styles.productOpsLink}>
                1.0 Execution →
              </a>
            </div>
          </div>

          <div className={styles.productOpsContent}>
            {/* Screenshot Container */}
            <div className={styles.screenshotContainer}>
              {/* Left: Chat Thread */}
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatIcon}>💬</span>
                  <span className={styles.chatTitle}>Thread in #feedback</span>
                  <button className={styles.chatMenu}>⋯</button>
                </div>

                <div className={styles.chatMessages}>
                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar1}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>lena</span>
                        <span className={styles.messageTime}>3:45 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        Anyone else noticing the Zerodha adapter is lagging
                        during the pre-market open?
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar2}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>didier</span>
                        <span className={styles.messageTime}>3:45 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        Yea, we&apos;re still blocking the execution thread on a
                        full WebSocket sync every time...
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar3}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>andreas</span>
                        <span className={styles.messageTime}>3:45 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        Feels like we could optimize the order routing and load
                        balance across multiple instances. Probably worth
                        tracking latency pikes so we know how often this
                        happens!
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatCommand}>
                    <span className={styles.commandMention}>@ViewMarket</span>
                    <span className={styles.commandText}>
                      {' '}
                      create urgent issues and assign to me
                    </span>
                  </div>
                </div>

                <div className={styles.chatInput}>
                  <button className={styles.inputBtn}>+</button>
                  <button className={styles.inputBtn}>Aa</button>
                  <button className={styles.inputBtn}>😊</button>
                  <button className={styles.inputBtn}>@</button>
                  <button className={styles.inputBtn}>📎</button>
                  <button className={styles.inputBtn}>🎤</button>
                  <button className={styles.inputBtn}>✏️</button>
                  <button className={styles.sendBtn}>▶</button>
                </div>
              </div>

              {/* Right: Issue Cards */}
              <div className={styles.issuesPanel}>
                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>⭕</span>
                    <span className={styles.columnTitle}>Todo</span>
                    <span className={styles.columnCount}>71</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2702</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Remove UI inconsistencies
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelBug}`}
                      >
                        Bug
                      </span>
                      <span
                        className={`${styles.issueLabel} ${styles.labelDesign}`}
                      >
                        Design
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2701</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      TypeError: Cannot read properties
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelBug}`}
                      >
                        Bug
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2613</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Upgrade to Claude Opus 4.5
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelAi}`}
                      >
                        AI
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2589</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Optimize load times</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelPerformance}`}
                      >
                        Performance
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>🟡</span>
                    <span className={styles.columnTitle}>In Progress</span>
                    <span className={styles.columnCount}>3</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2612</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Remove commentData from GraphQL API
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelApi}`}
                      >
                        #2048
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2611</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Launch page assets</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelDesign}`}
                      >
                        Design
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-2587</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Prevent duplicate ride requests on poor...
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelBug}`}
                      >
                        Bug
                      </span>
                      <span
                        className={`${styles.issueLabel} ${styles.labelApi}`}
                      >
                        #2048
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature List Below Screenshot */}
            <div className={styles.bottomSection}>
              <div className={styles.featureList}>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>1.1</span>
                    <span className={styles.featureLabel}>
                      View Market Agent
                    </span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>1.3</span>
                    <span className={styles.featureLabel}>
                      Customer Requests
                    </span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>1.2</span>
                    <span className={styles.featureLabel}>Triage</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>1.4</span>
                    <span className={styles.featureLabel}>
                      View Market Asks
                    </span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Build with AI agents */}
      <section className={styles.productOpsSection}>
        <div className={styles.productOpsContainer}>
          <div className={styles.productOpsHeader}>
            <h2 className={styles.productOpsTitle}>
              Build with
              <br />
              Algo agents
            </h2>
            <div className={styles.productOpsDescription}>
              <p className={styles.productOpsText}>
                Empower your strategy with AI agents that can draft backtests,
                write execution logic, and ship algo features autonomously.
              </p>
              <a href="#" className={styles.productOpsLink}>
                2.0 Agents →
              </a>
            </div>
          </div>

          <div className={styles.productOpsContent}>
            <div className={styles.screenshotContainer}>
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatIcon}>💬</span>
                  <span className={styles.chatTitle}>
                    Thread in #engineering
                  </span>
                  <button className={styles.chatMenu}>⋯</button>
                </div>

                <div className={styles.chatMessages}>
                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar1}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>sarah</span>
                        <span className={styles.messageTime}>2:30 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        Can we add Binance futures support to the dashboard?
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar2}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>alex</span>
                        <span className={styles.messageTime}>2:32 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        Good idea! We should also make sure it supports
                        multi-tenant credential encryption.
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatCommand}>
                    <span className={styles.commandMention}>@ViewMarket</span>
                    <span className={styles.commandText}>
                      {' '}
                      create feature request and assign to design team
                    </span>
                  </div>
                </div>

                <div className={styles.chatInput}>
                  <button className={styles.inputBtn}>+</button>
                  <button className={styles.inputBtn}>Aa</button>
                  <button className={styles.inputBtn}>😊</button>
                  <button className={styles.inputBtn}>@</button>
                  <button className={styles.inputBtn}>📎</button>
                  <button className={styles.inputBtn}>🎤</button>
                  <button className={styles.inputBtn}>✏️</button>
                  <button className={styles.sendBtn}>▶</button>
                </div>
              </div>

              <div className={styles.issuesPanel}>
                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>⭕</span>
                    <span className={styles.columnTitle}>Backlog</span>
                    <span className={styles.columnCount}>45</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>DES-401</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Dark mode implementation
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelDesign}`}
                      >
                        Design
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>DES-402</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Update color tokens</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelDesign}`}
                      >
                        Design
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>🟡</span>
                    <span className={styles.columnTitle}>In Progress</span>
                    <span className={styles.columnCount}>8</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>ENG-3001</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Implement theme switcher
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelAi}`}
                      >
                        AI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.featureList}>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>2.1</span>
                    <span className={styles.featureLabel}>Code Generation</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>2.3</span>
                    <span className={styles.featureLabel}>Testing</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>2.2</span>
                    <span className={styles.featureLabel}>Documentation</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>2.4</span>
                    <span className={styles.featureLabel}>Deployment</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Plan and prioritize */}
      <section className={styles.productOpsSection}>
        <div className={styles.productOpsContainer}>
          <div className={styles.productOpsHeader}>
            <h2 className={styles.productOpsTitle}>
              Plan and
              <br />
              prioritize effectively
            </h2>
            <div className={styles.productOpsDescription}>
              <p className={styles.productOpsText}>
                Keep your team aligned with roadmaps, cycles, and projects that
                adapt to your workflow and priorities.
              </p>
              <a href="#" className={styles.productOpsLink}>
                3.0 Planning →
              </a>
            </div>
          </div>

          <div className={styles.productOpsContent}>
            <div className={styles.screenshotContainer}>
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatIcon}>💬</span>
                  <span className={styles.chatTitle}>Thread in #product</span>
                  <button className={styles.chatMenu}>⋯</button>
                </div>

                <div className={styles.chatMessages}>
                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar3}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>maria</span>
                        <span className={styles.messageTime}>11:20 AM</span>
                      </div>
                      <p className={styles.messageText}>
                        We need to prioritize the mobile app improvements for
                        Q2.
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar1}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>james</span>
                        <span className={styles.messageTime}>11:25 AM</span>
                      </div>
                      <p className={styles.messageText}>
                        Agreed. Let&apos;s create a project and add it to the
                        roadmap.
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatCommand}>
                    <span className={styles.commandMention}>@ViewMarket</span>
                    <span className={styles.commandText}>
                      {' '}
                      create project for mobile improvements
                    </span>
                  </div>
                </div>

                <div className={styles.chatInput}>
                  <button className={styles.inputBtn}>+</button>
                  <button className={styles.inputBtn}>Aa</button>
                  <button className={styles.inputBtn}>😊</button>
                  <button className={styles.inputBtn}>@</button>
                  <button className={styles.inputBtn}>📎</button>
                  <button className={styles.inputBtn}>🎤</button>
                  <button className={styles.inputBtn}>✏️</button>
                  <button className={styles.sendBtn}>▶</button>
                </div>
              </div>

              <div className={styles.issuesPanel}>
                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>⭕</span>
                    <span className={styles.columnTitle}>Planned</span>
                    <span className={styles.columnCount}>23</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>MOB-101</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Improve app performance
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelPerformance}`}
                      >
                        Performance
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>MOB-102</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Redesign navigation</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelDesign}`}
                      >
                        Design
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>🟡</span>
                    <span className={styles.columnTitle}>Active</span>
                    <span className={styles.columnCount}>12</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>MOB-103</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Add offline support</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelAi}`}
                      >
                        AI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.featureList}>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>3.1</span>
                    <span className={styles.featureLabel}>Roadmaps</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>3.3</span>
                    <span className={styles.featureLabel}>Initiatives</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>3.2</span>
                    <span className={styles.featureLabel}>Cycles</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>3.4</span>
                    <span className={styles.featureLabel}>Projects</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Track and measure */}
      <section className={styles.productOpsSection}>
        <div className={styles.productOpsContainer}>
          <div className={styles.productOpsHeader}>
            <h2 className={styles.productOpsTitle}>
              Track and
              <br />
              measure progress
            </h2>
            <div className={styles.productOpsDescription}>
              <p className={styles.productOpsText}>
                Get real-time insights into team velocity, project health, and
                delivery metrics with automated reporting.
              </p>
              <a href="#" className={styles.productOpsLink}>
                4.0 Insights →
              </a>
            </div>
          </div>

          <div className={styles.productOpsContent}>
            <div className={styles.screenshotContainer}>
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatIcon}>💬</span>
                  <span className={styles.chatTitle}>
                    Thread in #leadership
                  </span>
                  <button className={styles.chatMenu}>⋯</button>
                </div>

                <div className={styles.chatMessages}>
                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar2}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>david</span>
                        <span className={styles.messageTime}>9:15 AM</span>
                      </div>
                      <p className={styles.messageText}>
                        Can we get a report on our sprint velocity for the last
                        quarter?
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar3}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>emma</span>
                        <span className={styles.messageTime}>9:18 AM</span>
                      </div>
                      <p className={styles.messageText}>
                        Also include cycle time and completion rates please.
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatCommand}>
                    <span className={styles.commandMention}>@ViewMarket</span>
                    <span className={styles.commandText}>
                      {' '}
                      generate quarterly metrics report
                    </span>
                  </div>
                </div>

                <div className={styles.chatInput}>
                  <button className={styles.inputBtn}>+</button>
                  <button className={styles.inputBtn}>Aa</button>
                  <button className={styles.inputBtn}>😊</button>
                  <button className={styles.inputBtn}>@</button>
                  <button className={styles.inputBtn}>📎</button>
                  <button className={styles.inputBtn}>🎤</button>
                  <button className={styles.inputBtn}>✏️</button>
                  <button className={styles.sendBtn}>▶</button>
                </div>
              </div>

              <div className={styles.issuesPanel}>
                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>⭕</span>
                    <span className={styles.columnTitle}>Reports</span>
                    <span className={styles.columnCount}>15</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>RPT-201</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Q1 Velocity Report</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelApi}`}
                      >
                        Analytics
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>RPT-202</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>Cycle Time Analysis</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelApi}`}
                      >
                        Analytics
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>🟡</span>
                    <span className={styles.columnTitle}>Generated</span>
                    <span className={styles.columnCount}>5</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>RPT-203</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      Team Performance Dashboard
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelAi}`}
                      >
                        AI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.featureList}>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>4.1</span>
                    <span className={styles.featureLabel}>Analytics</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>4.3</span>
                    <span className={styles.featureLabel}>Dashboards</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>4.2</span>
                    <span className={styles.featureLabel}>Reports</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>4.4</span>
                    <span className={styles.featureLabel}>Metrics</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Collaborate seamlessly */}
      <section className={styles.productOpsSection}>
        <div className={styles.productOpsContainer}>
          <div className={styles.productOpsHeader}>
            <h2 className={styles.productOpsTitle}>
              Collaborate
              <br />
              seamlessly
            </h2>
            <div className={styles.productOpsDescription}>
              <p className={styles.productOpsText}>
                Keep everyone in sync with real-time updates, comments, and
                notifications across your entire organization.
              </p>
              <a href="#" className={styles.productOpsLink}>
                5.0 Collaboration →
              </a>
            </div>
          </div>

          <div className={styles.productOpsContent}>
            <div className={styles.screenshotContainer}>
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatIcon}>💬</span>
                  <span className={styles.chatTitle}>Thread in #general</span>
                  <button className={styles.chatMenu}>⋯</button>
                </div>

                <div className={styles.chatMessages}>
                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar1}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>olivia</span>
                        <span className={styles.messageTime}>4:45 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        The new feature is ready for review. Can someone take a
                        look?
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatMessage}>
                    <div className={styles.messageAvatar}>
                      <div
                        className={`${styles.avatarCircle} ${styles.avatar2}`}
                      ></div>
                    </div>
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageAuthor}>ryan</span>
                        <span className={styles.messageTime}>4:47 PM</span>
                      </div>
                      <p className={styles.messageText}>
                        I&apos;ll review it now. Looks great from the
                        screenshots!
                      </p>
                    </div>
                  </div>

                  <div className={styles.chatCommand}>
                    <span className={styles.commandMention}>@ViewMarket</span>
                    <span className={styles.commandText}>
                      {' '}
                      notify team about code review
                    </span>
                  </div>
                </div>

                <div className={styles.chatInput}>
                  <button className={styles.inputBtn}>+</button>
                  <button className={styles.inputBtn}>Aa</button>
                  <button className={styles.inputBtn}>😊</button>
                  <button className={styles.inputBtn}>@</button>
                  <button className={styles.inputBtn}>📎</button>
                  <button className={styles.inputBtn}>🎤</button>
                  <button className={styles.inputBtn}>✏️</button>
                  <button className={styles.sendBtn}>▶</button>
                </div>
              </div>

              <div className={styles.issuesPanel}>
                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>⭕</span>
                    <span className={styles.columnTitle}>Review</span>
                    <span className={styles.columnCount}>18</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>REV-301</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>New dashboard feature</h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelDesign}`}
                      >
                        Design
                      </span>
                    </div>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>REV-302</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      API documentation update
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelApi}`}
                      >
                        Docs
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.issuesColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>🟡</span>
                    <span className={styles.columnTitle}>Approved</span>
                    <span className={styles.columnCount}>9</span>
                  </div>

                  <div className={styles.issueCard}>
                    <div className={styles.issueHeader}>
                      <span className={styles.issueId}>REV-303</span>
                      <button className={styles.issueMenu}>⋯</button>
                    </div>
                    <h4 className={styles.issueTitle}>
                      User authentication flow
                    </h4>
                    <div className={styles.issueLabels}>
                      <span
                        className={`${styles.issueLabel} ${styles.labelBug}`}
                      >
                        Security
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.featureList}>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>5.1</span>
                    <span className={styles.featureLabel}>Comments</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>5.3</span>
                    <span className={styles.featureLabel}>Mentions</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
                <div className={styles.featureColumn}>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>5.2</span>
                    <span className={styles.featureLabel}>Notifications</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                  <a href="#" className={styles.featureItem}>
                    <span className={styles.featureNumber}>5.4</span>
                    <span className={styles.featureLabel}>Activity Feed</span>
                    <span className={styles.featureArrow}>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
