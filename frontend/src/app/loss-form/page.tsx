"use client";

import React, { useState, useEffect } from "react";
import TableSection from "./TableSection";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionData {
  dates: string[];
  values: number[];
  forecast_dates: string[];
  forecast_values: number[];
  dcf_values: number[];
  total_npv: number;
}

export default function LossForm({
  chartData,
}: {
  chartData: PredictionData | null;
}) {
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Прогноз грошових потоків" },
    },
  };

  const renderChart = () => {
    if (!chartData) return null;

    const data = {
      labels: [...chartData.dates, ...chartData.forecast_dates],
      datasets: [
        {
          label: "Фактичні дані",
          data: chartData.values,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        {
          label: "Прогнозовані дані",
          data: Array(chartData.dates.length)
            .fill(null)
            .concat(chartData.forecast_values),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };

    return (
      <div className="my-8">
        <Line options={chartOptions} data={data} />
      </div>
    );
  };

  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true);
      setPdfGenerated(false);
  
      if (!chartData) {
        throw new Error("Немає даних для генерації PDF");
      }
  
      const payload = {
        technique: [],
        animals: [],
        territories: [],
        buildings: [],
        prediction: {
          forecast_dates: chartData.forecast_dates,
          forecast_values: chartData.forecast_values,
          dcf_values: chartData.dcf_values,
          total_npv: chartData.total_npv,
          chart: "",
        },
      };
  
      const response = await fetch("https://your-render-domain.onrender.com/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
  
      const result = await response.json();
      const base64PDF = result.pdf_base64;
  
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(base64PDF), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
  
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfBlobUrl);
  
      const previewUrl = `data:application/pdf;base64,${base64PDF}`;
      setPdfPreview(previewUrl);
  
      setIsLoading(false);
      setPdfGenerated(true);
  
    } catch (error) {
      console.error("Помилка при генерації PDF:", error);
      setIsLoading(false);
      alert("Не вдалося створити PDF документ");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-purple-200 py-12 px-6 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-3xl p-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-10 leading-snug">
          Форма фіксації втрат{" "}
          <span className="text-blue-600">фермерського господарства</span>
        </h1>

        {chartData && renderChart()}

        <div className="space-y-10">
          <TableSection
            title="Техніка"
            columns={["Назва/тип", "Кількість", "Вартість"]}
          />
          <TableSection
            title="Тварини"
            columns={["Назва/тип", "Кількість", "Ціна за голову"]}
          />
          <TableSection
            title="Територія"
            columns={["Назва/тип", "Площа (м²)", "Ціна за відновлення м²"]}
          />
          <TableSection
            title="Будівлі і сховища"
            columns={["Назва/тип", "Площа/об'єм (м²)", "Вартість об'єкта"]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
          ) : (
            <button
              onClick={handleGeneratePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
            >
              Згенерувати PDF
            </button>
          )}
        </div>

        {pdfGenerated && pdfUrl && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            <iframe
              src={pdfPreview ?? ""}
              title="PDF Preview"
              width="100%"
              height="400px"
              className="rounded-lg border shadow-md"
            />
            <a
              href={pdfUrl}
              download="loss-form.pdf"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition hover:scale-105"
            >
              Завантажити документ
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
