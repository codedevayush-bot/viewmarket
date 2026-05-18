import LegalLayout from '../../components/LegalLayout';
import styles from '../../components/LegalLayout.module.css';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for ViewMarket algorithmic trading platform',
};

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'legal-disclaimer', label: 'Legal Disclaimer' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use-information', label: 'How We Use Your Information' },
  { id: 'data-sharing-disclosure', label: 'Data Sharing & Disclosure' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'international-data-transfers', label: 'International Data Transfers' },
  { id: 'childrens-privacy', label: "Children's Privacy" },
  { id: 'changes-to-policy', label: 'Changes to This Policy' },
  { id: 'contact-us', label: 'Contact Us' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How ViewMarket collects, uses, and protects your personal information."
      lastUpdated="April 24, 2026"
      sections={sections}
    >
      <section className={styles.section} id="introduction">
        <h2 className={styles.sectionHeading}>1. Introduction</h2>
        <p className={styles.sectionText}>
          ViewMarket (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you use
          our algorithmic trading platform and related services. ViewMarket
          operates as a Software-as-a-Service (SaaS) platform providing charting
          tools, algorithmic trading capabilities, and integrations with 30+
          brokers worldwide. We do not provide trading recommendations,
          investment advice, or suggestions of any kind.
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

      <section className={styles.section} id="information-we-collect">
        <h2 className={styles.sectionHeading}>2. Information We Collect</h2>
        <p className={styles.sectionText}>
          We collect the following categories of information:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Account Information:</span> Name,
            email address, phone number, and billing details when you create an
            account.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Platform Usage Data:</span>{' '}
            Trading strategies configured, charts viewed, indicators used, and
            feature interaction patterns within the platform.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Broker Integration Data:</span>{' '}
            Connection credentials (securely encrypted), broker selection, and
            API interaction logs required to facilitate your trading through our
            30+ broker integrations.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Device & Technical Data:</span>{' '}
            IP address, browser type, operating system, device identifiers, and
            log data collected automatically.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Cookies & Tracking Data:</span>{' '}
            As described in our Cookie Policy.
          </li>
        </ul>
      </section>

      <section className={styles.section} id="how-we-use-information">
        <h2 className={styles.sectionHeading}>
          3. How We Use Your Information
        </h2>
        <p className={styles.sectionText}>
          We use the information we collect to:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Provide, maintain, and improve the ViewMarket platform and its
            features.
          </li>
          <li className={styles.sectionListItem}>
            Facilitate broker integrations and ensure seamless connectivity with
            your chosen broker.
          </li>
          <li className={styles.sectionListItem}>
            Process subscription payments and manage your account.
          </li>
          <li className={styles.sectionListItem}>
            Send you platform updates, security alerts, and administrative
            messages.
          </li>
          <li className={styles.sectionListItem}>
            Monitor usage patterns to improve platform performance and user
            experience.
          </li>
          <li className={styles.sectionListItem}>
            Detect, prevent, and address technical issues, security threats, and
            fraud.
          </li>
        </ul>
      </section>

      <section className={styles.section} id="data-sharing-disclosure">
        <h2 className={styles.sectionHeading}>4. Data Sharing & Disclosure</h2>
        <p className={styles.sectionText}>
          We do not sell your personal information. We may share your data only
          in the following circumstances:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Broker Partners:</span> When you
            connect to a broker, we share only the minimum data necessary to
            establish and maintain that connection as required by the
            broker&apos;s API.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Service Providers:</span>{' '}
            Third-party vendors who assist in operating our platform (hosting,
            payment processing, analytics) under strict data protection
            agreements.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Legal Requirements:</span> When
            required by law, regulation, legal process, or governmental request.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Business Transfers:</span> In
            connection with a merger, acquisition, or sale of assets.
          </li>
        </ul>
      </section>

      <section className={styles.section} id="data-security">
        <h2 className={styles.sectionHeading}>5. Data Security</h2>
        <p className={styles.sectionText}>
          We implement industry-standard security measures including encryption
          at rest and in transit, secure API key storage, and regular security
          audits to protect your data. However, no method of electronic
          transmission or storage is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </section>

      <section className={styles.section} id="data-retention">
        <h2 className={styles.sectionHeading}>6. Data Retention</h2>
        <p className={styles.sectionText}>
          We retain your personal information for as long as your account is
          active or as needed to provide you services. If you delete your
          account, we will delete your personal data within 30 days, except
          where we are required to retain it for legal, accounting, or
          regulatory purposes.
        </p>
      </section>

      <section className={styles.section} id="your-rights">
        <h2 className={styles.sectionHeading}>7. Your Rights</h2>
        <p className={styles.sectionText}>
          Depending on your jurisdiction, you may have the right to:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Access, correct, or delete your personal information.
          </li>
          <li className={styles.sectionListItem}>
            Object to or restrict the processing of your data.
          </li>
          <li className={styles.sectionListItem}>
            Data portability — receive a copy of your data in a structured
            format.
          </li>
          <li className={styles.sectionListItem}>
            Withdraw consent at any time where processing is based on consent.
          </li>
        </ul>
        <p className={styles.sectionText}>
          To exercise any of these rights, please contact us at
          privacy@viewmarket.io.
        </p>
      </section>

      <section className={styles.section} id="international-data-transfers">
        <h2 className={styles.sectionHeading}>
          8. International Data Transfers
        </h2>
        <p className={styles.sectionText}>
          ViewMarket operates globally with broker integrations across 30+
          jurisdictions. Your data may be transferred to and processed in
          countries other than your own. We ensure appropriate safeguards are in
          place, including Standard Contractual Clauses where required.
        </p>
      </section>

      <section className={styles.section} id="childrens-privacy">
        <h2 className={styles.sectionHeading}>9. Children&apos;s Privacy</h2>
        <p className={styles.sectionText}>
          ViewMarket is not intended for use by individuals under the age of 18.
          We do not knowingly collect personal information from children.
        </p>
      </section>

      <section className={styles.section} id="changes-to-policy">
        <h2 className={styles.sectionHeading}>10. Changes to This Policy</h2>
        <p className={styles.sectionText}>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new policy on this page and
          updating the &quot;Last updated&quot; date. Your continued use of the
          platform after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className={styles.section} id="contact-us">
        <h2 className={styles.sectionHeading}>11. Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about this Privacy Policy, please contact us
          at privacy@viewmarket.io.
        </p>
      </section>
    </LegalLayout>
  );
}
