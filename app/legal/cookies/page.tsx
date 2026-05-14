import LegalLayout from '../../components/LegalLayout';
import styles from '../../components/LegalLayout.module.css';

export const metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for ViewMarket algorithmic trading platform',
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="April 24, 2026">
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>1. What Are Cookies</h2>
        <p className={styles.sectionText}>
          Cookies are small text files placed on your device when you visit a
          website. They are widely used to make websites work more efficiently
          and to provide information to the owners of the site. This Cookie
          Policy explains how ViewMarket uses cookies and similar technologies
          when you use our algorithmic trading platform.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>2. How We Use Cookies</h2>
        <p className={styles.sectionText}>
          ViewMarket uses cookies and similar tracking technologies for the
          following purposes:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Essential Cookies:</span>{' '}
            Required for the platform to function properly, including session
            management, authentication, and security features.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Functional Cookies:</span>{' '}
            Remember your preferences and settings within the platform, such as
            chart configurations, layout preferences, and selected broker.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Analytics Cookies:</span> Help us
            understand how users interact with the platform, enabling us to
            improve features, performance, and user experience.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Performance Cookies:</span>{' '}
            Monitor and optimize platform speed, latency, and reliability —
            critical for an algorithmic trading environment.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>3. Specific Cookies We Use</h2>
        <p className={styles.sectionText}>
          The following categories of cookies are used on the ViewMarket
          platform:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Session Cookies:</span> Temporary
            cookies that expire when you close your browser. Used to maintain
            your logged-in state and active trading session.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Persistent Cookies:</span> Remain
            on your device for a set period or until manually deleted. Used to
            remember your preferences and settings across sessions.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Third-Party Cookies:</span> Set
            by our broker integration partners, data providers, and analytics
            services. These may include cookies from market data providers or
            cloud infrastructure services.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Local Storage & IndexedDB:</span>{' '}
            Used to store larger amounts of data locally on your device, such as
            chart state, cached market data, and strategy configurations for
            faster platform performance.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>4. Broker Integration Cookies</h2>
        <p className={styles.sectionText}>
          When you connect to one of our 30+ broker integrations, the
          broker&apos;s authentication process may set its own cookies on your
          device. These cookies are governed by the respective broker&apos;s
          cookie and privacy policies. ViewMarket does not control these cookies
          and recommends reviewing your broker&apos;s privacy policy.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>5. Managing Cookies</h2>
        <p className={styles.sectionText}>
          You can manage or delete cookies through your browser settings. Most
          browsers allow you to:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            View what cookies are stored on your device and delete them
            individually.
          </li>
          <li className={styles.sectionListItem}>
            Block third-party cookies or all cookies entirely.
          </li>
          <li className={styles.sectionListItem}>
            Set preferences for specific websites.
          </li>
          <li className={styles.sectionListItem}>
            Clear all cookies when you close your browser.
          </li>
        </ul>
        <p className={styles.sectionText}>
          Please note that disabling certain cookies (especially essential and
          functional cookies) may affect the functionality of the ViewMarket
          platform, including your ability to maintain an active trading
          session, access broker integrations, and use charting features.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>6. Do Not Track</h2>
        <p className={styles.sectionText}>
          Some browsers offer a &quot;Do Not Track&quot; (DNT) feature. There is
          currently no industry standard for how DNT signals should be
          interpreted. ViewMarket does not currently alter its practices in
          response to DNT signals, but we respect the choices you make through
          your cookie preferences.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>7. Updates to This Policy</h2>
        <p className={styles.sectionText}>
          We may update this Cookie Policy from time to time. Changes will be
          posted on this page with an updated &quot;Last updated&quot; date. We
          encourage you to review this policy periodically.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>8. Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about our use of cookies, please contact us
          at privacy@viewmarket.io.
        </p>
      </section>
    </LegalLayout>
  );
}
