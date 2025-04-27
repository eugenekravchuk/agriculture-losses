"use client";

import { useRouter } from "next/navigation";
import DcfForm from "@/components/DcfForm";

export default function DcfFormPage() {
  const router = useRouter();

  const handleSave = (data: any) => {
    console.log("Prediction data:", data);
    router.push("/loss-form");
  };

  const handleClose = () => {
    router.back();
  };

  return <DcfForm onSave={handleSave} onClose={handleClose} />;
}
