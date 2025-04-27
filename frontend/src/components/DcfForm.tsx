"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import styles from "./dcf-form.module.css";

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
  const router = useRouter();

  if (typeof onClose !== "function") {
    throw new Error("DcfForm: onClose prop must be a function");
  }
  if (typeof onSave !== "function") {
    throw new Error("DcfForm: onSave prop must be a function");
  }

  const [rows, setRows] = useState([
    { date: "", cashFlow: "" },
    { date: "", cashFlow: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);

  const validateDate = (date: string): boolean => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      return false;
    }

    const [day, month, year] = date.split(".").map((num) => parseInt(num, 10));

    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear + 5) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    if (day < 1 || day > 31) {
      return false;
    }

    return true;
  };

  const validateCashFlow = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= 0;
  };

  const updateRow = (
    index: number,
    field: "date" | "cashFlow",
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);

    // Validate and set errors
    const newErrors = errors.filter(
      (e) => !(e.rowIndex === index && e.type === field)
    );

    if (field === "date" && value && !validateDate(value)) {
      newErrors.push({
        type: "date",
        rowIndex: index,
        message: "Дата має бути першим числом місяця (DD.MM.YYYY)",
      });
    }

    if (field === "cashFlow" && value && !validateCashFlow(value)) {
      newErrors.push({
        type: "value",
        rowIndex: index,
        message: "Введіть додатнє число",
      });
    }

    setErrors(newErrors);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = {
        dates: rows.map((row) => row.date),
        values: rows.map((row) => parseFloat(row.cashFlow)),
      };

      // Just call onSave with the data directly
      await onSave(formData);

      // Navigate to loss-form
      router.push("/loss-form");
    } catch (error) {
      console.error("Failed:", error);
      alert(`Помилка при збереженні: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isValidRow = (row) => {
    return (
      row.date.length === 10 &&
      row.date.match(/^\d{2}\.\d{2}\.\d{4}$/) &&
      row.cashFlow.trim() !== ""
    );
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
    setRows((prev) => [...prev, { date: "", cashFlow: "" }]);
  };

  const formatDate = (value) => {
    const currentYear = new Date().getFullYear();

    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly.length === 0) return "";

    let result = "";

    if (digitsOnly.length >= 2) {
      const day = parseInt(digitsOnly.slice(0, 2));
      if (day > 31) {
        result = "31";
      } else if (day < 1) {
        result = "01";
      } else {
        result = digitsOnly.slice(0, 2);
      }
    } else {
      result = digitsOnly;
      return result;
    }

    if (digitsOnly.length >= 4) {
      result += ".";
      const month = parseInt(digitsOnly.slice(2, 4));
      if (month > 12) {
        result += "12";
      } else if (month < 1) {
        result += "01";
      } else {
        result += digitsOnly.slice(2, 4);
      }
    } else if (digitsOnly.length > 2) {
      result += "." + digitsOnly.slice(2);
      return result;
    }

    if (digitsOnly.length >= 6) {
      result += ".";
      const year = digitsOnly.slice(4, 8);
      if (year.length === 4) {
        const yearNum = parseInt(year);
        if (yearNum < 1900) {
          result += "1900";
        } else if (yearNum > currentYear) {
          result += currentYear.toString();
        } else {
          result += year;
        }
      } else {
        result += year;
      }
    } else if (digitsOnly.length > 4) {
      result += "." + digitsOnly.slice(4);
    }

    return result;
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          alert("CSV файл порожній");
          return;
        }

        const parsedRows = results.data
          .filter((row: any[]) => row.length >= 2)
          .map((row: any[]) => ({
            date: row[0].toString().trim(),
            cashFlow: row[1].toString().trim(),
          }));

        setRows(parsedRows);
        setErrors([]);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Помилка при обробці CSV файлу");
      },
      header: false,
      skipEmptyLines: true,
    });

    event.target.value = "";
  };

  const validateForm = () => {
    // If we have more than 1 row, assume it's from CSV and skip validation
    if (rows.length > 2) {
      return true;
    }

    // For manually entered data, keep existing validation
    if (rows.length < 2) {
      alert("Будь ласка, додайте хоча б два записи");
      return false;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!validateDate(row.date)) {
        alert(`Невірний формат дати в рядку ${i + 1}`);
        return false;
      }
      if (!validateCashFlow(row.cashFlow)) {
        alert(`Невірний формат числа в рядку ${i + 1}`);
        return false;
      }
    }

    const years = new Set(rows.map((row) => row.date.split(".")[2]));
    if (years.size < 2) {
      alert("Будь ласка, введіть дані мінімум за два різні роки");
      return false;
    }

    return true;
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

        <div className="mb-4 flex justify-start items-center">
          <label className="relative inline-flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        transition cursor-pointer"
            />
          </label>
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
                <tr
                  key={i}
                  className={
                    errors.some((e) => e.rowIndex === i) ? styles.errorRow : ""
                  }
                >
                  <td>
                    <input
                      type="text"
                      placeholder="31.12.2023"
                      value={row.date}
                      onChange={(e) => updateRow(i, "date", e.target.value)}
                      className={
                        errors.some(
                          (e) => e.rowIndex === i && e.type === "date"
                        )
                          ? styles.errorInput
                          : ""
                      }
                    />
                    {errors.map(
                      (error, index) =>
                        error.rowIndex === i &&
                        error.type === "date" && (
                          <div key={index} className={styles.errorMessage}>
                            {error.message}
                          </div>
                        )
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="1000.00"
                      value={row.cashFlow}
                      onChange={(e) => updateRow(i, "cashFlow", e.target.value)}
                      className={
                        errors.some(
                          (e) => e.rowIndex === i && e.type === "value"
                        )
                          ? styles.errorInput
                          : ""
                      }
                    />
                    {errors.map(
                      (error, index) =>
                        error.rowIndex === i &&
                        error.type === "value" && (
                          <div key={index} className={styles.errorMessage}>
                            {error.message}
                          </div>
                        )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addRow}
            className={styles.addButton}
            disabled={!isLastRowFilled()}
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
