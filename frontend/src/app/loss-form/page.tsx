'use client';

import React, { useState } from "react";
import TableSection from "./TableSection";
import "./loss-form.css";
import { jsPDF } from "jspdf";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LossForm({ chartData }) {
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Прогноз грошових потоків',
      },
    },
  };

  const renderChart = () => {
    if (!chartData) return null;

    const data = {
      labels: [...chartData.dates, ...chartData.forecast_dates],
      datasets: [
        {
          label: 'Фактичні дані',
          data: chartData.values,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Прогнозовані дані',
          data: Array(chartData.dates.length).fill(null).concat(chartData.forecast_values),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };

    return (
      <div className="chart-container">
        <Line options={chartOptions} data={data} />
      </div>
    );
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    setPdfGenerated(false);

    setTimeout(() => {
      const doc = new jsPDF();
      doc.text("Форма фіксації втрат", 20, 20);
      doc.text("Дані з таблиць можна буде сюди додати пізніше.", 20, 30);

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setIsLoading(false);
      setPdfGenerated(true);
    }, 2000);
  };

  return (
    <div className="loss-form-wrapper">
      <h1>Форма фіксації втрат фермерського господарства</h1>

      {chartData && renderChart()}

      <TableSection title="Техніка" columns={["Назва/тип", "Кількість", "Вартість"]} />
      <TableSection title="Тварини" columns={["Назва/тип", "Кількість", "Ціна за голову"]} />
      <TableSection title="Територія" columns={["Назва/тип", "Площа (м²)", "Ціна за відновлення м²"]} />
      <TableSection title="Будівлі і сховища" columns={["Назва/тип", "Площа/об'єм (м²)", "Вартість об'єкта"]} />

      {isLoading ? (
        <div className="loader"></div>
      ) : (
        <button className="generate-button" onClick={handleGeneratePDF}>
          Згенерувати PDF
        </button>
      )}

      {pdfGenerated && pdfUrl && (
        <div className="pdf-preview">
          <div className="pdf-placeholder">PDF</div>
          <a href={pdfUrl} download="loss-form.pdf" className="download-link">
            Download PDF document
          </a>
        </div>
      )}
    </div>
  );
}
