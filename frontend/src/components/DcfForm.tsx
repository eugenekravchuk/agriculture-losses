"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

interface FormError {
  type: "date" | "value";
  rowIndex: number;
  message: string;
}

export default function DcfForm({
  onSave,
  onClose,
}: {
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  if (typeof onSave !== "function" || typeof onClose !== "function") {
    throw new Error("DcfForm: onSave and onClose props must be functions");
  }

  const [rows, setRows] = useState([{ date: "", cashFlow: "" }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const router = useRouter();

  const validateDate = (date: string): boolean => {
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(date)) return false;
    const [day, month, year] = date.split(".").map(Number);
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 5) return false;
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  };

  const validateCashFlow = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  const updateRow = (i: number, field: "date" | "cashFlow", value: string) => {
    const updated = [...rows];
    updated[i][field] =
      field === "date" ? formatDate(value) : formatCashFlow(value);
    setRows(updated);

    const newErrors = errors.filter(
      (err) => !(err.rowIndex === i && err.type === field)
    );
    if (field === "date" && value && !validateDate(value)) {
      newErrors.push({
        type: "date",
        rowIndex: i,
        message: "Невірний формат дати (ДД.ММ.РРРР)",
      });
    }
    if (field === "cashFlow" && value && !validateCashFlow(value)) {
      newErrors.push({
        type: "value",
        rowIndex: i,
        message: "Введіть додатнє число",
      });
    }
    setErrors(newErrors);
  };

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let result = "";
    if (digits.length >= 2) result = digits.slice(0, 2);
    if (digits.length >= 4) result += "." + digits.slice(2, 4);
    if (digits.length >= 6) result += "." + digits.slice(4, 8);
    return result;
  };

  const formatCashFlow = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    return parts.length > 2
      ? parts[0] + "." + parts.slice(1).join("")
      : cleaned;
  };

  const isValidRow = (row: { date: string; cashFlow: string }) =>
    validateDate(row.date) && validateCashFlow(row.cashFlow);

  const isLastRowFilled = () => isValidRow(rows[rows.length - 1]);

  const addRow = () => {
    if (!isLastRowFilled()) {
      alert("Будь ласка, заповніть попередній рядок");
      return;
    }
    setRows((prev) => [...prev, { date: "", cashFlow: "" }]);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedRows = result.data.map((row: any) => ({
            date: row.date || "",
            cashFlow: row.cashFlow || "",
          }));
          setRows(parsedRows);
        },
      });
    }
  };

  const handleSave = async () => {
    try {
      const years = new Set(rows.map((row) => row.date.split(".")[2]));
      if (years.size < 2)
        throw new Error("Будь ласка, введіть дані мінімум за два різні роки");

      const formData = {
        dates: rows.map((row) => row.date),
        values: rows.map((row) => parseFloat(row.cashFlow)),
        discount_rate: 0.1,
      };

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          "https://agriculture-losses-1llp.onrender.com"
        }/predict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Помилка при обрахунку прогнозу");
      }

      const prediction = await response.json();
      onSave(prediction);
      router.push("/loss-form");
    } catch (error: any) {
      console.error("Помилка збереження:", error);
      alert(`Помилка: ${error.message}`);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 overflow-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
          onClick={onClose}
          aria-label="Закрити форму"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Форма обрахунку ДГП
        </h2>

        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="mb-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Дата (ДД.ММ.РРРР)</th>
                <th className="px-4 py-2">Грошовий потік (грн)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={
                    errors.some((e) => e.rowIndex === i) ? "bg-red-100" : ""
                  }
                >
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.date}
                      onChange={(e) => updateRow(i, "date", e.target.value)}
                      className={`w-full border rounded-lg px-2 py-1 ${
                        errors.some(
                          (e) => e.rowIndex === i && e.type === "date"
                        )
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="ДД.ММ.РРРР"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.cashFlow}
                      onChange={(e) => updateRow(i, "cashFlow", e.target.value)}
                      className={`w-full border rounded-lg px-2 py-1 ${
                        errors.some(
                          (e) => e.rowIndex === i && e.type === "value"
                        )
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="px-4 py-2 text-center">
                  <button
                    onClick={addRow}
                    disabled={!isLastRowFilled()}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Додати рядок
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || errors.length > 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-6 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Обробка..." : "Зберегти"}
        </button>
      </div>
    </div>
  );
}
