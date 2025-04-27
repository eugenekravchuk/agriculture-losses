"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import styles from "./dcf-form.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DcfForm({ onSave, onClose }: { onSave: (data: any) => void; onClose: () => void }) {
  if (typeof onClose !== 'function') {
    throw new Error('DcfForm: onClose prop must be a function');
  }
  if (typeof onSave !== 'function') {
    throw new Error('DcfForm: onSave prop must be a function');
  }

  const [rows, setRows] = useState([{ date: "", cashFlow: "" }]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isValidRow = (row: { date: string; cashFlow: string }) => {
    return row.date.length === 10 && /^\d{2}\.\d{2}\.\d{4}$/.test(row.date) && row.cashFlow.trim() !== "";
  };

  const isLastRowFilled = () => isValidRow(rows[rows.length - 1]);

  const addRow = () => {
    if (!isLastRowFilled()) {
      alert("Будь ласка, заповніть попередній рядок");
      return;
    }
    setRows(prev => [...prev, { date: "", cashFlow: "" }]);
  };

  const formatDate = (value: string) => {
    const currentYear = new Date().getFullYear();
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length === 0) return '';
    let result = '';

    if (digitsOnly.length >= 2) {
      let day = parseInt(digitsOnly.slice(0, 2));
      day = Math.min(Math.max(day, 1), 31);
      result = day.toString().padStart(2, '0');
    } else {
      result = digitsOnly;
      return result;
    }

    if (digitsOnly.length >= 4) {
      result += '.';
      let month = parseInt(digitsOnly.slice(2, 4));
      month = Math.min(Math.max(month, 1), 12);
      result += month.toString().padStart(2, '0');
    } else if (digitsOnly.length > 2) {
      result += '.' + digitsOnly.slice(2);
      return result;
    }

    if (digitsOnly.length >= 6) {
      result += '.';
      let year = digitsOnly.slice(4, 8);
      let yearNum = parseInt(year);
      if (yearNum < 1900) year = '1900';
      if (yearNum > currentYear) year = currentYear.toString();
      result += year;
    } else if (digitsOnly.length > 4) {
      result += '.' + digitsOnly.slice(4);
    }

    return result;
  };

  const updateRow = (i: number, field: "date" | "cashFlow", val: string) => {
    const copy = [...rows];
    if (field === "date") {
      copy[i][field] = formatDate(val);
    } else if (field === "cashFlow") {
      const numericValue = val.replace(/[^\d.]/g, '');
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        copy[i][field] = parts[0] + '.' + parts.slice(1).join('');
      } else {
        copy[i][field] = numericValue;
      }
    }
    setRows(copy);
  };

  const handleSave = async () => {
    try {
      const years = new Set(rows.map(row => row.date.split('.')[2]));

      if (years.size < 2) {
        throw new Error('Будь ласка, введіть дані мінімум за два різні роки');
      }

      const formData = {
        dates: rows.map(row => row.date),
        values: rows.map(row => parseFloat(row.cashFlow)),
        discount_rate: 0.1
      };

      const response = await fetch(`https://agriculture-losses-1llp.onrender.com/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Помилка запиту');
      }

      const predictionData = await response.json();
      onSave(predictionData);
      router.push('/loss-form');
    } catch (error: any) {
      console.error('Prediction failed:', error);
      alert(`Помилка при збереженні: ${error.message}`);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data as any[];
        if (parsedData.length === 0 || !('date' in parsedData[0]) || !('cashFlow' in parsedData[0])) {
          alert('CSV має містити колонки "date" і "cashFlow"');
          return;
        }

        const newRows = parsedData.map(item => ({
          date: item.date,
          cashFlow: item.cashFlow
        }));

        setRows(newRows);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Не вдалося зчитати CSV');
      }
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.formContainer}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрити форму">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 className={styles.formTitle}>Форма обрахунку ДГП</h2>

        <div className="mb-4 flex justify-start">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      transition"
          />
        </div>


        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Грошовий потік (грн)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      placeholder="ДД.ММ.РРРР"
                      value={row.date}
                      maxLength={10}
                      onChange={(e) => updateRow(i, "date", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={row.cashFlow}
                      onChange={(e) => updateRow(i, "cashFlow", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <button
                    onClick={addRow}
                    className={styles.addButton}
                    disabled={!isLastRowFilled()}
                  >
                    +
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !rows.every(isValidRow)}
          className={styles.saveButton}
        >
          {loading ? "Збереження..." : "Зберегти дані"}
        </button>
      </div>
    </div>
  );
}
