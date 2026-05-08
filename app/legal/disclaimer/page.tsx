import LegalLayout from "../../components/LegalLayout";
import styles from "../../components/LegalLayout.module.css";

export const metadata = {
  title: "Disclaimer",
  description: "Disclaimer for ViewMarket algorithmic trading platform",
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" lastUpdated="April 24, 2026">
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>1. General Disclaimer</h2>
        <p className={styles.sectionText}>
          ViewMarket is a Software-as-a-Service (SaaS) platform that provides
          algorithmic trading tools, charting capabilities, and broker
          integration services. The platform is designed solely to assist users
          in executing their own trading strategies through automated means.
          ViewMarket does <span className={styles.highlight}>not</span> provide
          investment recommendations, trading suggestions, financial advice, or
          any form of advisory services.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>2. No Financial Advice</h2>
        <p className={styles.sectionText}>
          Nothing on the ViewMarket platform, including charts, indicators,
          algorithmic tools, or any other features, should be construed as
          financial advice, investment recommendations, or solicitations to buy,
          sell, or hold any financial instrument. All trading decisions are made
          solely by the user. ViewMarket is a tool provider, not an advisor.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>3. No Guarantee of Results</h2>
        <p className={styles.sectionText}>
          ViewMarket does not guarantee any specific trading outcomes,
          profitability, or performance results. The use of algorithmic trading
          tools does not eliminate risk. Past performance, whether simulated or
          actual, is not indicative of future results. Users acknowledge that
          trading in financial markets carries inherent risk and may result in
          significant or total financial loss.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>4. Broker Integrations</h2>
        <p className={styles.sectionText}>
          ViewMarket integrates with 30+ brokers globally to facilitate trade
          execution. These integrations are provided as a convenience and do not
          imply endorsement, partnership, or guarantee of any broker&apos;s
          services. Each broker operates under its own regulatory framework,
          terms, and conditions. Users are solely responsible for evaluating and
          choosing their broker and for complying with the broker&apos;s terms
          of service.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>5. Technical Limitations</h2>
        <p className={styles.sectionText}>
          The ViewMarket platform is provided on an &quot;as is&quot; and
          &quot;as available&quot; basis. We do not warrant that the platform
          will be uninterrupted, error-free, or free of defects. Technical
          issues, including but not limited to connectivity problems, latency,
          data feed errors, or software bugs, may occur and could affect trade
          execution. ViewMarket shall not be liable for any losses arising from
          such technical limitations.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>6. Third-Party Data & Tools</h2>
        <p className={styles.sectionText}>
          ViewMarket may incorporate or display data, charts, indicators, and
          tools from third-party providers. We do not guarantee the accuracy,
          completeness, or timeliness of any third-party data. Users should
          independently verify all data before making trading decisions.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>7. User Responsibility</h2>
        <p className={styles.sectionText}>Users are solely responsible for:</p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            Their trading decisions and the outcomes of those decisions.
          </li>
          <li className={styles.sectionListItem}>
            Ensuring their use of the platform complies with applicable laws and
            regulations in their jurisdiction.
          </li>
          <li className={styles.sectionListItem}>
            Maintaining the security of their account credentials and broker API
            keys.
          </li>
          <li className={styles.sectionListItem}>
            Understanding the risks associated with algorithmic trading and
            financial markets.
          </li>
          <li className={styles.sectionListItem}>
            Monitoring their automated strategies and intervening when
            necessary.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>8. Limitation of Liability</h2>
        <p className={styles.sectionText}>
          To the maximum extent permitted by law, ViewMarket, its directors,
          employees, and affiliates shall not be liable for any direct,
          indirect, incidental, special, consequential, or punitive damages
          arising from or related to your use of the platform, including but not
          limited to trading losses, data loss, or system failures, regardless
          of the cause of action or the theory of liability.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>9. Regulatory Compliance</h2>
        <p className={styles.sectionText}>
          ViewMarket is a software provider and is not registered as a
          broker-dealer, investment advisor, or financial intermediary in any
          jurisdiction. Users are responsible for ensuring their trading
          activities comply with the laws and regulations of their country of
          residence and the jurisdictions in which they trade.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          10. Changes to This Disclaimer
        </h2>
        <p className={styles.sectionText}>
          We reserve the right to update this Disclaimer at any time. Changes
          will be posted on this page with an updated &quot;Last updated&quot;
          date. Continued use of the platform after changes constitutes
          acceptance of the revised Disclaimer.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>11. Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about this Disclaimer, please contact us at
          legal@viewmarket.io.
        </p>
      </section>
    </LegalLayout>
  );
}
