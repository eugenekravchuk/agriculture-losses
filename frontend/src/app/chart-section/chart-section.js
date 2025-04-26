"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./chart-section.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartSection({ data }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data?.length) {
      setChartData({
        labels: data.map((r) => r.date),
        datasets: [
          {
            label: "Discounted Cash Flow",
            data: data.map((r) => r.value),
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      });
    }
  }, [data]);

  return (
    <div className={styles.wrapper}>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: "Discounted Cash Flow" },
              legend: { position: "bottom" },
            },
          }}
        />
      ) : (
        <p className={styles.placeholder}>
          Данні для графіку ще не передані.
        </p>
      )}
    </div>
  );
}