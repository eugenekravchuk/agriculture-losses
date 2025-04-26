"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { Line } from "react-chartjs-2";
import styles from "./dcf-page.module.css";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DcfPageProps {
  data?: {
    dates: string[];
    forecast_dates: string[];
    values: number[];
    forecast_values: number[];
  };
  onFormOpen: () => void;
}

export default function DcfPage({ data, onFormOpen }: DcfPageProps) {
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

  useEffect(() => {
    if (data) {
      setChartData({
        labels: [...data.dates, ...data.forecast_dates],
        datasets: [
          {
            label: "Історичні дані",
            data: data.values,
            borderColor: "#2563EB",
            borderWidth: 2,
            tension: 0.1,
            fill: false,
          },
          {
            label: "Прогноз",
            data: Array(data.dates.length).fill(null).concat(data.forecast_values),
            borderColor: "#DC2626",
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            fill: false,
          }
        ],
      });
    }
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { 
          color: "#fff",
          maxRotation: 45,
          minRotation: 45
        },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { 
          color: "#fff",
          callback: (value: number) => 
            new Intl.NumberFormat('uk-UA', {
              style: 'currency',
              currency: 'UAH',
              maximumFractionDigits: 0
            }).format(value)
        },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#fff" },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('uk-UA', {
                style: 'currency',
                currency: 'UAH',
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className={styles.container}>
      <section className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          Форма обрахунку приведеного/дисконтованого грошового потоку
        </h1>
      </section>

      <section className={styles.subtitleSection}>
        <h2 className={styles.subtitle}>
          прийом, що використовується для підрахунку поточної (приведеної)
          вартості очікуваних у майбутньому надходжень і витрат
        </h2>
      </section>

      <section className={styles.formSection}>
        <div className={styles.instructionCard}>
          <ol className={styles.list}>
            <li>Натисніть кнопку "Заповнити форму"</li>
            <li>Заповніть форму або завантажте файл із даними</li>
            <li>Отримайте графік із розрахованими даними та фактичними втратами</li>
          </ol>
          <button
            className={styles.primaryButton}
            onClick={onFormOpen}
          >
            Заповнити форму
          </button>
        </div>
      </section>

      <section className={styles.chartSection}>
        <div className={styles.chartCard}>
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className={styles.placeholder}>
              Графік з'явиться тут після заповнення форми
            </p>
          )}
        </div>
      </section>
    </div>
  );
}