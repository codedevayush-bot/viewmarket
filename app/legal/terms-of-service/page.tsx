import LegalLayout from '../../components/LegalLayout';
import styles from '../../components/LegalLayout.module.css';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for ViewMarket algorithmic trading platform',
};

const sections = [
  { id: 'acceptance-of-terms', label: 'Acceptance of Terms' },
  { id: 'legal-disclaimer', label: 'Legal Disclaimer' },
  { id: 'description-of-service', label: 'Description of Service' },
  { id: 'account-registration', label: 'Account Registration' },
  { id: 'subscription-payments', label: 'Subscription & Payments' },
  { id: 'broker-integrations', label: 'Broker Integrations' },
  { id: 'acceptable-use', label: 'Acceptable Use' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'user-generated-content', label: 'User-Generated Content' },
  { id: 'service-availability', label: 'Service Availability' },
  { id: 'termination', label: 'Termination' },
  { id: 'limitation-liability', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'changes-to-terms', label: 'Changes to These Terms' },
  { id: 'contact-us', label: 'Contact Us' },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The legal agreement governing your use of the ViewMarket platform."
      lastUpdated="April 24, 2026"
      sections={sections}
    >
      <section className={styles.section} id="acceptance-of-terms">
        <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
        <p className={styles.sectionText}>
          By accessing or using the ViewMarket platform, you agree to be bound
          by these Terms of Service (&quot;Terms&quot;). If you do not agree to
          these Terms, you must not use the platform. ViewMarket is a
          Software-as-a-Service (SaaS) algorithmic trading platform providing
          charting features, strategy automation, and integrations with 30+
          brokers globally.
        </p>
      </section>

      <section className={styles.section} id="legal-disclaimer">
        <h2 className={styles.sectionHeading}>0. Legal Disclaimer</h2>
        <p className={styles.sectionText}>
          ViewMarket is a technology platform only. We are NOT a SEBI‑registered
          broker, investment adviser, research analyst, or market‑data vendor.
          All market data, brokerage services, and trading execution are
          provided solely by the user&apos;s chosen broker. The platform does not
          offer financial advice, recommendations, or portfolio management.
        </p>
      </section>

      <section className={styles.section} id="description-of-service">
        <h2 className={styles.sectionHeading}>2. Description of Service</h2>
        <p className={styles.sectionText}>
          ViewMarket provides users with software tools for algorithmic trading,
          including but not limited to:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Advanced charting and technical analysis tools.
          </li>
          <li className={styles.sectionListItem}>
            Algorithmic strategy creation, backtesting, and deployment.
          </li>
          <li className={styles.sectionListItem}>
            Integration with 30+ brokers worldwide for trade execution.
          </li>
          <li className={styles.sectionListItem}>
            Real-time and historical market data visualization.
          </li>
          <li className={styles.sectionListItem}>
            Custom indicators, alerts, and automation workflows.
          </li>
        </ul>
        <p className={styles.sectionText}>
          ViewMarket provides software tools only. We do not provide investment
          recommendations, trading suggestions, or financial advice of any kind.
        </p>
      </section>

      <section className={styles.section} id="account-registration">
        <h2 className={styles.sectionHeading}>3. Account Registration</h2>
        <p className={styles.sectionText}>
          To use ViewMarket, you must create an account and provide accurate,
          complete information. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities
          that occur under your account. You must be at least 18 years old to
          create an account.
        </p>
      </section>

      <section className={styles.section} id="subscription-payments">
        <h2 className={styles.sectionHeading}>4. Subscription & Payments</h2>
        <p className={styles.sectionText}>
          ViewMarket operates on a subscription-based pricing model. By
          subscribing, you agree to pay the applicable fees for your chosen
          plan. Subscription fees are billed in advance and are non-refundable.
          As ViewMarket is a software-based service, we do not offer refunds for
          any subscription payments once processed. Please review our Refund
          Policy for further details.
        </p>
      </section>

      <section className={styles.section} id="broker-integrations">
        <h2 className={styles.sectionHeading}>5. Broker Integrations</h2>
        <p className={styles.sectionText}>
          ViewMarket allows you to connect your broker account via API to
          execute trades through our platform. By connecting a broker, you
          acknowledge that:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            ViewMarket does not operate as a broker and is not responsible for
            broker-side execution, fills, or slippage.
          </li>
          <li className={styles.sectionListItem}>
            You are solely responsible for the security of your broker API
            credentials stored on our platform.
          </li>
          <li className={styles.sectionListItem}>
            Each broker integration is subject to the respective broker&apos;s
            own terms and conditions.
          </li>
          <li className={styles.sectionListItem}>
            ViewMarket does not endorse any specific broker and provides
            integrations as a convenience feature.
          </li>
        </ul>
      </section>

      <section className={styles.section} id="acceptable-use">
        <h2 className={styles.sectionHeading}>6. Acceptable Use</h2>
        <p className={styles.sectionText}>You agree not to:</p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Use the platform for any unlawful purpose or in violation of any
            applicable regulations.
          </li>
          <li className={styles.sectionListItem}>
            Attempt to reverse engineer, decompile, or disassemble the platform
            software.
          </li>
          <li className={styles.sectionListItem}>
            Share your account credentials or allow unauthorized access to the
            platform.
          </li>
          <li className={styles.sectionListItem}>
            Use the platform to manipulate markets or engage in any form of
            market abuse.
          </li>
          <li className={styles.sectionListItem}>
            Interfere with or disrupt the platform&apos;s infrastructure or
            other users&apos; access.
          </li>
          <li className={styles.sectionListItem}>
            Use automated means to scrape, crawl, or extract data from the
            platform beyond the features provided.
          </li>
        </ul>
      </section>

      <section className={styles.section} id="intellectual-property">
        <h2 className={styles.sectionHeading}>7. Intellectual Property</h2>
        <p className={styles.sectionText}>
          All content, features, and functionality of the ViewMarket platform,
          including but not limited to software, text, graphics, logos, and
          design, are owned by ViewMarket and protected by intellectual property
          laws. You may not copy, modify, distribute, or create derivative works
          from any part of the platform without our prior written consent.
        </p>
      </section>

      <section className={styles.section} id="user-generated-content">
        <h2 className={styles.sectionHeading}>8. User-Generated Content</h2>
        <p className={styles.sectionText}>
          You retain ownership of any trading strategies, scripts, or
          configurations you create on the platform. By creating content on
          ViewMarket, you grant us a limited, non-exclusive license to process,
          store, and execute that content as necessary to provide the service.
        </p>
      </section>

      <section className={styles.section} id="service-availability">
        <h2 className={styles.sectionHeading}>9. Service Availability</h2>
        <p className={styles.sectionText}>
          We strive to maintain high availability of the platform but do not
          guarantee uninterrupted access. Scheduled maintenance, updates, and
          unforeseen technical issues may cause temporary downtime. We will make
          reasonable efforts to notify users of scheduled maintenance.
        </p>
      </section>

      <section className={styles.section} id="termination">
        <h2 className={styles.sectionHeading}>10. Termination</h2>
        <p className={styles.sectionText}>
          Either party may terminate this agreement at any time. You may cancel
          your subscription and delete your account through your account
          settings. ViewMarket reserves the right to suspend or terminate
          accounts that violate these Terms. Upon termination, your right to use
          the platform ceases immediately. No refunds will be provided for the
          remaining subscription period.
        </p>
      </section>

      <section className={styles.section} id="limitation-liability">
        <h2 className={styles.sectionHeading}>11. Limitation of Liability</h2>
        <p className={styles.sectionText}>
          To the fullest extent permitted by law, ViewMarket shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, including but not limited to trading losses, lost profits, or
          data loss, arising from your use of the platform. Our total liability
          shall not exceed the fees you paid to ViewMarket in the 12 months
          preceding the claim.
        </p>
      </section>

      <section className={styles.section} id="indemnification">
        <h2 className={styles.sectionHeading}>12. Indemnification</h2>
        <p className={styles.sectionText}>
          You agree to indemnify and hold harmless ViewMarket, its directors,
          employees, and affiliates from any claims, damages, or expenses
          arising from your use of the platform, your violation of these Terms,
          or your violation of any applicable law or regulation.
        </p>
      </section>

      <section className={styles.section} id="governing-law">
        <h2 className={styles.sectionHeading}>13. Governing Law</h2>
        <p className={styles.sectionText}>
          These Terms shall be governed by and construed in accordance with
          applicable laws, without regard to conflict of law principles. Any
          disputes arising from these Terms shall be resolved through binding
          arbitration.
        </p>
      </section>

      <section className={styles.section} id="changes-to-terms">
        <h2 className={styles.sectionHeading}>14. Changes to These Terms</h2>
        <p className={styles.sectionText}>
          We may update these Terms from time to time. We will notify you of
          material changes via email or a platform notification. Your continued
          use of the platform after changes become effective constitutes
          acceptance of the revised Terms.
        </p>
      </section>

      <section className={styles.section} id="contact-us">
        <h2 className={styles.sectionHeading}>15. Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about these Terms of Service, please contact
          us at legal@viewmarket.io.
        </p>
      </section>
    </LegalLayout>
  );
}
