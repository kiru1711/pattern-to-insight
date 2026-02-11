from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import pandas as pd
from services.validator import validate_dataset
from services.patterns import (
    comparison_pattern,
    trend_pattern,
    correlation_pattern,
    distribution_pattern,
    anomaly_pattern,
    threshold_pattern
)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "backend running"}

@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are supported"}

    df = pd.read_csv(file.file)

    is_valid, result = validate_dataset(df)

    if not is_valid:
        return {"valid": False, "message": result}

    numeric_col = result["numeric_columns"][0]
    categorical_col = result["categorical_columns"][0]

    patterns = {
    "comparison": comparison_pattern(df, categorical_col, numeric_col),
    "trend": trend_pattern(df, numeric_col),
    "correlation": correlation_pattern(df, numeric_col),
    "distribution": distribution_pattern(df, numeric_col),
    "anomaly": anomaly_pattern(df, numeric_col),
    "threshold": threshold_pattern(df, numeric_col)
}

    return {
    "valid": True,
    "message": "Dataset processed successfully",
    "patterns": patterns
}


@app.get("/test")
def test_route():
    return {"test": "route works"}
