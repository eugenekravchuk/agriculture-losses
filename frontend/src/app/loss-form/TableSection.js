'use client';

import React, { useState } from "react";

export default function TableSection({ title, columns }) {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState(columns.map(() => ""));
  const [errors, setErrors] = useState("");
  
  const handleInputChange = (index, value) => {
    const updatedRow = [...newRow];
    updatedRow[index] = value;
    setNewRow(updatedRow);
  };

  const validateNewRow = () => {
    let hasError = false;

    newRow.forEach((cell, colIdx) => {
      const isNumericColumn = columns[colIdx].toLowerCase().includes('кількість') ||
                               columns[colIdx].toLowerCase().includes('площа') ||
                               columns[colIdx].toLowerCase().includes('ціна') ||
                               columns[colIdx].toLowerCase().includes('вартість');

      if (isNumericColumn && cell && isNaN(cell)) {
        hasError = true;
      }
    });

    return hasError ? "Помилка: введено неправильний формат числа." : "";
  };

  const handleAddRow = () => {
    const validationError = validateNewRow();
    if (validationError) {
      setErrors(validationError);
    } else {
      setRows([...rows, newRow]);
      setNewRow(columns.map(() => ""));
      setErrors("");
    }
  };

  return (
    <div className="table-section">
      <h2>{title}</h2>
      <div className="table-wrapper">
        <div className={`table-scrollable ${rows.length > 5 ? 'scroll' : ''}`}>
          <table>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input type="text" value={cell} disabled readOnly />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                {newRow.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleInputChange(colIndex, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {errors && <div className="error-message">{errors}</div>}

        <div className="add-row-wrapper">
          <button className="add-row-button" onClick={handleAddRow}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
