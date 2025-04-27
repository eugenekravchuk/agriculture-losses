"use client";

import React, { useState } from "react";

interface TableSectionProps<T> {
  title: string;
  columns: string[];
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export default function TableSection<T extends object>({
  title,
  columns,
  items,
  setItems,
}: TableSectionProps<T>) {
  const [newRow, setNewRow] = useState<string[]>(columns.map(() => ""));
  const [errors, setErrors] = useState("");

  const handleInputChange = (index: number, value: string) => {
    const updatedRow = [...newRow];
    updatedRow[index] = value;
    setNewRow(updatedRow);
  };

  const validateNewRow = () => {
    for (let i = 0; i < columns.length; i++) {
      const value = newRow[i].trim();
      const colName = columns[i].toLowerCase();

      if (!value) {
        return "Всі поля повинні бути заповнені.";
      }

      const isNumericColumn =
        colName.includes("кількість") ||
        colName.includes("площа") ||
        colName.includes("ціна") ||
        colName.includes("вартість");

      if (isNumericColumn && isNaN(Number(value))) {
        return `Поле "${columns[i]}" повинно бути числом.`;
      }
    }
    return "";
  };

  const handleAddRow = () => {
    const validationError = validateNewRow();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    const mappedRow: any = {};

    columns.forEach((col, idx) => {
      const colName = col.toLowerCase();
      const value = newRow[idx].trim();

      // intelligently parse numbers if column looks numeric
      const isNumericColumn =
        colName.includes("кількість") ||
        colName.includes("площа") ||
        colName.includes("ціна") ||
        colName.includes("вартість");

      mappedRow[getMappedField(colName)] = isNumericColumn
        ? Number(value)
        : value;
    });

    setItems((prev) => [...prev, mappedRow]);
    setNewRow(columns.map(() => ""));
    setErrors("");
  };

  const getMappedField = (colName: string) => {
    if (colName.includes("кількість")) return "quantity";
    if (colName.includes("площа")) return "area_m2";
    if (colName.includes("вартість") || colName.includes("вартість об'єкта"))
      return "price";
    if (colName.includes("ціна за голову")) return "price_per_unit";
    if (colName.includes("ціна за відновлення")) return "repair_price_per_m2";
    return "name";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>

      <div className="bg-gray-50 rounded-xl shadow-sm p-4">
        <div
          className={`overflow-x-auto ${
            items.length > 5 ? "max-h-80 overflow-y-auto" : ""
          }`}
        >
          <table className="w-full text-left table-auto">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-gray-600 font-semibold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      <input
                        type="text"
                        value={
                          (row as any)[getMappedField(col.toLowerCase())] ?? ""
                        }
                        disabled
                        className="w-full bg-transparent text-gray-800"
                        readOnly
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {/* New Row */}
              <tr className="border-t">
                {newRow.map((cell, colIndex) => (
                  <td key={colIndex} className="px-4 py-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        handleInputChange(colIndex, e.target.value)
                      }
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
