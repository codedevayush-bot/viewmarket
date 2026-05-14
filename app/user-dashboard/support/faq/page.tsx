'use client';

import { useState, useMemo } from 'react';
import styles from '../../UserDashboard.module.css';
import pageStyles from './FaqPage.module.css';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  // General
  {
    id: 'g1',
    category: 'General',
    question: 'What is ViewMarket?',
    answer:
      'ViewMarket is an enterprise-grade algorithmic trading platform that provides advanced charting, strategy automation, and seamless integration with over 30 global brokers.',
  },
  {
    id: 'g2',
    category: 'General',
    question: 'Do I need coding skills to use the platform?',
    answer:
      'While ViewMarket offers advanced Python and Webhook strategies, our Strategy Builder allows users to create complex automated workflows using a no-code interface.',
  },
  {
    id: 'g3',
    category: 'General',
    question: 'Which brokers are supported?',
    answer:
      "We support over 30+ major brokers including Interactive Brokers, TD Ameritrade, Zerodha, and more. You can find the full list in the 'Broker' section of your dashboard.",
  },
  // Billing & Pricing
  {
    id: 'b1',
    category: 'Billing & Pricing',
    question: 'How does the subscription model work?',
    answer:
      'We offer tiered monthly and annual subscription plans. Each plan comes with a specific set of features, including limits on concurrent strategies and broker connections.',
  },
  {
    id: 'b2',
    category: 'Billing & Pricing',
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes, you can cancel your subscription from the billing settings. Your access will continue until the end of your current billing cycle.',
  },
  {
    id: 'b3',
    category: 'Billing & Pricing',
    question: 'Do you offer a free trial?',
    answer:
      'Yes, we provide a 14-day free trial for our Pro plan, allowing you to explore all enterprise features without any initial commitment.',
  },
  // Technical Issues
  {
    id: 't1',
    category: 'Technical Issues',
    question: 'What is the typical latency for order execution?',
    answer:
      "Our system is optimized for high-performance trading with sub-millisecond internal processing. Final execution latency depends on your broker's API response times.",
  },
  {
    id: 't2',
    category: 'Technical Issues',
    question: 'How do I troubleshoot a connection error with my broker?',
    answer:
      "Ensure your API keys are valid and have the necessary permissions. Check the 'Broker' section for real-time connection logs and status indicators.",
  },
  {
    id: 't3',
    category: 'Technical Issues',
    question: 'Does the platform support real-time data?',
    answer:
      'Yes, we provide low-latency real-time market data across multiple asset classes, including stocks, forex, and cryptocurrencies.',
  },
  // Account & Security
  {
    id: 'a1',
    category: 'Account & Security',
    question: 'How is my data secured?',
    answer:
      'We use enterprise-grade AES-256 encryption for all sensitive data, including API keys. Our platform follows strict security protocols and regular audit cycles.',
  },
  {
    id: 'a2',
    category: 'Account & Security',
    question: 'Can I enable Two-Factor Authentication (2FA)?',
    answer:
      'Absolutely. We strongly recommend enabling 2FA in your account settings to add an extra layer of security to your trading operations.',
  },
  {
    id: 'a3',
    category: 'Account & Security',
    question: 'Is my broker account login information stored?',
    answer:
      'No, we never store your broker login credentials. We only use API keys provided by you to interact with your broker on your behalf.',
  },
  // Services / Platform Usage
  {
    id: 'p1',
    category: 'Services / Platform Usage',
    question: 'How many strategies can I run simultaneously?',
    answer:
      'The number of concurrent strategies depends on your subscription plan. The Starter plan allows up to 3, while our Enterprise plan supports unlimited strategies.',
  },
  {
    id: 'p2',
    category: 'Services / Platform Usage',
    question: 'What asset classes can I trade?',
    answer:
      'Our platform supports Equities, Options, Futures, Forex, and Cryptocurrencies, depending on the capabilities of your connected broker.',
  },
  {
    id: 'p3',
    category: 'Services / Platform Usage',
    question: 'Can I backtest my strategies before going live?',
    answer:
      'Yes, our Strategy Builder includes a robust backtesting engine that uses historical data to simulate strategy performance under various market conditions.',
  },
  {
    id: 'p4',
    category: 'Services / Platform Usage',
    question: 'What are Webhook strategies?',
    answer:
      'Webhook strategies allow you to trigger trades from external platforms like TradingView by sending automated HTTP requests to our secure endpoints.',
  },
];

const categories = [
  'All',
  'General',
  'Billing & Pricing',
  'Technical Issues',
  'Account & Security',
  'Services / Platform Usage',
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className={styles.container}>
      <header className={pageStyles.header}>
        <h1 className={styles.title}>Knowledge Base</h1>
        <p className={styles.subtitle}>
          Find answers to common questions about the ViewMarket platform.
        </p>

        <div className={pageStyles.searchWrapper}>
          <svg
            className={pageStyles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search FAQs..."
            className={pageStyles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search FAQs"
          />
        </div>
      </header>

      <div className={pageStyles.categories} role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`${pageStyles.categoryBtn} ${activeCategory === cat ? pageStyles.activeCategory : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={pageStyles.faqList}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className={pageStyles.faqItem}>
              <button
                className={pageStyles.itemHeader}
                onClick={() => toggleItem(faq.id)}
                aria-expanded={openItems.has(faq.id)}
              >
                <span className={pageStyles.question}>{faq.question}</span>
                <svg
                  className={`${pageStyles.chevron} ${openItems.has(faq.id) ? pageStyles.chevronOpen : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className={`${pageStyles.itemContent} ${openItems.has(faq.id) ? pageStyles.contentOpen : ''}`}
                style={{ maxHeight: openItems.has(faq.id) ? '500px' : '0' }}
              >
                <div className={pageStyles.answer}>{faq.answer}</div>
              </div>
            </div>
          ))
        ) : (
          <div className={pageStyles.emptyState}>
            No results found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
