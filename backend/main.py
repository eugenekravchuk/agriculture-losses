from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import io
import base64
from fpdf import FPDF
import os
import uvicorn

class CustomHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

app = FastAPI(title="Agricultural Losses API")

# Update CORS middleware with all possible origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

app.add_middleware(CustomHeaderMiddleware)

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

class GeneratePdfRequest(BaseModel):
    technique: List[TechniqueItem]
    animals: List[AnimalItem]
    territories: List[TerritoryItem]
    buildings: List[BuildingItem]
    prediction: PredictionData

def predict_timeseries(dates, values):
    df = pd.DataFrame({'Date': pd.to_datetime(dates), 'Value': values}).set_index('Date')
    df = df.asfreq('YS')
    model = ARIMA(df['Value'], order=(1, 1, 1))
    model_fit = model.fit()
    forecast_steps = 3
    forecast = model_fit.forecast(steps=forecast_steps)
    forecast.index = pd.date_range(start=df.index[-1] + pd.DateOffset(years=1), periods=forecast_steps, freq='YS')
    return df.index, df['Value'], forecast.index, forecast

def calculate_dcf(dates, values, discount_rate):
    base_year = 2021
    dcf_values = []
    for date, value in zip(dates, values):
        year = date.year
        t = year - base_year
        dcf_values.append(value / (1 + discount_rate) ** t)
    return dcf_values

@app.get("/")
async def root():
    return {"message": "Welcome to Agricultural Losses API"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(data: TimeSeriesData):
    try:
        raw_dates, raw_values, pred_dates, pred_values = predict_timeseries(data.dates, data.values)
        dcf_values = calculate_dcf(pred_dates, pred_values, data.discount_rate)
        
        response = PredictionResponse(
            forecast_dates=[d.strftime("%Y-%m-%d") for d in pred_dates],
            forecast_values=pred_values.tolist(),
            dcf_values=dcf_values,
            total_npv=sum(dcf_values),
        )
        
        return JSONResponse(
            content=response.dict(),
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Add OPTIONS endpoint for CORS preflight requests
@app.options("/predict")
async def predict_options():
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

@app.post("/generate-pdf")
async def generate_pdf(data: GeneratePdfRequest):
    class PDF(FPDF):
        def header(self):
            if self.page_no() == 1:
                return
            self.set_font('Arial', '', 8)
            self.cell(0, 10, f'Page {self.page_no()}', align='C')

    try:
        pdf = PDF()
        pdf.add_page()

        pdf.set_font('Arial', '', 18)
        pdf.cell(0, 10, "ACT", ln=True, align="C")
        pdf.cell(0, 10, "Damage Fixation for Agricultural Enterprise", ln=True, align="C")
        pdf.cell(0, 10, "Due to Armed Aggression Against Ukraine", ln=True, align="C")
        pdf.ln(20)

        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, "Applicant's Full Name: ____________________", ln=True)
        pdf.cell(0, 10, "Date of Document: ________________________", ln=True)
        pdf.cell(0, 10, "Location: _________________________________", ln=True)
        pdf.ln(10)
        pdf.multi_cell(0, 8, "This document records material damage caused by military aggression.")
        pdf.ln(20)

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
            pdf.cell(0, 10, f"Subtotal: {round(total, 2)} UAH", ln=True)
            return total

        grand_total = 0
        grand_total += add_table("I. Equipment", data.technique, ["Name", "Qty", "Price per unit", "Total"],
                                 lambda item: [item.name, item.quantity, item.price, round(item.quantity * item.price, 2)])
        grand_total += add_table("II. Animals", data.animals, ["Name", "Qty", "Price per head", "Total"],
                                 lambda item: [item.name, item.quantity, item.price_per_unit, round(item.quantity * item.price_per_unit, 2)])
        grand_total += add_table("III. Territories", data.territories, ["Name", "Area (m²)", "Repair price/m²", "Total"],
                                 lambda item: [item.name, item.area_m2, item.repair_price_per_m2, round(item.area_m2 * item.repair_price_per_m2, 2)])
        grand_total += add_table("IV. Buildings and Storages", data.buildings, ["Name", "Area (m²)", "Price"],
                                 lambda item: [item.name, item.area_m2, item.price])

        pdf.add_page()
        pdf.set_font('Arial', '', 16)
        pdf.cell(0, 10, "Forecast Data", ln=True, align="C")
        pdf.ln(10)
        pdf.set_font('Arial', '', 10)
        for date, value, dcf in zip(data.prediction.forecast_dates, data.prediction.forecast_values, data.prediction.dcf_values):
            pdf.cell(0, 8, f"{date}: Forecast = {round(value, 2)} UAH, DCF = {round(dcf, 2)} UAH", ln=True)
        pdf.ln(10)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Total NPV: {round(data.prediction.total_npv, 2)} UAH", ln=True)

        pdf.add_page()
        pdf.set_font('Arial', '', 18)
        pdf.cell(0, 10, f"TOTAL DAMAGES: {round(grand_total, 2)} UAH", ln=True, align="C")
        pdf.ln(20)
        pdf.set_font('Arial', '', 14)
        pdf.cell(0, 10, "Applicant's Signature: ____________________", ln=True)

        pdf_bytes = pdf.output(dest='S').encode('latin1')
        encoded = base64.b64encode(pdf_bytes).decode()

        return {"pdf_base64": encoded}

    except Exception as e:
        print(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
