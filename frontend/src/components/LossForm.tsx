"use client";

import React, { useState } from "react";
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

interface TechniqueItem {
  name: string;
  quantity: number;
  price: number;
}

interface AnimalItem {
  name: string;
  quantity: number;
  price_per_unit: number;
}

interface TerritoryItem {
  name: string;
  area_m2: number;
  repair_price_per_m2: number;
}

interface BuildingItem {
  name: string;
  area_m2: number;
  price: number;
}

export interface PredictionData {
  dates: string[];
  values: number[];
  forecast_dates: string[];
  forecast_values: number[];
  dcf_values: number[];
  total_npv: number;
}

interface LossFormProps {
  chartData: PredictionData | null;
}

export default function LossForm({ chartData }: LossFormProps) {
  const [technique, setTechnique] = useState<TechniqueItem[]>([]);
  const [animals, setAnimals] = useState<AnimalItem[]>([]);
  const [territories, setTerritories] = useState<TerritoryItem[]>([]);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);

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
      <div className="my-8 backdrop-blur-md bg-white/60 p-4 sm:p-6 rounded-xl shadow-md overflow-x-auto">
        <Line options={chartOptions} data={data} />
      </div>
    );
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    setPdfGenerated(false);

    try {
      const payload = {
        technique: technique
          .filter(
            (item) =>
              item.name &&
              item.quantity !== undefined &&
              item.price !== undefined
          )
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        animals: animals
          .filter(
            (item) =>
              item.name &&
              item.quantity !== undefined &&
              item.price_per_unit !== undefined
          )
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price_per_unit: item.price_per_unit,
          })),
        territories: territories
          .filter(
            (item) =>
              item.name &&
              item.area_m2 !== undefined &&
              item.repair_price_per_m2 !== undefined
          )
          .map((item) => ({
            name: item.name,
            area_m2: item.area_m2,
            repair_price_per_m2: item.repair_price_per_m2,
          })),
        buildings: buildings
          .filter(
            (item) =>
              item.name &&
              item.area_m2 !== undefined &&
              item.price !== undefined
          )
          .map((item) => ({
            name: item.name,
            area_m2: item.area_m2,
            price: item.price,
          })),
        prediction: chartData
          ? {
              forecast_dates: chartData.forecast_dates,
              forecast_values: chartData.forecast_values,
              dcf_values: chartData.dcf_values,
              total_npv: chartData.total_npv,
            }
          : {
              forecast_dates: [],
              forecast_values: [],
              dcf_values: [],
              total_npv: 0,
            },
      };

      console.log("Відправляємо payload:", payload); // <== Додати!

      const response = await fetch(
        "https://agriculture-losses-1llp.onrender.com/generate-pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text(); // <== замість response.json() читаємо текст

      if (!response.ok) {
        console.error("Помилка відповіді сервера:", text);
        throw new Error(`Помилка сервера ${response.status}: ${text}`);
      }

      const result = JSON.parse(text); // якщо ок, тоді вже розпарсимо в JSON

      // далі працюємо як було
      const base64PDF = result.pdf_base64;
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(base64PDF), (c) => c.charCodeAt(0))],
        { type: "application/pdf" }
      );
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);

      setPdfUrl(pdfBlobUrl);
      setPdfPreview(`data:application/pdf;base64,${base64PDF}`);
      setPdfGenerated(true);

      setTechnique([]);
      setAnimals([]);
      setTerritories([]);
      setBuildings([]);
    } catch (error: any) {
      console.error("Помилка при генерації PDF:", error);
      alert(error.message || "Не вдалося створити PDF документ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start overflow-auto">
      <div className="w-full max-w-7xl py-12 px-4 sm:px-6 flex flex-col items-center relative">
        {/* Header */}
        <header className="w-full fixed top-0 bg-white/80 backdrop-blur-md shadow-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-start items-center">
            <a
              href="/"
              className="text-base sm:text-lg text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-300"
            >
              ← На головну
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="pt-32 w-full bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-6 sm:p-12 space-y-10 transition-all">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-center leading-tight bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 text-transparent bg-clip-text mb-8">
            Форма фіксації втрат фермерського господарства
          </h1>

          {chartData && renderChart()}

          <div className="space-y-10">
            <TableSection
              title="Техніка"
              columns={["Назва/тип", "Кількість", "Вартість (грн)"]}
              items={technique}
              setItems={setTechnique}
            />
            <TableSection
              title="Тварини"
              columns={["Назва/тип", "Кількість", "Ціна за голову (грн)"]}
              items={animals}
              setItems={setAnimals}
            />
            <TableSection
              title="Територія"
              columns={[
                "Назва/тип",
                "Площа (м²)",
                "Ціна за відновлення м² (грн)",
              ]}
              items={territories}
              setItems={setTerritories}
            />
            <TableSection
              title="Будівлі і сховища"
              columns={[
                "Назва/тип",
                "Площа/об'єм (м²)",
                "Вартість об'єкта (грн)",
              ]}
              items={buildings}
              setItems={setBuildings}
            />
          </div>

          <div className="mt-12 flex flex-col items-center w-full">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            ) : (
              <button
                onClick={handleGeneratePDF}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 active:scale-95"
              >
                Згенерувати PDF
              </button>
            )}
          </div>

          {pdfGenerated && pdfUrl && (
            <div className="mt-8 flex flex-col items-center space-y-6">
              <div className="bg-green-100 text-green-800 font-semibold py-2 px-6 rounded-full shadow-md">
                ✅ PDF успішно створено!
              </div>
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
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition transform hover:scale-105"
              >
                Завантажити документ
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
