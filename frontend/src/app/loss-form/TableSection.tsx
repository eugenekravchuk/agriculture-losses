'use client';

import React, { useState } from "react";

interface TableSectionProps {
  title: string;
  columns: string[];
}

export default function TableSection({ title, columns }: TableSectionProps) {
  const [rows, setRows] = useState<string[][]>([]);
  const [newRow, setNewRow] = useState<string[]>(columns.map(() => ""));
  const [errors, setErrors] = useState("");

  const handleInputChange = (index: number, value: string) => {
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

      if (isNumericColumn && cell && isNaN(Number(cell))) {
        hasError = true;
      }
    });

    return hasError ? "Помилка: введено неправильний формат числа." : "";
  };

  const handleAddRow = () => {
    const validationError = validateNewRow();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    // Зберігаємо рядок тільки якщо хоч одне поле заповнене
    if (newRow.some(cell => cell.trim() !== "")) {
      setRows([...rows, newRow]);
    }

    setNewRow(columns.map(() => ""));
    setErrors("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>

      <div className="bg-gray-50 rounded-xl shadow-sm p-4">
        <div className={`overflow-x-auto ${rows.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
          <table className="w-full text-left table-auto">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2 text-gray-600 font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      <input
                        type="text"
                        value={cell}
                        disabled
                        className="w-full bg-transparent text-gray-800"
                        readOnly
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t">
                {newRow.map((cell, colIndex) => (
                  <td key={colIndex} className="px-4 py-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleInputChange(colIndex, e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {errors && <div className="text-red-500 text-sm">{errors}</div>}

      <div className="flex justify-center">
        <button
          onClick={handleAddRow}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition transform hover:scale-105"
        >
          +
        </button>
      </div>
    </div>
  );
}
