from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "alpha_vantage": "configured" if os.getenv("ALPHA_VANTAGE_KEY") else "missing",
        "anthropic": "configured" if os.getenv("ANTHROPIC_API_KEY") else "missing",
    }
