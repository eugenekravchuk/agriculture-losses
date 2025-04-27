"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import styles from "./dcf-form.module.css";

interface FormError {
  type: 'date' | 'value';
  rowIndex: number;
  message: string;
}

export default function DcfForm({ onSave, onClose }: { onSave: (data: any) => void; onClose: () => void }) {
  if (typeof onClose !== 'function') {
    throw new Error('DcfForm: onClose prop must be a function');
  }
  if (typeof onSave !== 'function') {
    throw new Error('DcfForm: onSave prop must be a function');
  }

  const [rows, setRows] = useState([{ date: "", cashFlow: "" }]);
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

  const isValidRow = (row) => {
    return row.date.length === 10 && row.date.match(/^\d{2}\.\d{2}\.\d{4}$/) && row.cashFlow.trim() !== "";
  };

  const isLastRowFilled = () => {
    const lastRow = rows[rows.length - 1];
    return isValidRow(lastRow);
  };

  const addRow = () => {
    if (!isLastRowFilled()) {
      alert("Будь ласка, заповніть попередній рядок");
      return;
    }
    setRows(prev => [...prev, { date: "", cashFlow: "" }]);
  };

  const formatDate = (value) => {
    const currentYear = new Date().getFullYear();
    
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) return '';
    
    let result = '';
    
    if (digitsOnly.length >= 2) {
      const day = parseInt(digitsOnly.slice(0, 2));
      if (day > 31) {
        result = '31';
      } else if (day < 1) {
        result = '01';
      } else {
        result = digitsOnly.slice(0, 2);
      }
    } else {
      result = digitsOnly;
      return result;
    }
    
    if (digitsOnly.length >= 4) {
      result += '.';
      const month = parseInt(digitsOnly.slice(2, 4));
      if (month > 12) {
        result += '12';
      } else if (month < 1) {
        result += '01';
      } else {
        result += digitsOnly.slice(2, 4);
      }
    } else if (digitsOnly.length > 2) {
      result += '.' + digitsOnly.slice(2);
      return result;
    }
    
    if (digitsOnly.length >= 6) {
      result += '.';
      const year = digitsOnly.slice(4, 8);
      if (year.length === 4) {
        const yearNum = parseInt(year);
        if (yearNum < 1900) {
          result += '1900';
        } else if (yearNum > currentYear) {
          result += currentYear.toString();
        } else {
          result += year;
        }
      } else {
        result += year;
      }
    } else if (digitsOnly.length > 4) {
      result += '.' + digitsOnly.slice(4);
    }
    
    return result;
  };

  const updateRow = (i, field, val) => {
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

  const router = useRouter();

  const handleSave = async () => {
    try {
      const years = new Set(
        rows.map(row => {
          const parts = row.date.split('.');
          return parts[2];
        })
      );

      if (years.size < 2) {
        throw new Error('Будь ласка, введіть дані мінімум за два різні роки');
      }

      const formData = {
        dates: rows.map(row => {
          const parts = row.date.split('.');
          if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
            throw new Error('Неправильний формат дати. Використовуйте ДД.ММ.РРРР');
          }
          return row.date;
        }),
        values: rows.map(row => {
          const value = parseFloat(row.cashFlow);
          if (isNaN(value)) {
            throw new Error('Неправильне числове значення');
          }
          return value;
        }),
        discount_rate: 0.1
      };

      const response = await fetch(`https://agriculture-losses-1llp.onrender.com/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to fetch prediction data');
      }

      const predictionData = await response.json();
      onSave(predictionData);
      router.push('/loss-form');

    } catch (error) {
      console.error('Prediction failed:', error);
      alert(`Помилка при збереженні: ${error.message}`);
    }
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
              <tr>
                <td colSpan="2">
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
