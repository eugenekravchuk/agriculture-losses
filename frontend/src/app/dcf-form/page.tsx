"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dcf-form.module.css";

interface FormError {
  type: 'date' | 'value';
  rowIndex: number;
  message: string;
}

export default function DcfForm({ onSave, onClose }) {
  const [rows, setRows] = useState([
    { date: "", cashFlow: "" },
    { date: "", cashFlow: "" }  // Added second default row
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const router = useRouter();

  const validateDate = (date: string): boolean => {
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!dateRegex.test(date)) return false;

    const [, day, month, year] = date.match(dateRegex) || [];
    const numYear = parseInt(year);
    const numMonth = parseInt(month);
    const numDay = parseInt(day);
    const currentYear = new Date().getFullYear();

    if (numYear < 2000 || numYear > currentYear + 5) return false;
    if (numMonth < 1 || numMonth > 12) return false;

    const daysInMonth = new Date(numYear, numMonth, 0).getDate();
    if (numDay < 1 || numDay > daysInMonth) return false;

    return true;
  };

  const validateCashFlow = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= 0;
  };

  const updateRow = (index: number, field: 'date' | 'cashFlow', value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);

    // Validate and set errors
    const newErrors = errors.filter(e => !(e.rowIndex === index && e.type === field));
    
    if (field === 'date' && value && !validateDate(value)) {
      newErrors.push({
        type: 'date',
        rowIndex: index,
        message: 'Невірний формат дати (ДД.ММ.РРРР)'
      });
    }

    if (field === 'cashFlow' && value && !validateCashFlow(value)) {
      newErrors.push({
        type: 'value',
        rowIndex: index,
        message: 'Введіть додатнє число'
      });
    }

    setErrors(newErrors);
  };

  const handleSave = async () => {
    try {
      const formData = {
        dates: rows.map(row => row.date),
        values: rows.map(row => {
          const value = parseFloat(row.cashFlow);
          if (isNaN(value)) {
            throw new Error('Invalid cash flow value');
          }
          return value;
        }),
        discount_rate: 0.1
      };

      console.log('Sending data:', formData); // Debug log

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch prediction data');
      }

      const predictionData = await response.json();
      console.log('Received prediction:', predictionData);

      const dataToPass = {
        dates: formData.dates,
        values: formData.values,
        forecast_dates: predictionData.forecast_dates,
        forecast_values: predictionData.forecast_values.map(v => parseFloat(v)),
        dcf_values: predictionData.dcf_values.map(v => parseFloat(v)),
        total_npv: parseFloat(predictionData.total_npv)
      };

      console.log('Data to pass:', dataToPass);
      const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
      window.location.href = `/loss-form?data=${encodedData}`;
      
    } catch (error) {
      console.error('Prediction failed:', error);
      alert(`Помилка при збереженні: ${error.message}`);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.formContainer}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрити форму"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M6 18L18 6M6 6L18 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h2 className={styles.formTitle}>Форма обрахунку ДГП</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата (ДД.ММ.РРРР)</th>
                <th>Грошовий потік (грн)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={errors.some(e => e.rowIndex === i) ? styles.errorRow : ''}>
                  <td>
                    <input
                      type="text"
                      placeholder="31.12.2023"
                      value={row.date}
                      onChange={(e) => updateRow(i, "date", e.target.value)}
                      className={errors.some(e => e.rowIndex === i && e.type === 'date') ? styles.errorInput : ''}
                    />
                    {errors.map((error, index) => 
                      error.rowIndex === i && error.type === 'date' && (
                        <div key={index} className={styles.errorMessage}>{error.message}</div>
                      )
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="1000.00"
                      value={row.cashFlow}
                      onChange={(e) => updateRow(i, "cashFlow", e.target.value)}
                      className={errors.some(e => e.rowIndex === i && e.type === 'value') ? styles.errorInput : ''}
                    />
                    {errors.map((error, index) => 
                      error.rowIndex === i && error.type === 'value' && (
                        <div key={index} className={styles.errorMessage}>{error.message}</div>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            onClick={() => setRows([...rows, { date: "", cashFlow: "" }])}
            className={styles.addButton}
          >
            Додати рядок
          </button>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading || errors.length > 0}
          className={styles.saveButton}
        >
          {loading ? "Обробка..." : "Зберегти"}
        </button>
      </div>
    </div>
  );
}