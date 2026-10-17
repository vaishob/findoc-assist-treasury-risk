from __future__ import annotations

import logging
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool

from app.analysis import analyze_email
from app.models import AnalyzeRequest, AnalyzeResponse

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())

app = FastAPI(
    title="Treasury Risk Analysis API",
    description="Extract and ground treasury risk entities from unstructured financial email threads.",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse, tags=["analysis"])
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        return await run_in_threadpool(analyze_email, request.text)
    except ValueError as error:
        raise HTTPException(status_code=502, detail="The model returned an invalid analysis response.") from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        logging.getLogger(__name__).exception("Unexpected analysis failure")
        raise HTTPException(status_code=500, detail="Analysis could not be completed.") from error


static_dir = Path(__file__).parent / "static"
if static_dir.is_dir():
    # Mount last so the API routes take precedence over the frontend catch-all.
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")
