"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dcf-form.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DcfForm({ onSave, onClose }) {
  if (typeof onClose !== 'function') {
    throw new Error('DcfForm: onClose prop must be a function');
  }
  if (typeof onSave !== 'function') {
    throw new Error('DcfForm: onSave prop must be a function');
  }

  const [rows, setRows] = useState([{ date: "", cashFlow: "" }]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const formData = {
        dates: rows.map(row => row.date),
        values: rows.map(row => parseFloat(row.cashFlow)),
        discountRate: 0.1
      };

      const response = await fetch(`https://agriculture-losses-1llp.onrender.com//predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dates: formData.dates,
          values: formData.values,
          discount_rate: formData.discountRate
        })
      });

      const predictionData = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction data');
      }

      onSave(predictionData);
      
      router.push('/loss-form');

    } catch (error) {
      console.error('Prediction failed:', error);
      alert("Помилка при збереженні");
    } finally {
      setLoading(false);
    }
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