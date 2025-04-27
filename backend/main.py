from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
import io
import base64
from fpdf import FPDF
import os
import uvicorn


app = FastAPI(title="Agricultural Model API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TimeSeriesData(BaseModel):
    dates: List[str]
    values: List[float]
    discount_rate: float = 0.1

class PredictionResponse(BaseModel):
    forecast_dates: List[str]
    forecast_values: List[float]
    dcf_values: List[float]
    total_npv: float
    chart: str

class TechniqueItem(BaseModel):
    name: str
    quantity: int
    price: float

class AnimalItem(BaseModel):
    name: str
    quantity: int
    price_per_unit: float

class TerritoryItem(BaseModel):
    name: str
    area_m2: float
    repair_price_per_m2: float

class BuildingItem(BaseModel):
    name: str
    area_m2: float
    price: float

class PredictionData(BaseModel):
    forecast_dates: List[str]
    forecast_values: List[float]
    dcf_values: List[float]
    total_npv: float
    chart: str  # base64 PNG chart

class GeneratePdfRequest(BaseModel):
    technique: List[TechniqueItem]
    animals: List[AnimalItem]
    territories: List[TerritoryItem]
    buildings: List[BuildingItem]
    prediction: PredictionData

@app.post("/generate-pdf")
@app.post("/generate-pdf")
def generate_pdf(data: GeneratePdfRequest):
    class PDF(FPDF):
        def header(self):
            if self.page_no() == 1:
                return
            self.set_font('DejaVu', '', 8)
            self.cell(0, 10, f'Сторінка {self.page_no()}', align='C')

    try:
        pdf = PDF()
        pdf.add_page()

        pdf.add_font('DejaVu', '', './fonts/DejaVuSans.ttf', uni=True)
        pdf.set_font('DejaVu', '', 18)

        # Титулка
        pdf.cell(0, 10, "АКТ", ln=True, align="C")
        pdf.cell(0, 10, "Фіксації збитків аграрного господарства", ln=True, align="C")
        pdf.cell(0, 10, "Внаслідок збройної агресії російської федерації проти України", ln=True, align="C")
        pdf.ln(20)

        pdf.set_font('DejaVu', '', 12)
        pdf.cell(0, 10, "ПІБ заявника: ____________________________", ln=True)
        pdf.cell(0, 10, "Дата складання: __________________________", ln=True)
        pdf.cell(0, 10, "Місце складання: _________________________", ln=True)
        pdf.ln(10)
        pdf.multi_cell(0, 8, "Документ складено для фіксації матеріальних збитків, завданих агресією російської федерації проти України.")
        pdf.ln(10)
        pdf.cell(0, 10, "Слава Україні!", ln=True, align="C")
        pdf.ln(20)

        # Таблиці
        def add_table(title, items, headers, row_func):
            if not items:
                return 0
            pdf.add_page()
            pdf.set_font('DejaVu', '', 14)
            pdf.cell(0, 10, title, ln=True)
            pdf.ln(5)
            pdf.set_font('DejaVu', '', 10)
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
            pdf.set_font('DejaVu', '', 12)
            pdf.cell(0, 10, f"Проміжна сума: {round(total, 2)} грн", ln=True)
            return total

        grand_total = 0
        grand_total += add_table(
            "I. Техніка", data.technique,
            ["Назва", "К-сть", "Ціна за шт.", "Заг. сума"],
            lambda item: [item.name, item.quantity, item.price, round(item.quantity * item.price, 2)]
        )
        grand_total += add_table(
            "II. Тварини", data.animals,
            ["Назва", "К-сть", "Ціна за голову", "Заг. сума"],
            lambda item: [item.name, item.quantity, item.price_per_unit, round(item.quantity * item.price_per_unit, 2)]
        )
        grand_total += add_table(
            "III. Території", data.territories,
            ["Назва", "Площа (м²)", "Ціна за м²", "Заг. сума"],
            lambda item: [item.name, item.area_m2, item.repair_price_per_m2, round(item.area_m2 * item.repair_price_per_m2, 2)]
        )
        grand_total += add_table(
            "IV. Будівлі і Сховища", data.buildings,
            ["Назва", "Площа/Об'єм", "Вартість"],
            lambda item: [item.name, item.area_m2, item.price]
        )

        # Прогнозовані дані
        pdf.add_page()
        pdf.set_font('DejaVu', '', 16)
        pdf.cell(0, 10, "Прогнозовані дані", ln=True, align="C")
        pdf.ln(10)
        pdf.set_font('DejaVu', '', 10)
        for date, value, dcf in zip(data.prediction.forecast_dates, data.prediction.forecast_values, data.prediction.dcf_values):
            pdf.cell(0, 8, f"{date}: прогнозована вартість = {round(value,2)} грн, дисконтована вартість = {round(dcf,2)} грн", ln=True)
        pdf.ln(10)
        pdf.set_font('DejaVu', '', 12)
        pdf.cell(0, 10, f"Загальна дисконтована вартість (NPV): {round(data.prediction.total_npv, 2)} грн", ln=True)

        # Підпис
        pdf.add_page()
        pdf.set_font('DejaVu', '', 18)
        pdf.cell(0, 10, f"СУМАРНІ ЗБИТКИ: {round(grand_total, 2)} грн", ln=True, align="C")
        pdf.ln(20)
        pdf.set_font('DejaVu', '', 14)
        pdf.cell(0, 10, "Підпис заявника: ______________________", ln=True)

        pdf_bytes = pdf.output(dest='S').encode('latin1')
        encoded = base64.b64encode(pdf_bytes).decode()

        return {"pdf_base64": encoded}

    except Exception as e:
        print(f"Помилка генерації PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))



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
    plt.ylabel('Value')
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    plt.close()
    return base64.b64encode(buffer.getvalue()).decode()


@app.api_route("/", methods=["GET", "HEAD"])
async def read_root(request: Request):
    return {"message": "Hello, world!"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def health(request: Request):
    return {"status": "ok"}

@app.post("/predict")
async def predict(data: TimeSeriesData):
    try:
        raw_dates, raw_values, pred_dates, pred_values = predict_timeseries(data.dates, data.values)
        dcf_values = calculate_dcf(pred_dates, pred_values, data.discount_rate)
        chart = generate_chart(raw_dates, raw_values, pred_dates, pred_values)
        
        return PredictionResponse(
            forecast_dates=[d.strftime("%Y-%m-%d") for d in pred_dates],
            forecast_values=pred_values.tolist(),
            dcf_values=dcf_values,
            total_npv=sum(dcf_values),
            chart=chart
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)