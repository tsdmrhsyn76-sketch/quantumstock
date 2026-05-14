from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analysis, health
import os

app = FastAPI(
    title="QuantumStock API",
    description="AI-Powered Stock Risk & Probability Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])

@app.get("/")
def root():
    return {"status": "QuantumStock API is running", "version": "1.0.0"}
