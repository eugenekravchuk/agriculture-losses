import React from "react";
import FarmLossForm from "./farm-loss-form/FarmLossForm";
import FormSection from "./chart-section/form-section";
import ChartSection from "./chart-section/chart-section";

export default function Home() {
  const [data, setData] = useState([]);
  return (
    <main>
      <FarmLossForm />
      <FormSection  onSave={setData}/>
      <ChartSection data={data} />
    </main>
  );
}