"use client";

import React, { useState, useEffect } from "react";
import styles from "./ChartsFooter.module.css";

export default function ChartsFooter() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setTime(istTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.left}>{/* Content removed per request */}</div>
      <div className={styles.right}>
        <div className={styles.timeContainer}>
          <div className={styles.liveIndicator} />
          <span className={styles.timeLabel}>IST</span>
          <span className={styles.timestamp}>{time}</span>
        </div>
      </div>
    </footer>
  );
}
