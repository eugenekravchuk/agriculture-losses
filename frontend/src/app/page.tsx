"use client";
import React, { useState } from "react";
import FarmLossForm from "./farm-loss-form/page";
import DcfForm from "./dcf-form/page";
import DcfPage from "./dcf-page/page";
import Main from "./main/page";

export default function Home() {
  const [showDcfForm, setShowDcfForm] = useState(false);
  const [dcfData, setDcfData] = useState(null);

  const handleDcfSave = (result) => {
    setDcfData(result);
    setShowDcfForm(false);
  };

  return (
    <main>
      {/* <FarmLossForm chartData={dcfData} />
      <DcfPage
        data={dcfData}
        onFormOpen={() => setShowDcfForm(true)}
      />
      {showDcfForm && (
        <DcfForm
          onSave={handleDcfSave}
          onClose={() => setShowDcfForm(false)}
        />
      )} */}
      <Main />
    </main>
  );
}
