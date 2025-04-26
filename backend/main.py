from fastapi import FastAPI, HTTPException
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
import os
import uvicorn


app = FastAPI(title="Agricultural Model API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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