'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './StrategyModal.module.css';

interface StrategyModalProps {
  onClose: () => void;
}

const CATEGORIES = ['My Strategy', 'Marketplace', 'Saved Strategies'];

const MOCK_STRATEGIES = [
  {
    name: 'Trend Follower Pro',
    description: 'Follows market trends using EMA and RSI',
    category: 'My Strategy',
  },
  {
    name: 'Mean Reversion Alpha',
    description: 'Identifies overbought/oversold levels',
    category: 'Marketplace',
  },
  {
    name: 'Scalping Edge',
    description: 'High frequency trading on 1m timeframe',
    category: 'Saved Strategies',
  },
  {
    name: 'Breakout Master',
    description: 'Trades support and resistance breakouts',
    category: 'My Strategy',
  },
  {
    name: 'MACD Momentum',
    description: 'Uses MACD crossovers for entry/exit',
    category: 'Marketplace',
  },
  {
    name: 'Bollinger Band Squeeze',
    description: 'Trades volatility contractions',
    category: 'Saved Strategies',
  },
  {
    name: 'Volume Profile Elite',
    description: 'Analyzes trading volume at specific price levels',
    category: 'Marketplace',
  },
  {
    name: 'Arbitrage Opportunity',
    description: 'Exploits price differences across exchanges',
    category: 'My Strategy',
  },
];

export default function StrategyModal({ onClose }: StrategyModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('My Strategy');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const strategyListRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const filteredStrategies = MOCK_STRATEGIES.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset highlight when filters or search change
  const [prevSearch, setPrevSearch] = useState(searchQuery);
  const [prevCategory, setPrevCategory] = useState(activeCategory);

  if (searchQuery !== prevSearch || activeCategory !== prevCategory) {
    setPrevSearch(searchQuery);
    setPrevCategory(activeCategory);
    setHighlightIndex(0);
  }

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const list = strategyListRef.current;
    if (!list) return;
    const activeItem = list.children[highlightIndex] as HTMLElement | undefined;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev < filteredStrategies.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : filteredStrategies.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredStrategies[highlightIndex]) {
            onClose();
          }
          break;
        case 'Tab':
          e.preventDefault();
          setActiveCategory((prev) => {
            const idx = CATEGORIES.indexOf(prev);
            return CATEGORIES[(idx + 1) % CATEGORIES.length];
          });
          break;
      }
    },
    [filteredStrategies, highlightIndex, onClose]
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      const modal = (e.currentTarget as HTMLElement).closest(
        `.${styles.modal}`
      ) as HTMLElement;
      if (!modal) return;
      const rect = modal.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!position) setPosition({ x: rect.left, y: rect.top });
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const modalStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'none',
      }
    : {};

  return (
    <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div
        className={styles.modal}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${styles.dragHandle} ${isDragging ? styles.dragging : ''}`}
          onMouseDown={handleDragStart}
        >
          <h2 className={styles.heading}>Strategies</h2>
          <span className={styles.shortcutHint}>Ctrl+J</span>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchLines}>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterRow}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.strategyList} ref={strategyListRef}>
          {filteredStrategies.length > 0 ? (
            filteredStrategies.map((s, i) => (
              <div
                key={s.name}
                className={`${styles.strategyItem} ${i === highlightIndex ? styles.highlighted : ''}`}
                onClick={onClose}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <div className={styles.strategyMain}>
                  <span className={styles.strategyName}>{s.name}</span>
                  <span className={styles.strategyDescription}>
                    {s.description}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>No strategies found</div>
          )}
        </div>
      </div>
    </div>
  );
}
