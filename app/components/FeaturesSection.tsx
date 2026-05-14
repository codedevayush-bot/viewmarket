import styles from './FeaturesSection.module.css';

export default function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        {/* Heading */}
        <div className={styles.featuresHeading}>
          <h2 className={styles.featuresTitle}>
            A new species of trading tool.{' '}
            <span className={styles.featuresTitleMuted}>
              Purpose-built for modern traders with algorithmic workflows at its
              core, View Market sets a new standard for automated strategy
              execution.
            </span>
          </h2>
        </div>

        {/* Feature Cards */}
        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureLabel}>FIG # 2</div>
            <div className={styles.featureIllustration}>
              <svg
                className={styles.featureSvg}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric stack illustration */}
                <path
                  d="M100 40 L160 70 L160 130 L100 160 L40 130 L40 70 Z"
                  stroke="currentColor"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M100 50 L150 75 L150 125 L100 150 L50 125 L50 75 Z"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M100 60 L140 80 L140 120 L100 140 L60 120 L60 80 Z"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M100 70 L130 85 L130 115 L100 130 L70 115 L70 85 Z"
                  stroke="currentColor"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  fill="none"
                />
                {/* Horizontal lines */}
                <line
                  x1="40"
                  y1="90"
                  x2="160"
                  y2="90"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="0.5"
                />
                <line
                  x1="40"
                  y1="100"
                  x2="160"
                  y2="100"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="0.5"
                />
                <line
                  x1="40"
                  y1="110"
                  x2="160"
                  y2="110"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Multi-broker architecture</h3>
            <p className={styles.featureDescription}>
              View Market integrates with 30+ brokers using high-fidelity
              adapters for seamless multi-tenant execution.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureLabel}>FIG # 3</div>
            <div className={styles.featureIllustration}>
              <svg
                className={styles.featureSvg}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric hexagons illustration */}
                <path
                  d="M100 50 L130 67 L130 100 L100 117 L70 100 L70 67 Z"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M145 75 L170 88 L170 115 L145 128 L120 115 L120 88 Z"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M55 75 L80 88 L80 115 L55 128 L30 115 L30 88 Z"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M100 100 L130 117 L130 150 L100 167 L70 150 L70 117 Z"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Algorithmic intelligence</h3>
            <p className={styles.featureDescription}>
              Designed for workflows shared by traders and algo-agents. From
              backtesting strategies to live execution.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureLabel}>FIG # 4</div>
            <div className={styles.featureIllustration}>
              <svg
                className={styles.featureSvg}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric bars illustration */}
                <g>
                  <path
                    d="M50 140 L50 100 L70 90 L70 130 Z"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M75 137 L75 97 L95 87 L95 127 Z"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M100 134 L100 84 L120 74 L120 124 Z"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M125 131 L125 71 L145 61 L145 121 Z"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M150 128 L150 58 L170 48 L170 118 Z"
                    stroke="currentColor"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    fill="none"
                  />
                  {/* Top faces */}
                  <path
                    d="M50 100 L70 90 L70 90 L50 100"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                  <path
                    d="M75 97 L95 87 L95 87 L75 97"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                  <path
                    d="M100 84 L120 74 L120 74 L100 84"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                  />
                  <path
                    d="M125 71 L145 61 L145 61 L125 71"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                  />
                  <path
                    d="M150 58 L170 48 L170 48 L150 58"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                  />
                </g>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Engineered for latency</h3>
            <p className={styles.featureDescription}>
              Built on a low-latency stack to ensure your orders hit the market
              with millisecond precision and reliability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
