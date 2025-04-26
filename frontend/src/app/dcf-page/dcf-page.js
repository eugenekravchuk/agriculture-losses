"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DcfForm from "../dcf-form/dcf-form";
import styles from "./dcf-page.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function DcfPage() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => {
    setShowForm(false);
  };

  const handleSave = (result) => {
    setData(result);
    setShowForm(false);
  };

  useEffect(() => {
    if (data.length) {
      setChartData({
        labels: data.map((r) => r.date),
        datasets: [
          {
            label: "Data 1",
            data: data.map((r) => r.value),
            borderColor: "#2563EB",
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      });
    }
  }, [data]);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          Форма обрахунку приведеного/дисконтованого грошового потоку
        </h1>
      </section>

      {/* Subtitle Section */}
      <section className={styles.subtitleSection}>
        <h2 className={styles.subtitle}>
          прийом, що використовується для підрахунку поточної (приведеної)
          вартості очікуваних у майбутньому надходжень і витрат
        </h2>
      </section>

      {/* Form Section */}
      <section className={styles.formSection}>
        <div className={styles.instructionCard}>
          <ol className={styles.list}>
            <li>Натисніть кнопку "Заповнити форму"</li>
            <li>Заповніть форму або завантажте файл із даними</li>
            <li>Отримайте графік із розрахованими даними та фактичними втратами</li>
          </ol>
          <button
            className={styles.primaryButton}
            onClick={() => setShowForm(true)}
          >
            Заповнити форму
          </button>
        </div>
      </section>

      {/* Chart Section */}
      <section className={styles.chartSection}>
        <div className={styles.chartCard}>
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "#fff" },
                  },
                  y: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "#fff" },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: "#fff" },
                  },
                },
              }}
            />
          ) : (
            <p className={styles.placeholder}>
              Графік з'явиться тут після заповнення форми
            </p>
          )}
        </div>
      </section>

      {showForm && (
        <DcfForm
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}