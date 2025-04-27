from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import io
import base64
from fpdf import FPDF
import os

app = Flask(__name__)
CORS(app)

# Data models are simple dicts in Flask

# ------------------------
# Utility functions
# ------------------------

def predict_timeseries(dates, values):
    df = pd.DataFrame({
        'Date': pd.to_datetime(dates),
        'Value': values
    }).set_index('Date')
    
    df = df.asfreq('YS')
    
    train_end = pd.Timestamp('2021-01-01')
    train_data = df.loc[:train_end, 'Value']
    
    model = ARIMA(train_data, order=(1,1,1))
    model_fit = model.fit()
    
    forecast_steps = 3
    forecast = model_fit.forecast(steps=forecast_steps)
    forecast.index = pd.date_range(start=train_end + pd.DateOffset(years=1), periods=forecast_steps, freq='YS')
    
    return df.index, df['Value'], forecast.index, forecast

def calculate_dcf(dates, values, discount_rate):
    base_year = 2021
    dcf_values = []
    
    for date, value in zip(dates, values):
        year = date.year
        t = year - base_year
        dcf = value / (1 + discount_rate) ** t
        dcf_values.append(dcf)
    
    return dcf_values

def generate_chart(raw_dates, raw_values, pred_dates, pred_values):
    plt.figure(figsize=(12,6))
    plt.plot(raw_dates, raw_values, label='Historical Data', color='blue')
    plt.plot(pred_dates, pred_values, label='Forecast', color='red')
    
    plt.grid(True, which='both', linestyle='--', linewidth=0.5, alpha=0.7)
    plt.gca().set_axisbelow(True)
    
    plt.legend()
    plt.title('Trade Value Forecast')
    plt.xlabel('Year')
    plt.ylabel('Trade Value')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    plt.close()
    
    return base64.b64encode(buffer.getvalue()).decode()

# ------------------------
# API endpoints
# ------------------------

@app.route("/", methods=["GET", "HEAD"])
def root():
    return jsonify({"message": "Hello, world!"})

@app.route("/health", methods=["GET", "HEAD"])
def health():
    return jsonify({"status": "ok"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        dates = data["dates"]
        values = data["values"]
        discount_rate = data.get("discount_rate", 0.1)

        raw_dates, raw_values, pred_dates, pred_values = predict_timeseries(dates, values)
        dcf_values = calculate_dcf(pred_dates, pred_values, discount_rate)
        chart = generate_chart(raw_dates, raw_values, pred_dates, pred_values)
        
        response = {
            "forecast_dates": [d.strftime("%Y-%m-%d") for d in pred_dates],
            "forecast_values": pred_values.tolist(),
            "dcf_values": dcf_values,
            "total_npv": sum(dcf_values),
            "chart": chart
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@app.route("/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.get_json()

        class PDF(FPDF):
            def header(self):
                if self.page_no() == 1:
                    return
                self.set_font('Arial', '', 8)
                self.cell(0, 10, f'Сторінка {self.page_no()}', align='C')

        pdf = PDF()
        pdf.add_page()
        
        pdf.set_font('Arial', '', 18)

        # Title Page
        pdf.cell(0, 10, "АКТ", ln=True, align="C")
        pdf.cell(0, 10, "Фіксації збитків аграрного господарства", ln=True, align="C")
        pdf.cell(0, 10, "Внаслідок збройної агресії російської федерації проти України", ln=True, align="C")
        pdf.ln(20)

        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, "ПІБ заявника: ____________________________", ln=True)
        pdf.cell(0, 10, "Дата складання: __________________________", ln=True)
        pdf.cell(0, 10, "Місце складання: _________________________", ln=True)
        pdf.ln(10)
        pdf.multi_cell(0, 8, "Документ складено для фіксації матеріальних збитків, завданих агресією російської федерації проти України.")
        pdf.ln(10)
        pdf.cell(0, 10, "Слава Україні!", ln=True, align="C")
        pdf.ln(20)

        # Tables
        def add_table(title, items, headers, row_func):
            if not items:
                return 0
            pdf.add_page()
            pdf.set_font('Arial', '', 14)
            pdf.cell(0, 10, title, ln=True)
            pdf.ln(5)
            pdf.set_font('Arial', '', 10)
            col_width = pdf.w / len(headers) - 10
            for header in headers:
                pdf.cell(col_width, 8, header, border=1, align='C')
            pdf.ln()
            total = 0
            for item in items:
                row = row_func(item)
                for value in row:
                    pdf.cell(col_width, 8, str(value), border=1, align='C')
                pdf.ln()
                total += row[-1]
            pdf.ln(5)
            pdf.set_font('Arial', '', 12)
            pdf.cell(0, 10, f"Проміжна сума: {round(total, 2)} грн", ln=True)
            return total

        grand_total = 0
        grand_total += add_table(
            "I. Техніка", data.get("technique", []),
            ["Назва", "К-сть", "Ціна за шт.", "Заг. сума"],
            lambda item: [item["name"], item["quantity"], item["price"], round(item["quantity"] * item["price"], 2)]
        )
        grand_total += add_table(
            "II. Тварини", data.get("animals", []),
            ["Назва", "К-сть", "Ціна за голову", "Заг. сума"],
            lambda item: [item["name"], item["quantity"], item["price_per_unit"], round(item["quantity"] * item["price_per_unit"], 2)]
        )
        grand_total += add_table(
            "III. Території", data.get("territories", []),
            ["Назва", "Площа (м²)", "Ціна за м²", "Заг. сума"],
            lambda item: [item["name"], item["area_m2"], item["repair_price_per_m2"], round(item["area_m2"] * item["repair_price_per_m2"], 2)]
        )
        grand_total += add_table(
            "IV. Будівлі і Сховища", data.get("buildings", []),
            ["Назва", "Площа/Об'єм", "Вартість"],
            lambda item: [item["name"], item["area_m2"], item["price"]]
        )

        # Forecasted Data
        prediction = data.get("prediction", {})
        pdf.add_page()
        pdf.set_font('Arial', '', 16)
        pdf.cell(0, 10, "Прогнозовані дані", ln=True, align="C")
        pdf.ln(10)
        pdf.set_font('Arial', '', 10)
        for date, value, dcf in zip(
            prediction.get("forecast_dates", []),
            prediction.get("forecast_values", []),
            prediction.get("dcf_values", [])
        ):
            pdf.cell(0, 8, f"{date}: прогнозована вартість = {round(value,2)} грн, дисконтована вартість = {round(dcf,2)} грн", ln=True)
        pdf.ln(10)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Загальна дисконтована вартість (NPV): {round(prediction.get('total_npv', 0), 2)} грн", ln=True)

        # Final Signature
        pdf.add_page()
        pdf.set_font('Arial', '', 18)
        pdf.cell(0, 10, f"СУМАРНІ ЗБИТКИ: {round(grand_total, 2)} грн", ln=True, align="C")
        pdf.ln(20)
        pdf.set_font('Arial', '', 14)
        pdf.cell(0, 10, "Підпис заявника: ______________________", ln=True)

        pdf_bytes = pdf.output(dest='S').encode('latin1')
        encoded = base64.b64encode(pdf_bytes).decode()

        return jsonify({"pdf_base64": encoded})

    except Exception as e:
        print(f"Помилка генерації PDF: {e}")
        return jsonify({"detail": str(e)}), 500

# ------------------------
# Run app
# ------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
