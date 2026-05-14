import LegalLayout from '../../components/LegalLayout';
import styles from '../../components/LegalLayout.module.css';

export const metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for ViewMarket algorithmic trading platform',
};

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="April 24, 2026">
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>1. Overview</h2>
        <p className={styles.sectionText}>
          ViewMarket is a Software-as-a-Service (SaaS) platform providing
          algorithmic trading tools, charting capabilities, and broker
          integration services. Due to the nature of our software-based service,{' '}
          <span className={styles.highlight}>
            all subscription payments are non-refundable
          </span>
          . This policy outlines the terms and conditions regarding payments and
          refunds.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>2. No Refund Policy</h2>
        <p className={styles.sectionText}>
          As ViewMarket provides digital software services that are immediately
          accessible upon subscription, we do not offer refunds for any
          subscription payments. This includes, but is not limited to:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Monthly or annual subscription fees.
          </li>
          <li className={styles.sectionListItem}>
            Upgrades or add-on feature purchases.
          </li>
          <li className={styles.sectionListItem}>
            Partial subscription periods not used.
          </li>
          <li className={styles.sectionListItem}>
            Accounts terminated or suspended for Terms of Service violations.
          </li>
          <li className={styles.sectionListItem}>
            Dissatisfaction with platform features or performance.
          </li>
          <li className={styles.sectionListItem}>
            Trading losses incurred while using the platform.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>3. Why No Refunds</h2>
        <p className={styles.sectionText}>
          Our no-refund policy exists because:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Immediate Access:</span> Upon
            subscription, you gain immediate access to the full suite of
            ViewMarket features, including algorithmic trading tools, charting,
            and broker integrations. The value of the software is delivered at
            the point of access.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Digital Nature:</span> Software
            services cannot be &quot;returned&quot; in the same way physical
            goods can. Once access is granted, the service has been consumed.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Infrastructure Costs:</span> Each
            active account consumes server resources, data feeds, and broker API
            connections that incur costs regardless of usage frequency.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>4. Free Trial & Evaluation</h2>
        <p className={styles.sectionText}>
          Where available, ViewMarket may offer a free trial period so you can
          evaluate the platform before committing to a paid subscription. We
          strongly encourage users to thoroughly test the platform during any
          trial period to ensure it meets their requirements. No refunds will be
          provided for subscriptions purchased after the trial period.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>5. Subscription Cancellation</h2>
        <p className={styles.sectionText}>
          You may cancel your subscription at any time through your account
          settings. Upon cancellation:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Your subscription will remain active until the end of the current
            billing period.
          </li>
          <li className={styles.sectionListItem}>
            No further charges will be applied after the current period ends.
          </li>
          <li className={styles.sectionListItem}>
            No refund will be issued for the remaining days of the current
            billing period.
          </li>
          <li className={styles.sectionListItem}>
            Your data and configurations will be retained for 30 days after
            expiration, after which they may be permanently deleted.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>6. Billing Errors</h2>
        <p className={styles.sectionText}>
          If you identify a billing error — such as being charged incorrectly or
          charged after cancellation — please contact us immediately at
          billing@viewmarket.io. We will investigate and, if a billing error is
          confirmed, issue a correction. This is the only circumstance under
          which a payment adjustment may be made, and it does not constitute a
          refund policy.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>7. Trading Losses</h2>
        <p className={styles.sectionText}>
          ViewMarket is a software tool provider and does not provide trading
          recommendations or investment advice. Trading losses incurred while
          using the platform are not grounds for a refund. Users are solely
          responsible for their trading decisions and outcomes. Please review
          our Risk Disclosure for a full understanding of the risks involved.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>8. Changes to This Policy</h2>
        <p className={styles.sectionText}>
          We reserve the right to update this Refund Policy at any time. Changes
          will be posted on this page with an updated &quot;Last updated&quot;
          date. Any changes to the refund terms for existing subscriptions will
          be communicated in advance.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>9. Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about this Refund Policy or need to report a
          billing error, please contact us at billing@viewmarket.io.
        </p>
      </section>
    </LegalLayout>
  );
}
