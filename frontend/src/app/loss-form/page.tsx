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
import { useSearchParams } from 'next/navigation';

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

interface PredictionData {
  dates: string[];
  values: number[];
  forecast_dates: string[];
  forecast_values: number[];
  dcf_values: number[];
  total_npv: number;
}

export default function LossForm() {
  const searchParams = useSearchParams();
  const [chartData, setChartData] = useState<PredictionData | null>(null);
  
  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data)) as PredictionData;
        console.log('Received data:', decodedData);
        setChartData(decodedData);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    }
  }, [searchParams]);

  const [technique, setTechnique] = useState<TechniqueItem[]>([]);
  const [animals, setAnimals] = useState<AnimalItem[]>([]);
  const [territories, setTerritories] = useState<TerritoryItem[]>([]);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);

  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const renderChart = () => {
    if (!chartData || !chartData.dates || !chartData.forecast_dates) {
      console.log('Missing required chart data:', chartData);
      return null;
    }

    const actualData = chartData.dates.map((date, index) => ({
      year: parseInt(date.split('.')[2]),
      value: parseFloat(chartData.values[index].toString())
    })).sort((a, b) => a.year - b.year);

    const lastActualYear = actualData[actualData.length - 1].year;

    const forecastData = chartData.forecast_values.map((value, index) => ({
      year: lastActualYear + index + 1,
      value: parseFloat(value.toString())
    }));

    const lastActualPoint = actualData[actualData.length - 1];

    const sortedLabels = [
      ...actualData.map(d => d.year.toString()),
      ...forecastData.map(d => d.year.toString())
    ];

    console.log('Actual Data:', actualData);
    console.log('Forecast Data:', forecastData);

    const data = {
      labels: sortedLabels,
      datasets: [
        {
          label: "Фактичні дані",
          data: actualData.map(d => d.value),
          borderColor: "#0066cc",
          backgroundColor: "rgba(0, 102, 204, 0.1)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4
        },
        {
          label: "Прогнозовані дані",
          data: Array(actualData.length - 1).fill(null).concat([
            lastActualPoint.value,
            ...forecastData.map(d => d.value)
          ]),
          borderColor: "#ff3333",
          backgroundColor: "rgba(255, 51, 51, 0.1)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false, // Allow custom height
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            font: {
              size: 14
            }
          }
        },
        title: {
          display: true,
          text: 'Прогноз грошових потоків',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            font: {
              size: 12
            },
            maxRotation: 0, // Prevent label rotation
            autoSkip: false // Show all labels
          },
          afterFit: (scale: any) => {
            scale.width = scale.maxWidth * (sortedLabels.length / 5); // Adjust width based on number of years
          }
        },
        y: {
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            font: {
              size: 12
            }
          }
        }
      }
    };

    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
        <div style={{ height: '400px', width: `${Math.max(100, sortedLabels.length * 10)}%` }}>
          <Line options={chartOptions} data={data} />
        </div>
      </div>
    );
  };

  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true);
      setPdfGenerated(false);

      const chartCanvas = document.querySelector('canvas');
      const chartImage = chartCanvas?.toDataURL('image/png');

      const response = await fetch(
        "https://agriculture-losses-1llp.onrender.com/generate-pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            technique: technique,
            animals: animals,
            territories: territories,
            buildings: buildings,
            prediction: chartData
              ? {
                  forecast_dates: chartData.forecast_dates,
                  forecast_values: chartData.forecast_values,
                  dcf_values: chartData.dcf_values,
                  total_npv: chartData.total_npv,
                  chart: chartImage
                }
              : {
                  forecast_dates: [],
                  forecast_values: [],
                  dcf_values: [],
                  total_npv: 0,
                  chart: "",
                },
          }),
        }
      );

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-purple-200 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Форма фіксації втрат <span className="text-blue-600">фермерського господарства</span>
        </h1>

        {chartData && renderChart()}

        <div className="space-y-10">
          <TableSection
            title="Техніка"
            columns={["Назва/тип", "Кількість", "Вартість"]}
            items={technique}
            setItems={setTechnique}
          />
          <TableSection
            title="Тварини"
            columns={["Назва/тип", "Кількість", "Ціна за голову"]}
            items={animals}
            setItems={setAnimals}
          />
          <TableSection
            title="Територія"
            columns={["Назва/тип", "Площа (м²)", "Ціна за відновлення м²"]}
            items={territories}
            setItems={setTerritories}
          />
          <TableSection
            title="Будівлі і сховища"
            columns={["Назва/тип", "Площа/об'єм (м²)", "Вартість об'єкта"]}
            items={buildings}
            setItems={setBuildings}
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
