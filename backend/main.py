from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
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
from fastapi.responses import JSONResponse

app = FastAPI(title="Agricultural Losses API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://agriculture-losses.vercel.app",
        "https://agriculture-losses-1llp.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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
    try:
        if len(dates) < 2:
            raise ValueError("At least two dates are required for prediction")

        years = []
        
        for date in dates:
            parts = date.split('.')
            if len(parts) != 3:
                raise ValueError(f"Invalid date format: {date}. Expected DD.MM.YYYY")
                
            day, month, year = map(int, parts)
            years.append(year)
            
            current_year = pd.Timestamp.now().year
            if not (2000 <= year <= current_year + 5):
                raise ValueError(f"Year must be between 2000 and {current_year + 5}")
            
            if not (1 <= month <= 12):
                raise ValueError(f"Month must be between 1 and 12")
                
            days_in_month = pd.Timestamp(year, month, 1).days_in_month
            if not (1 <= day <= days_in_month):
                raise ValueError(f"Invalid day for month {month}: {day}. Must be between 1 and {days_in_month}")

        if len(set(years)) < 2:
            raise ValueError("Data must span at least two different years for prediction")

        df = pd.DataFrame({
            'Date': pd.to_datetime(dates, format='%d.%m.%Y'),
            'Value': values
        }).set_index('Date')
        
        df = df.asfreq('YS')
        model = ARIMA(df['Value'], order=(1, 1, 1))
        model_fit = model.fit()
        forecast_steps = 3
        forecast = model_fit.forecast(steps=forecast_steps)
        forecast.index = pd.date_range(
            start=df.index[-1] + pd.DateOffset(years=1), 
            periods=forecast_steps, 
            freq='YS'
        )
        return df.index, df['Value'], forecast.index, forecast

    except ValueError as e:
        raise ValueError(f"Date validation error: {str(e)}")
    except Exception as e:
        raise Exception(f"Prediction error: {str(e)}")

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
        
        return PredictionResponse(
            forecast_dates=[d.strftime("%d-%m-%Y") for d in pred_dates],
            forecast_values=pred_values.tolist(),
            dcf_values=dcf_values,
            total_npv=sum(dcf_values)
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Prediction failed",
                "error": str(e)
            }
        )

@app.options("/generate-pdf", include_in_schema=False)
async def options_generate_pdf():
    return JSONResponse(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

@app.options("/predict", include_in_schema=False)
async def predict_options():
    return JSONResponse(
        status_code=200,
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
            self.set_font('Arial', 'B', 16)
            self.cell(0, 10, 'Report on the Assessment of Losses of the Farming Enterprise', ln=True, align='C')
            self.ln(10)

    try:
        pdf = PDF()
        pdf.add_page()

        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, "Information about the Enterprise:", ln=True)
        pdf.cell(0, 10, "Name: _______________________", ln=True)
        pdf.cell(0, 10, "Address: _______________________", ln=True)
        pdf.cell(0, 10, "Entrepreneur / Legal Entity: _______________________", ln=True)
        pdf.ln(10)

        def add_table(title, headers, rows):
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, title, ln=True)
            pdf.ln(5)
            pdf.set_font('Arial', '', 10)
            col_width = pdf.w / len(headers) - 10
            for header in headers:
                pdf.cell(col_width, 8, header, border=1, align='C')
            pdf.ln()
            for row in rows:
                for item in row:
                    pdf.cell(col_width, 8, str(item), border=1, align='C')
                pdf.ln()
            pdf.ln(10)

        # I. Equipment
        add_table(
            "I. Equipment",
            ["Name", "Quantity", "Price per unit (UAH)"],
            [[tech.name, tech.quantity, tech.price] for tech in data.technique]
        )

        # II. Animals
        add_table(
            "II. Animals",
            ["Name", "Quantity", "Price per head (UAH)"],
            [[animal.name, animal.quantity, animal.price_per_unit] for animal in data.animals]
        )

        # III. Territories
        add_table(
            "III. Territories",
            ["Name", "Area (m²)", "Repair cost per m² (UAH)"],
            [[territory.name, territory.area_m2, territory.repair_price_per_m2] for territory in data.territories]
        )

        # IV. Buildings and Warehouses
        add_table(
            "IV. Buildings and Warehouses",
            ["Name", "Area (m²)", "Repair cost (UAH)"],
            [[building.name, building.area_m2, building.price] for building in data.buildings]
        )

        # Forecast Data
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, "Forecast Data", ln=True)
        pdf.ln(5)
        pdf.set_font('Arial', '', 10)
        col_width = pdf.w / 3 - 10
        headers = ["Date", "Projected Value (UAH)", "DCF Value (UAH)"]
        for header in headers:
            pdf.cell(col_width, 8, header, border=1, align='C')
        pdf.ln()
        for date, proj_val, dcf_val in zip(data.prediction.forecast_dates, data.prediction.forecast_values, data.prediction.dcf_values):
            pdf.cell(col_width, 8, date, border=1, align='C')
            pdf.cell(col_width, 8, f"{round(proj_val, 2)}", border=1, align='C')
            pdf.cell(col_width, 8, f"{round(dcf_val, 2)}", border=1, align='C')
            pdf.ln()

        pdf.ln(20)
        pdf.cell(0, 10, "Signatures:", ln=True)
        pdf.cell(0, 10, "Prepared by: _______________________", ln=True)
        pdf.cell(0, 10, "Verified by: _______________________", ln=True)
        pdf.cell(0, 10, "Date of report preparation: _______________________", ln=True)

        pdf_bytes = pdf.output(dest='S').encode('latin1')
        encoded = base64.b64encode(pdf_bytes).decode()

        return {"pdf_base64": encoded}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
