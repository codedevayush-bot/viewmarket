"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SymbolSearchModal.module.css";

interface SymbolSearchModalProps {
  onClose: () => void;
}

const CATEGORIES = [
  "All",
  "Stocks",
  "Futures",
  "Options",
  "Forex",
  "Commodity",
  "Crypto",
];

const MOCK_SYMBOLS = [
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", type: "Crypto" },
  { symbol: "AAPL", name: "Apple Inc.", type: "Stocks" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", type: "Crypto" },
  { symbol: "TSLA", name: "Tesla, Inc.", type: "Stocks" },
  { symbol: "EURUSD", name: "Euro / US Dollar", type: "Forex" },
  { symbol: "GOLD", name: "Gold / US Dollar", type: "Commodity" },
  { symbol: "CRUDE", name: "Crude Oil", type: "Commodity" },
  { symbol: "NIFTY", name: "Nifty 50 Index", type: "Futures" },
  { symbol: "RELIANCE", name: "Reliance Industries", type: "Stocks" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", type: "Forex" },
  { symbol: "USOIL", name: "WTI Crude Oil", type: "Commodity" },
  { symbol: "SOLUSD", name: "Solana / US Dollar", type: "Crypto" },
];

export default function SymbolSearchModal({ onClose }: SymbolSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const symbolListRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Filter symbols
  const filteredSymbols = MOCK_SYMBOLS.filter((s) => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || s.type === activeCategory;
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

  // Auto-focus and Escape handler
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = symbolListRef.current;
    if (!list) return;
    const activeItem = list.children[highlightIndex] as HTMLElement | undefined;
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev < filteredSymbols.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSymbols.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredSymbols[highlightIndex]) {
            // Symbol selected — close modal
            onClose();
          }
          break;
        case "Tab":
          e.preventDefault();
          setActiveCategory((prev) => {
            const idx = CATEGORIES.indexOf(prev);
            return CATEGORIES[(idx + 1) % CATEGORIES.length];
          });
          break;
      }
    },
    [filteredSymbols, highlightIndex, onClose],
  );

  // --- Drag handlers ---
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      // Only left click
      if (e.button !== 0) return;
      setIsDragging(true);

      const modal = (e.currentTarget as HTMLElement).closest(
        `.${styles.modal}`,
      ) as HTMLElement;
      if (!modal) return;

      const rect = modal.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // If no position set yet, initialize from current rendered position
      if (!position) {
        setPosition({
          x: rect.left,
          y: rect.top,
        });
      }
    },
    [position],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Build modal style for positioning
  const modalStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: "none",
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
          className={`${styles.dragHandle} ${isDragging ? styles.dragging : ""}`}
          onMouseDown={handleDragStart}
        >
          <h2 className={styles.heading}>Search symbols</h2>
          <span className={styles.shortcutHint}>Ctrl+K</span>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchLines}>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterRow}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${activeCategory === category ? styles.active : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.symbolList} ref={symbolListRef}>
          {filteredSymbols.length > 0 ? (
            filteredSymbols.map((s, i) => (
              <div
                key={s.symbol}
                className={`${styles.symbolItem} ${i === highlightIndex ? styles.highlighted : ""}`}
                onClick={onClose}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <div className={styles.symbolMain}>
                  <span className={styles.symbolTicker}>{s.symbol}</span>
                  <span className={styles.symbolName}>{s.name}</span>
                </div>
                <span className={styles.symbolType}>{s.type}</span>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>No symbols found</div>
          )}
        </div>
      </div>
    </div>
  );
}
