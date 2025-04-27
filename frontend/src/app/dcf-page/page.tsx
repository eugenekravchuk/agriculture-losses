"use client";
import { useEffect, useState } from "react";
import styles from "./dcf-page.module.css";

interface DcfPageProps {
  data?: {
    dates: string[];
    forecast_dates: string[];
    values: number[];
    forecast_values: number[];
  };
  onFormOpen: () => void;
}

export default function DcfPage({ data, onFormOpen }: DcfPageProps) {
  return (
    <div className={styles.container}>
      <section className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          Форма обрахунку приведеного/дисконтованого грошового потоку
        </h1>
      </section>

      <section className={styles.subtitleSection}>
        <h2 className={styles.subtitle}>
          прийом, що використовується для підрахунку поточної (приведеної)
          вартості очікуваних у майбутньому надходжень і витрат
        </h2>
      </section>

      <section className={styles.formSection}>
        <div className={styles.instructionCard}>
          <ol className={styles.list}>
            <li>Натисніть кнопку "Заповнити форму"</li>
            <li>Заповніть форму або завантажте файл із даними</li>
            <li>Отримайте графік із розрахованими даними та фактичними втратами</li>
          </ol>
          <button
            className={styles.primaryButton}
            onClick={onFormOpen}
          >
            Заповнити форму
          </button>
        </div>
      </section>
    </div>
  );
}