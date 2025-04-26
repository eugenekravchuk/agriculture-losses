"use client";
import React from "react";
import { useState } from "react";

import FarmLossForm from "./farm-loss-form/FarmLossForm";
import FormSection from "./form-section/form-section";
import ChartSection from "./chart-section/chart-section";

export default function Home() {
  const [data, setData] = useState([]);
  return (
    <main>
      <FarmLossForm />
      <ChartSection data={data} />
      <FormSection  onSave={setData}/>
    </main>
  );
}