import React from "react";
import "./farm-loss-form.css";

export default function FarmLossForm() {
  return (
    <div className="farm-loss-form-wrapper">
      <div className="farm-loss-form">
        <h2>Форма фіксації втрат фермерського господарства</h2>

        <div className="steps-grid">
          <div className="step">
            <p>
              <span>1.</span> Введіть дані про втрати вручну у форму.
            </p>
          </div>
          <div className="arrow-wrapper">
            <img className="arrow" src="/arrow.png" alt="arrow" />
          </div>
          <div className="step">
            <p>
              <span>2.</span> Перевірте заповнені дані на екрані.
            </p>
          </div>
          <div className="empty"></div>
        </div>

        <div className="steps-grid second-row">
          <div className="step">
            <p>
              <span>3.</span> Натисніть кнопку "Згенерувати документ"
            </p>
          </div>
          <div className="arrow-wrapper">
            <img className="arrow" src="/arrow.png" alt="arrow" />
          </div>
          <div className="step">
            <p>
              <span>4.</span> Завантажте готовий офіційний PDF.
            </p>
          </div>
          <div className="empty"></div>
        </div>

        <button className="submit-button">Заповнити форму</button>
      </div>
    </div>
  );
}
