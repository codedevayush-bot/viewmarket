import LegalLayout from '../../components/LegalLayout';
import styles from '../../components/LegalLayout.module.css';

export const metadata = {
  title: 'Risk Disclosure',
  description: 'Risk Disclosure for ViewMarket algorithmic trading platform',
};

export default function RiskDisclosurePage() {
  return (
    <LegalLayout title="Risk Disclosure" lastUpdated="April 24, 2026">
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>1. Important Notice</h2>
        <p className={styles.sectionText}>
          This Risk Disclosure is provided to inform you of the significant
          risks associated with using the ViewMarket platform and trading in
          financial markets. ViewMarket is a Software-as-a-Service (SaaS)
          platform that provides algorithmic trading tools, charting features,
          and broker integrations.{' '}
          <span className={styles.highlight}>
            We do not provide trading recommendations, investment advice, or
            suggestions of any kind.
          </span>{' '}
          All trading decisions and their outcomes are solely your
          responsibility.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>2. Trading Risk</h2>
        <p className={styles.sectionText}>
          Trading in financial instruments, including but not limited to stocks,
          options, futures, forex, and cryptocurrencies, involves substantial
          risk of loss. You should carefully consider whether trading is
          appropriate for you in light of your financial condition. The degree
          of financial leverage available in certain markets can work against
          you as well as for you, and you may lose more than your initial
          investment.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>3. Algorithmic Trading Risks</h2>
        <p className={styles.sectionText}>
          The use of algorithmic trading tools on the ViewMarket platform
          introduces additional risks, including but not limited to:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Strategy Failures:</span>{' '}
            Algorithms may not perform as expected due to market conditions,
            data errors, or logical flaws in strategy design.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Rapid Execution Risk:</span>{' '}
            Automated strategies can execute trades at high speed, potentially
            amplifying losses if the strategy behaves unexpectedly.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Technical Failures:</span>{' '}
            Internet connectivity issues, server downtime, or software bugs may
            prevent timely execution or modification of orders.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Slippage & Latency:</span> The
            price at which an order is executed may differ from the intended
            price due to market movement or network latency.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Over-Optimization:</span>{' '}
            Strategies optimized on historical data may not perform well in live
            markets (curve-fitting risk).
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>4. Broker Integration Risks</h2>
        <p className={styles.sectionText}>
          ViewMarket integrates with 30+ brokers globally. Users should be aware
          of the following risks related to broker integrations:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Broker-Side Failures:</span>{' '}
            Broker outages, API downtime, or execution errors are outside
            ViewMarket&apos;s control.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>API Key Security:</span> While we
            employ encryption to protect your broker API credentials,
            unauthorized access could result in unintended trades.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Regulatory Differences:</span>{' '}
            Brokers operate under different regulatory regimes. Users are
            responsible for understanding the regulatory protections (or lack
            thereof) applicable to their broker.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Execution Risk:</span> Order
            routing, fills, rejections, and partial executions are controlled by
            the broker, not ViewMarket.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>5. Market Risks</h2>
        <p className={styles.sectionText}>
          Financial markets are inherently volatile and unpredictable. Specific
          market risks include:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Volatility:</span> Sudden and
            significant price movements can result in substantial losses.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Liquidity Risk:</span> In
            illiquid markets, it may be difficult or impossible to exit
            positions at desired prices.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Gap Risk:</span> Prices can gap
            significantly between trading sessions, potentially causing losses
            beyond stop-loss levels.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Event Risk:</span> Geopolitical
            events, economic releases, and corporate actions can cause extreme
            market movements.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>6. Technology Risks</h2>
        <p className={styles.sectionText}>
          The ViewMarket platform relies on complex technology infrastructure.
          Risks include:
        </p>
        <ul className={styles.sectionList}>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>System Downtime:</span> Planned
            or unplanned outages may prevent access to the platform and the
            ability to manage open positions.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Data Accuracy:</span> Market data
            feeds may contain errors, delays, or gaps that affect strategy
            performance.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Cybersecurity:</span> Despite our
            security measures, cyber attacks could compromise platform integrity
            or user data.
          </li>
          <li className={styles.sectionListItem}>
            <span className={styles.highlight}>Third-Party Dependencies:</span>{' '}
            The platform relies on third-party services (data providers, cloud
            infrastructure) whose failures may impact our service.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>7. No Risk Elimination</h2>
        <p className={styles.sectionText}>
          The use of the ViewMarket platform does not eliminate, reduce, or
          manage trading risk. Algorithmic trading tools are instruments that
          execute user-defined strategies — they do not inherently protect
          against losses. Risk management features (such as stop-losses or
          position limits) are user-configured and their effectiveness depends
          entirely on the user&apos;s strategy design and market conditions.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>8. Acknowledgment</h2>
        <p className={styles.sectionText}>
          By using the ViewMarket platform, you acknowledge that you have read
          and understood this Risk Disclosure, that you are aware of the risks
          involved in trading and algorithmic trading, and that you accept full
          responsibility for your trading decisions and their outcomes.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>9. Changes to This Disclosure</h2>
        <p className={styles.sectionText}>
          We may update this Risk Disclosure from time to time to reflect
          changes in our services or applicable regulations. Changes will be
          posted on this page with an updated &quot;Last updated&quot; date.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>10. Contact Us</h2>
        <p className={styles.sectionText}>
          If you have any questions about this Risk Disclosure, please contact
          us at legal@viewmarket.io.
        </p>
      </section>
    </LegalLayout>
  );
}
