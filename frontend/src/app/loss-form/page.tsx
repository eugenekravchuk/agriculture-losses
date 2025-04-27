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
    const hardcodedData = {
      actualDates: [
        '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004',
        '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014',
        '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'
      ],
      actualValues: [
        488495800, 3264513000, 1938863000, 1609574000, 1636179000, 1485256000,
        1899907000, 2619727000, 3018212000, 3667204000, 4534320000, 5054161000,
        6747893000, 12069320000, 10166630000, 10453540000, 13421650000, 19072460000,
        17807780000, 18391200000, 15948180000, 16542110000, 18947570000, 19779270000,
        24070170000, 24136140000, 28881260000, 26334100000, 24233750000, 7064908000,
        7060010000
      ],
      predictedDates: ['2022', '2023', '2024', '2025'],
      predictedValues: [30017200000, 31141490000, 32254240000, 33355570000]
    };

    const data = {
      labels: hardcodedData.actualDates,
      datasets: [
        {
          label: "Raw Data",
          data: hardcodedData.actualValues,
          borderColor: "blue",
          backgroundColor: "transparent",
          borderWidth: 1,
          pointRadius: 0,
          tension: 0
        },
        {
          label: "Predicted Data (from 2022)",
          // Start the prediction line from 2021 to connect with actual data
          data: [...Array(26).fill(null), 
                 hardcodedData.actualValues[26], // 2021 value
                 ...hardcodedData.predictedValues],
          borderColor: "red",
          backgroundColor: "transparent",
          borderWidth: 1,
          pointRadius: 0,
          tension: 0
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: true
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: true
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };

    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
        <div style={{ height: '400px' }}>
          <Line options={options} data={data} />
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
            technique,
            animals,
            territories,
            buildings,
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
      setTechnique([]);
      setAnimals([]);
      setTerritories([]);
      setBuildings([]);
      setIsLoading(false);
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

        {renderChart()}

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
