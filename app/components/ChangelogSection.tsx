import styles from './ChangelogSection.module.css';

export default function ChangelogSection() {
  return (
    <>
      {/* Top Divider */}
      <div className="section-divider"></div>

      <section className={styles.changelogSection}>
        <div className={styles.changelogContainer}>
          <h2 className={styles.changelogTitle}>Changelog</h2>

          <div className={styles.changelogGrid}>
            {/* Card 1 */}
            <div className={styles.changelogCard}>
              <div className={styles.cardIcon}>
                <span className={styles.iconDot}></span>
              </div>
              <h3 className={styles.cardTitle}>
                View Market Agent MCP support
              </h3>
              <p className={styles.cardDescription}>
                View Market Agent can now connect to your tools via MCP, giving
                it access to dat...
              </p>
              <time className={styles.cardDate}>APR 23, 2026</time>
            </div>

            {/* Card 2 */}
            <div className={styles.changelogCard}>
              <div className={styles.cardIcon}>
                <span className={styles.iconDot}></span>
              </div>
              <h3 className={styles.cardTitle}>
                View Market for Microsoft Teams
              </h3>
              <p className={styles.cardDescription}>
                Mention @ViewMarket in any Microsoft Teams channel to turn
                your...
              </p>
              <time className={styles.cardDate}>APR 15, 2026</time>
            </div>

            {/* Card 3 */}
            <div className={styles.changelogCard}>
              <div className={styles.cardIcon}>
                <span className={styles.iconDot}></span>
              </div>
              <h3 className={styles.cardTitle}>Multi-level sub-teams</h3>
              <p className={styles.cardDescription}>
                Structure your teams in View Market to match how your
                organization works.
              </p>
              <time className={styles.cardDate}>APR 8, 2026</time>
            </div>

            {/* Card 4 */}
            <div className={styles.changelogCard}>
              <div className={styles.cardIcon}>
                <span className={styles.iconDot}></span>
              </div>
              <h3 className={styles.cardTitle}>
                Web forms for View Market Asks
              </h3>
              <p className={styles.cardDescription}>
                View Market Asks allows you to capture internal requests and
                bring them into...
              </p>
              <time className={styles.cardDate}>APR 1, 2026</time>
            </div>
          </div>

          <a href="#" className={styles.viewAllLink}>
            View all →
          </a>
        </div>
      </section>

      {/* Bottom Divider */}
      <div className="section-divider"></div>
    </>
  );
}
