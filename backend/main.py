from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io, base64
import numpy as np
import matplotlib.pyplot as plt

app = FastAPI(title="Agricultural Model API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    param1: float
    param2: float

def compute_model(p1: float, p2: float):
    """
    TODO: swap this toy example for your real computation.
    Returns x,y arrays.
    """
    x = np.linspace(0, p1, 200)
    y = np.sin(x * p2)
    return x, y

@app.post("/calculate")
def calculate(data: InputData):
    x, y = compute_model(data.param1, data.param2)
    return {
        "x_values": x.tolist(),
        "y_values": y.tolist(),
        "max_y": float(np.max(y)),
        "mean_y": float(np.mean(y)),
    }

@app.post("/graph")
def graph(data: InputData):
    x, y = compute_model(data.param1, data.param2)

    plt.figure()
    plt.plot(x, y)
    plt.title("Model Output")
    plt.xlabel("x")
    plt.ylabel("y")

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close()
    buf.seek(0)

    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return {"image_base64": img_b64}