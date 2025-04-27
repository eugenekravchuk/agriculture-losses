"use client";

import LossForm from "@/components/LossForm";
import { useEffect, useState } from "react";
import { PredictionData } from "@/components/LossForm";

export default function LossFormPage() {
  const [chartData, setChartData] = useState<PredictionData | null>(null);

  useEffect(() => {
    // Read prediction data from localStorage (or sessionStorage)
    const savedData = localStorage.getItem("predictionData");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setChartData(parsedData);
      } catch (error) {
        console.error("Error parsing prediction data:", error);
      }
    }
  }, []);

  return <LossForm chartData={chartData} />;
}
