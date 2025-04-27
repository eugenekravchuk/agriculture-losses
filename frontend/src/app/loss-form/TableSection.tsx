'use client';

import React, { useState } from "react";
import Papa from "papaparse";

interface TableSectionProps {
  title: string;
  columns: string[];
  items: any[];
  setItems: (items: any[]) => void;
}

export default function TableSection({ title, columns, items, setItems }: TableSectionProps) {
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

    if (newRow.some(cell => cell.trim() !== "")) {
      const formattedRow = newRow.map((cell, idx) => {
        const isNumericColumn = columns[idx].toLowerCase().includes('кількість') ||
                                columns[idx].toLowerCase().includes('площа') ||
                                columns[idx].toLowerCase().includes('ціна') ||
                                columns[idx].toLowerCase().includes('вартість');
        return isNumericColumn ? Number(cell) : cell;
      });

      setItems([...items, formattedRow]);
    }

    setNewRow(columns.map(() => ""));
    setErrors("");
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data as any[];
        const mappedData = parsedData.map(item => Object.values(item));
        setItems(mappedData);
      },
      error: (error) => {
        console.error('Помилка при парсингу CSV:', error);
        setErrors('Не вдалося завантажити CSV');
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>

      <div className="flex items-center gap-4 mb-4">
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
        <span className="text-gray-500 text-sm">або додайте вручну нижче</span>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-sm p-4">
        <div className={`overflow-x-auto ${items.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
          <table className="w-full text-left table-auto">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2 text-gray-600 font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {row.map((cell: any, colIndex: number) => (
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
          Додати рядок
        </button>
      </div>
    </div>
  );
}
