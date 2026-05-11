"use client";

import React, { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickSeries,
  BarSeries,
  LineSeries,
  BaselineSeries,
  CandlestickData,
  Time,
  LineStyle,
} from "lightweight-charts";
import styles from "./TradingViewChart.module.css";

type ChartType = "candlestick" | "bars" | "line" | "line-breaks" | "baseline";

interface TradingViewChartProps {
  data?: CandlestickData<Time>[];
  chartType?: ChartType;
}

// Sample Mock Data if none provided
const defaultData: CandlestickData<Time>[] = [
  {
    time: "2024-04-22",
    open: 180.34,
    high: 180.99,
    low: 178.84,
    close: 179.44,
  },
  {
    time: "2024-04-23",
    open: 179.44,
    high: 182.15,
    low: 179.44,
    close: 181.21,
  },
  { time: "2024-04-24", open: 181.21, high: 182.8, low: 180.7, close: 181.5 },
  { time: "2024-04-25", open: 181.5, high: 183.2, low: 181.4, close: 182.6 },
  { time: "2024-04-26", open: 182.6, high: 184.0, low: 182.3, close: 183.8 },
  { time: "2024-04-27", open: 183.8, high: 185.2, low: 183.5, close: 184.9 },
  { time: "2024-04-28", open: 184.9, high: 186.0, low: 184.5, close: 185.5 },
  { time: "2024-04-29", open: 185.5, high: 187.0, low: 185.2, close: 186.8 },
  { time: "2024-04-30", open: 186.8, high: 188.0, low: 186.5, close: 187.5 },
];

function getThemeValue(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function getChartTheme() {
  return {
    background: getThemeValue("--bg-page"),
    textColor: getThemeValue("--text-secondary"),
    gridColor: getThemeValue("--border-medium"),
    crosshairColor: getThemeValue("--border-strong"),
    borderColor: getThemeValue("--border-medium"),
    upColor: getThemeValue("--chart-up"),
    downColor: getThemeValue("--chart-down"),
    lineColor: getThemeValue("--chart-line"),
  };
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  data,
  chartType = "candlestick",
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const chartData = data || defaultData;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const initialTheme = getChartTheme();

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: {
          type: ColorType.Solid,
          color: initialTheme.background,
        },
        textColor: initialTheme.textColor,
        fontFamily: "Inter, sans-serif",
        attributionLogo: false,
      },
      grid: {
        vertLines: {
          color: initialTheme.gridColor,
          style: LineStyle.Solid,
        },
        horzLines: {
          color: initialTheme.gridColor,
          style: LineStyle.Solid,
        },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: initialTheme.crosshairColor,
          labelBackgroundColor: initialTheme.background,
        },
        horzLine: {
          color: initialTheme.crosshairColor,
          labelBackgroundColor: initialTheme.background,
        },
      },
      rightPriceScale: {
        borderColor: initialTheme.borderColor,
      },
      timeScale: {
        borderColor: initialTheme.borderColor,
      },
      handleScroll: true,
      handleScale: true,
    });

    // Theme Observer
    const observer = new MutationObserver(() => {
      const theme = getChartTheme();

      chart.applyOptions({
        layout: {
          background: {
            type: ColorType.Solid,
            color: theme.background,
          },
          textColor: theme.textColor,
        },
        grid: {
          vertLines: {
            color: theme.gridColor,
          },
          horzLines: {
            color: theme.gridColor,
          },
        },
        crosshair: {
          vertLine: {
            color: theme.crosshairColor,
            labelBackgroundColor: theme.background,
          },
          horzLine: {
            color: theme.crosshairColor,
            labelBackgroundColor: theme.background,
          },
        },
        rightPriceScale: {
          borderColor: theme.borderColor,
        },
        timeScale: {
          borderColor: theme.borderColor,
        },
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Add the appropriate series based on chartType
    switch (chartType) {
      case "candlestick": {
        const series = chart.addSeries(CandlestickSeries, {
          upColor: initialTheme.upColor,
          downColor: initialTheme.downColor,
          borderUpColor: initialTheme.upColor,
          borderDownColor: initialTheme.downColor,
          wickUpColor: initialTheme.upColor,
          wickDownColor: initialTheme.downColor,
        });
        series.setData(chartData);
        break;
      }
      case "bars": {
        const series = chart.addSeries(BarSeries, {
          upColor: initialTheme.upColor,
          downColor: initialTheme.downColor,
        });
        series.setData(chartData);
        break;
      }
      case "line": {
        const series = chart.addSeries(LineSeries, {
          color: initialTheme.lineColor,
          lineWidth: 2,
        });
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
        break;
      }
      case "line-breaks": {
        const series = chart.addSeries(LineSeries, {
          color: initialTheme.lineColor,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
        });
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
        break;
      }
      case "baseline": {
        // Calculate the average close for baseline value
        const avg =
          chartData.reduce((sum, d) => sum + d.close, 0) / chartData.length;
        const series = chart.addSeries(BaselineSeries, {
          baseValue: { type: "price" as const, price: avg },
          topLineColor: "rgba(38, 166, 154, 1)",
          topFillColor1: "rgba(38, 166, 154, 0.28)",
          topFillColor2: "rgba(38, 166, 154, 0.05)",
          bottomLineColor: "rgba(239, 83, 80, 1)",
          bottomFillColor1: "rgba(239, 83, 80, 0.05)",
          bottomFillColor2: "rgba(239, 83, 80, 0.28)",
        });
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
        break;
      }
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [chartData, chartType]);

  return (
    <div className={styles.chartWrapper}>
      <div ref={chartContainerRef} className={styles.chartContainer} />
    </div>
  );
};

export default TradingViewChart;
