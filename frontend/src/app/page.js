"use client";
import React from "react";
import { useState } from "react";

import FarmLossForm from "./farm-loss-form/FarmLossForm";
import FormSection from "./dcf-form/dcf-form";
import ChartSection from "./dcf-page/dcf-page";

export default function Home() {
  const [data, setData] = useState([]);
  return (
    <main>
      <FarmLossForm />
      <ChartSection data={data} />
    </main>
  );
}