'use client';

import { useState, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './PricingClient.module.css';

type PricingCategory = 'Platform' | 'Api' | 'Static IP' | 'Virtual Machine';
type BillingCycle = 'monthly' | 'yearly';

export default function PricingClient() {
  const [activeCategory, setActiveCategory] =
    useState<PricingCategory>('Platform');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const categories: {
    id: PricingCategory;
    label: string;
    disabled?: boolean;
    comingSoon?: boolean;
  }[] = [
    { id: 'Platform', label: 'Platform' },
    { id: 'Api', label: 'API' },
    { id: 'Static IP', label: 'Static IP' },
    {
      id: 'Virtual Machine',
      label: 'Virtual Machine',
      disabled: true,
      comingSoon: true,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Pricing for <span className={styles.titleHighlight}>Every Scale</span>
        </h1>
        <p className={styles.description}>
          Premium-grade algorithmic trading tools, optimized for performance and
          reliability. Choose the plan that fits your trading volume and needs.
        </p>
      </div>

      {/* Category Switcher */}
      <div className={styles.categorySwitcher}>
        {categories.map((cat) => {
          let btnClass = styles.categoryBtn;
          if (activeCategory === cat.id)
            btnClass += ` ${styles.categoryBtnActive}`;
          if (cat.disabled) btnClass += ` ${styles.categoryBtnDisabled}`;

          return (
            <button
              key={cat.id}
              onClick={() => !cat.disabled && setActiveCategory(cat.id)}
              disabled={cat.disabled}
              className={btnClass}
            >
              {cat.label}
              {cat.comingSoon && (
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              )}
            </button>
          );
        })}
      </div>

      {activeCategory === 'Virtual Machine' ? (
        <div className={styles.vmSection}>
          <div className={styles.vmIconWrapper}>
            <svg
              className={styles.vmIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </div>
          <h2 className={styles.vmTitle}>Virtual Machines</h2>
          <p className={styles.vmDesc}>
            Dedicated infrastructure for high-frequency trading with
            cross-connect options. Coming soon.
          </p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          {/* Monthly / Yearly Toggle */}
          <div className={styles.billingToggleWrapper}>
            <div className={styles.billingToggle}>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`${styles.billingBtn} ${billingCycle === 'monthly' ? styles.billingBtnActive : ''}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`${styles.billingBtn} ${billingCycle === 'yearly' ? styles.billingBtnActive : ''}`}
              >
                Yearly
                <span className={styles.saveBadge}>Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className={styles.cardsContainer}>
            <PricingCards billingCycle={billingCycle} />
          </div>

          {/* Pricing Comparator */}
          <div id="compare" className={styles.comparatorSection}>
            <div className={styles.comparatorHeader}>
              <h2 className={styles.comparatorTitle}>Compare Features</h2>
              <p className={styles.comparatorDesc}>
                A detailed breakdown of everything included in our plans.
              </p>
            </div>
            <PricingComparator />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function PricingCards({ billingCycle }: { billingCycle: BillingCycle }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handlePlanSelection = (plan: string, contact?: boolean) => {
    if (contact) {
      router.push('/contact');
      return;
    }

    if (plan === 'Free') {
      if (session) {
        router.push('/user-dashboard');
      } else {
        router.push('/sign-in');
      }
      return;
    }

    if (!session) {
      router.push(`/sign-in?callbackUrl=/pricing`);
      return;
    }

    router.push(`/cart?plan=${plan}&billingCycle=${billingCycle}`);
  };

  const plans = [
    {
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      description:
        'Perfect for testing strategies in paper trading environments.',
      features: [
        '1 Live Strategy',
        'Standard Backtesting',
        'Community Support',
        'Basic Charting',
        'Daily Market Summary',
        'Email Notifications',
        'Paper Trading Mode',
        'Basic Watchlists',
        'Public Indicators',
        'Knowledge Base Access',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Starter',
      priceMonthly: 999,
      priceYearly: 799,
      description: 'Advanced tools and metrics for small retail traders.',
      features: [
        '10 Live Strategies',
        'Unlimited Backtesting',
        'Email Support',
        'Custom Indicators',
        'Webhooks',
        'Portfolio Analytics',
        'Risk Management Tools',
        'Multi-timeframe Analysis',
        'Alert Notifications',
        'CSV Data Export',
      ],
      cta: 'Get Starter',
      highlight: false,
    },
    {
      name: 'Pro',
      priceMonthly: 2500,
      priceYearly: 2000,
      description:
        'Designed for advanced retail traders and quantitative developers.',
      features: [
        '50 Live Strategies',
        'Priority Support',
        'Multiple Brokers',
        'API Access',
        'Ultra-low Latency',
        'Advanced Backtesting Engine',
        'Custom Scripting (Python)',
        'Real-time Data Feeds',
        'Strategy Scheduler',
        'Performance Attribution',
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
    },
    {
      name: 'Premium',
      priceMonthly: 4500,
      priceYearly: 3600,
      description:
        'Custom solutions for funds and institutional trading desks.',
      features: [
        'Unlimited Strategies',
        'Dedicated Manager',
        'Colocation Options',
        'White-labeling',
        'Custom Dev',
        'Institutional Data Feeds',
        'FIX Protocol Support',
        'Compliance Reporting',
        'Multi-asset Coverage',
        'Custom SLA (99.99%)',
      ],
      cta: 'Upgrade to Premium',
      highlight: false,
    },
    {
      name: 'Enterprise',
      priceMonthly: 0,
      priceYearly: 0,
      description:
        'Tailored infrastructure and dedicated support for large-scale operations.',
      features: [
        'Everything in Premium',
        'Custom SLAs',
        'Dedicated Infrastructure',
        'On-prem Deployment',
        'Regulatory Compliance',
        'SOC 2 Certification',
        'Dedicated Support Team',
        'Custom Integrations',
        'Disaster Recovery',
        'Training & Onboarding',
      ],
      cta: 'Contact Sales',
      highlight: false,
      contact: true,
    },
  ];

  return (
    <div className={styles.cardsGrid}>
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`${styles.card} ${plan.highlight ? styles.cardHighlight : ''}`}
        >
          {plan.highlight && (
            <div className={styles.popularBadge}>Most Popular</div>
          )}

          <h3 className={styles.cardName}>{plan.name}</h3>
          <p className={styles.cardDesc}>{plan.description}</p>
          <hr className={styles.cardDivider} />

          <div
            className={`${styles.cardPriceBox} ${plan.contact ? styles.cardPriceBoxCenter : ''}`}
          >
            {plan.contact ? (
              <span className={styles.cardPrice}>Custom</span>
            ) : (
              <>
                <span className={styles.cardPrice}>
                  <span className={styles.rupeeSymbol}>₹</span>
                  {(billingCycle === 'monthly'
                    ? plan.priceMonthly
                    : plan.priceYearly
                  ).toLocaleString()}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className={styles.cardPriceLabel}>/mo</span>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => handlePlanSelection(plan.name, plan.contact)}
            className={`${styles.ctaBtn} ${plan.highlight ? styles.ctaBtnHighlight : ''}`}
          >
            {plan.cta}
          </button>

          <ul className={styles.cardFeatures}>
            {plan.features.map((feature, fIdx) => (
              <li key={fIdx} className={styles.cardFeatureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href="#compare"
            className={styles.viewMore}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById('compare')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View more
          </a>
        </div>
      ))}
    </div>
  );
}

function PricingComparator() {
  const categories = [
    {
      name: 'Core Features',
      features: [
        {
          name: 'Live Strategies',
          values: ['1', '10', '50', 'Unlimited', 'Unlimited'],
        },
        {
          name: 'Backtesting',
          values: ['Daily', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
        },
        { name: 'Custom Indicators', values: ['✗', '✓', '✓', '✓', '✓'] },
        { name: 'Multiple Brokers', values: ['✗', '✗', '✓', '✓', '✓'] },
        { name: 'Webhooks', values: ['✗', '✓', '✓', '✓', '✓'] },
      ],
    },
    {
      name: 'Performance & Integration',
      features: [
        {
          name: 'Execution Speed',
          values: [
            'Standard',
            'Fast',
            'Ultra-low Latency',
            'Colocated',
            'Dedicated',
          ],
        },
        { name: 'API Access', values: ['✗', '✗', '✓', '✓', '✓'] },
        {
          name: 'Rate Limits',
          values: ['60/min', '300/min', '1000/min', 'Unlimited', 'Unlimited'],
        },
      ],
    },
    {
      name: 'Support & Services',
      features: [
        {
          name: 'Support Level',
          values: [
            'Community',
            'Email',
            'Priority',
            'Dedicated 24/7',
            'White-glove',
          ],
        },
        {
          name: 'SLA Guarantee',
          values: ['✗', '✗', '99.9%', '99.99%', 'Custom SLA'],
        },
        { name: 'Account Manager', values: ['✗', '✗', '✗', '✓', '✓'] },
        { name: 'Onboarding Session', values: ['✗', '✗', '✓', '✓', '✓'] },
      ],
    },
  ];

  const plans = ['Free', 'Starter', 'Pro', 'Premium', 'Enterprise'];

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.compareTable}>
        <thead>
          <tr>
            <th className={styles.compareThFirst}>Features</th>
            {plans.map((plan) => (
              <th
                key={plan}
                className={`${styles.compareTh} ${plan === 'Pro' ? styles.compareThPro : ''}`}
              >
                {plan}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <Fragment key={cat.name}>
              <tr className={styles.compareCategoryRow}>
                <td colSpan={6} className={styles.compareCategoryCell}>
                  {cat.name}
                </td>
              </tr>
              {cat.features.map((feature) => (
                <tr key={feature.name} className={styles.compareFeatureRow}>
                  <td className={styles.compareFeatureName}>{feature.name}</td>
                  {feature.values.map((val, vIdx) => {
                    const isCheck = val === '✓';
                    const isCross = val === '✗';
                    return (
                      <td key={vIdx} className={styles.compareFeatureValue}>
                        {isCheck ? (
                          <span className={styles.valCheck}>✓</span>
                        ) : isCross ? (
                          <span className={styles.valCross}>✗</span>
                        ) : (
                          <span className={styles.valText}>{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
