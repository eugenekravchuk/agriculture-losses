"use client";

import { useState } from "react";
import styles from "./FormSection.module.css";

export default function FormSection({ onSave }) {
  const [rows, setRows] = useState([
    { date: "", cashFlow: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const addRow = () =>
    setRows((prev) => [...prev, { date: "", cashFlow: "" }]);

  const updateRow = (i, field, val) => {
    const copy = [...rows];
    copy[i][field] = val;
    setRows(copy);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://YOUR-HOSTED-API/discounted-cashflow",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: rows }),
        }
      );
      const result = await res.json();
      // result має вигляд [{ date: string, value: number }, ...]
      onSave(result);
    } catch (e) {
      console.error(e);
      alert("Помилка при обрахунку");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Форма обрахунку ДГП</h2>
      <div className={styles.rows}>
        {rows.map((row, i) => (
          <div key={i} className={styles.row}>
            <input
              type="date"
              className={styles.input}
              value={row.date}
              onChange={(e) => updateRow(i, "date", e.target.value)}
              required
            />
            <input
              type="number"
              className={styles.input}
              placeholder="Грошовий потік"
              value={row.cashFlow}
              onChange={(e) => updateRow(i, "cashFlow", e.target.value)}
              required
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={addRow}
        title="Додати рядок"
      >
        ＋
      </button>

      <button
        type="button"
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Збереження..." : "Зберегти дані"}
      </button>
    </div>
  );
}