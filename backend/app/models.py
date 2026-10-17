from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=40_000, description="Unstructured financial email thread")

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        if not value:
            raise ValueError("Email text must not be blank")
        return value


class ExtractedRisk(BaseModel):
    """Schema used to constrain Gemini's extraction response."""

    counterparty: str | None = Field(description="Named financial institution or counterparty, if stated")
    exposure_amount: float | None = Field(ge=0, description="Numeric amount of the exposed trade or payment, without currency symbols")
    currency: str | None = Field(description="Three-letter ISO 4217 currency code when stated")
    settlement_date: str | None = Field(description="Settlement or value date in YYYY-MM-DD format when explicitly stated")
    risk_level: RiskLevel = Field(description="Risk level supported by the communication; UNKNOWN if evidence is insufficient")
    summary: str = Field(description="Short operational summary grounded in the email thread")
    evidence: list[str] = Field(description="Short verbatim excerpts supporting the extracted fields")

    @field_validator("settlement_date")
    @classmethod
    def validate_iso_date(cls, value: str | None) -> str | None:
        if value is None:
            return None
        from datetime import date

        try:
            date.fromisoformat(value)
        except ValueError as error:
            raise ValueError("settlement_date must use YYYY-MM-DD format") from error
        return value

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().upper()
        if len(normalized) != 3 or not normalized.isalpha():
            raise ValueError("currency must be a three-letter code")
        return normalized


class AnalyzeResponse(BaseModel):
    counterparty: str | None
    exposure_amount: float | None
    currency: str | None
    settlement_date: str | None
    risk_level: RiskLevel
    confidence_score: float | None = Field(ge=0, le=1)
    grounding_passed: bool
    summary: str
    evidence: list[str]
