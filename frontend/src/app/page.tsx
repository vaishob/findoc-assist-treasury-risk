"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ContentPasteGoRoundedIcon from "@mui/icons-material/ContentPasteGoRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";

type AnalysisResult = {
  counterparty: string | null;
  exposure_amount: number | null;
  currency: string | null;
  settlement_date: string | null;
  risk_level: RiskLevel;
  confidence_score: number | null;
  grounding_passed: boolean;
  summary: string;
  evidence: string[];
};

const SAMPLE_EMAIL = `From: Treasury Operations <treasury.ops@northstar.example>
To: Settlements, Credit Risk
Subject: URGENT: MT103 rejected / collateral call mismatch — Ref NS-88419

Hi team,

Following up on yesterday's EUR/USD swap with Meridian Continental Bank. Our USD 18,750,000 payment (UETR 2b8f1e73-88419) was released via SWIFT MT103 at 16:42 London time, but the beneficiary bank has no matching credit. Meridian's cash desk says the payment was held after their correspondent returned code AC04; their operations team now says a repaired instruction may miss today's cut-off.

Separately, Meridian disputes the USD 3,200,000 variation margin call issued under CSA 47. They have asked us to treat the call as USD 2,450,000 pending a portfolio revaluation. Credit Risk has not approved the reduction. If settlement is not confirmed, the trade remains open overnight and the exposure could increase.

Please confirm the USD leg by 10:30 UTC on 22 October 2026. Do not net the disputed margin amount until Credit Risk signs off. Escalating to the relationship team now.

Regards,
Maya Chen
Treasury Operations

--- Forwarded message ---
From: Settlements Control <settlements@northstar.example>
We have not received an authenticated SWIFT confirmation. Meridian's revised value date is not agreed; our original settlement instruction remains 21 October 2026.`;

const riskStyles: Record<RiskLevel, { color: "success" | "warning" | "error" | "default"; label: string }> = {
  LOW: { color: "success", label: "Low" },
  MEDIUM: { color: "warning", label: "Medium" },
  HIGH: { color: "error", label: "High" },
  CRITICAL: { color: "error", label: "Critical" },
  UNKNOWN: { color: "default", label: "Unknown" },
};

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null || !Number.isFinite(amount)) return "Not identified";
  const code = currency || "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Not identified";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function Brand() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 1.25 }}>
      <Box sx={{ width: 35, height: 35, borderRadius: 2.25, bgcolor: "#3155d9", display: "grid", placeItems: "center", color: "white" }}>
        <ShowChartRoundedIcon sx={{ fontSize: 21 }} />
      </Box>
      <Box>
        <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.02em" }}>treasury<span style={{ color: "#8fa7ff" }}>signal</span></Typography>
        <Typography sx={{ color: "#8492ac", fontSize: 9, letterSpacing: ".12em", fontWeight: 700, mt: .5 }}>RISK INTELLIGENCE</Typography>
      </Box>
    </Stack>
  );
}

function NavItem({ icon, label, active = false, badge }: { icon: ReactNode; label: string; active?: boolean; badge?: string }) {
  return <Box className={`nav-item${active ? " active" : ""}`}>{icon}<span style={{ flex: 1 }}>{label}</span>{badge && <Chip label={badge} size="small" sx={{ height: 19, fontSize: 10, bgcolor: "#3b2e3f", color: "#f7a1a6", fontWeight: 800 }} />}</Box>;
}

function Metric({ label, value, icon, accent, helper }: { label: string; value: string; icon: ReactNode; accent: string; helper: string }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: "19px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 650 }}>{label}</Typography>
          <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: `${accent}12`, color: accent, display: "grid", placeItems: "center" }}>{icon}</Box>
        </Stack>
        <Typography className="mono" sx={{ mt: 1.3, fontWeight: 800, fontSize: 23, letterSpacing: "-.04em", color: "text.primary", lineHeight: 1.1 }}>{value}</Typography>
        <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 11 }}>{helper}</Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [emailText, setEmailText] = useState(SAMPLE_EMAIL);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const confidence = result?.confidence_score == null
    ? null
    : Math.max(0, Math.min(100, Math.round(result.confidence_score * 100)));

  async function runAnalysis() {
    const text = emailText.trim();
    if (!text) {
      setError("Paste a treasury email thread to start the analysis.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload === "object" && payload !== null && "detail" in payload && typeof payload.detail === "string"
          ? payload.detail
          : `Analysis could not be completed (HTTP ${response.status}).`;
        throw new Error(message);
      }
      if (!payload || typeof payload !== "object" || !("risk_level" in payload)) {
        throw new Error("The analysis service returned an unexpected response.");
      }
      setResult(payload as AnalysisResult);
      setLastRun(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date()) + " UTC");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "A connection error interrupted the analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="shell">
      <Box component="aside" className="sidebar">
        <Brand />
        <Typography className="nav-label">Workspace</Typography>
        <NavItem icon={<DashboardRoundedIcon className="nav-icon" />} label="Overview" />
        <NavItem icon={<MailOutlineRoundedIcon className="nav-icon" />} label="Risk analysis" active />
        <NavItem icon={<HistoryRoundedIcon className="nav-icon" />} label="Analysis history" badge="03" />
        <Typography className="nav-label">Intelligence</Typography>
        <NavItem icon={<ShowChartRoundedIcon className="nav-icon" />} label="Exposure monitor" />
        <NavItem icon={<DescriptionOutlinedIcon className="nav-icon" />} label="Audit evidence" />
        <Box sx={{ mt: "auto", p: 1.5, border: "1px solid #2b3852", borderRadius: 3, background: "linear-gradient(145deg, #1a2947, #17223a)" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ width: 27, height: 27, display: "grid", placeItems: "center", borderRadius: 1.5, bgcolor: "#203a57", color: "#72d4bc" }}><ShieldOutlinedIcon sx={{ fontSize: 16 }} /></Box>
            <Typography sx={{ color: "#f4f6fb", fontSize: 11, fontWeight: 750 }}>Grounded by design</Typography>
          </Stack>
          <Typography sx={{ color: "#9aa9c1", fontSize: 10.5, lineHeight: 1.65 }}>Every extraction is checked against the source thread before it reaches your queue.</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, pt: 2 }}>
          <Avatar sx={{ width: 29, height: 29, bgcolor: "#475979", fontSize: 11, fontWeight: 750 }}>MC</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}><Typography noWrap sx={{ color: "#e5eaf4", fontSize: 11, fontWeight: 700 }}>Maya Chen</Typography><Typography sx={{ color: "#8190aa", fontSize: 10 }}>Treasury Operations</Typography></Box>
          <Tooltip title="Protected workspace"><LockOutlinedIcon sx={{ fontSize: 15, color: "#74839c" }} /></Tooltip>
        </Stack>
      </Box>

      <Box component="main" className="main-area">
        <Box className="content-wrap">
          <Box component="header" className="header-bar">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#20ae88", boxShadow: "0 0 0 4px #e0f4ed" }} />
              <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600 }}>Treasury Operations <Box component="span" sx={{ mx: .8, color: "#c4cad5" }}>/</Box> Risk analysis</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip icon={<VerifiedUserOutlinedIcon sx={{ "&&": { fontSize: 14 } }} />} label="Grounding enabled" size="small" sx={{ height: 27, color: "#188267", bgcolor: "#e7f5f0", fontWeight: 700, fontSize: 10.5 }} />
              <Tooltip title="Help"><HelpOutlineRoundedIcon sx={{ ml: 1, color: "#8190a7", fontSize: 20 }} /></Tooltip>
            </Stack>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={2} sx={{ pt: 3.5, pb: 2.4 }}>
            <Box>
              <Typography sx={{ color: "primary.main", fontSize: 10, letterSpacing: ".13em", fontWeight: 800, textTransform: "uppercase", mb: .75 }}>Exception intelligence</Typography>
              <Typography sx={{ color: "#182541", fontSize: { xs: 25, sm: 30 }, lineHeight: 1.15, letterSpacing: "-.04em", fontWeight: 800 }}>Trade exception monitor</Typography>
              <Typography sx={{ color: "text.secondary", mt: .8, fontSize: 13 }}>Turn complex treasury correspondence into an evidence-backed risk view.</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: .25 }}>
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography sx={{ color: "#98a2b4", fontSize: 9, letterSpacing: ".1em", fontWeight: 800 }}>MODEL STATUS</Typography>
                <Typography sx={{ color: "#35435e", fontSize: 11, fontWeight: 700, mt: .35 }}>Gemini + DeepEval</Typography>
              </Box>
              <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: "#e9edff", color: "primary.main", borderRadius: 2 }}><AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} /></Avatar>
            </Stack>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 2 }}>
            <Metric label="Open exception" value={result ? (result.risk_level === "UNKNOWN" ? "In review" : result.risk_level) : "Awaiting input"} icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 18 }} />} accent="#ce8b25" helper={result ? "Risk level from analyzed thread" : "Run an analysis to assess risk"} />
            <Metric label="Exposure identified" value={result ? formatMoney(result.exposure_amount, result.currency) : "—"} icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />} accent="#3155d9" helper={result?.counterparty || "Counterparty exposure from source"} />
            <Metric label="Grounding confidence" value={confidence === null ? "—" : `${confidence}%`} icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />} accent="#159275" helper={result ? (result.grounding_passed ? "Evidence check passed" : "Review evidence before acting") : "Verified against the source thread"} />
          </Box>

          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(420px, .96fr) minmax(430px, 1.04fr)" }, gap: 2, alignItems: "stretch" }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#edf1ff", color: "primary.main", display: "grid", placeItems: "center" }}><ContentPasteGoRoundedIcon sx={{ fontSize: 19 }} /></Box>
                    <Box><Typography sx={{ fontSize: 14, fontWeight: 800 }}>Source communication</Typography><Typography sx={{ color: "text.secondary", fontSize: 11, mt: .3 }}>Paste an email thread to extract settlement risk.</Typography></Box>
                  </Stack>
                  <Chip label="EMAIL THREAD" size="small" sx={{ height: 22, fontWeight: 800, fontSize: 9, letterSpacing: ".05em", bgcolor: "#f2f4f8", color: "#78849a" }} />
                </Stack>
                <Box sx={{ mt: 2.2, position: "relative" }}>
                  <textarea
                    aria-label="Paste treasury email thread"
                    value={emailText}
                    onChange={(event) => setEmailText(event.target.value)}
                    placeholder="Paste a treasury email chain, including any relevant settlement and margin details…"
                    style={{ width: "100%", minHeight: 323, resize: "vertical", padding: 16, border: "1px solid #e5e9f0", borderRadius: 11, background: "#fbfcfe", color: "#46536b", fontSize: 12, lineHeight: 1.75, outline: "none" }}
                  />
                  <Typography sx={{ color: "#a0a9b8", fontSize: 10, position: "absolute", right: 12, bottom: 10, bgcolor: "#fbfcfe", px: .5 }}>{emailText.length.toLocaleString()} characters</Typography>
                </Box>
                <Stack direction={{ xs: "column-reverse", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={1.25} sx={{ mt: 1.75 }}>
                  <Button onClick={() => { setEmailText(SAMPLE_EMAIL); setError(null); }} startIcon={<RefreshRoundedIcon />} sx={{ color: "#71809a", fontSize: 11, justifyContent: { xs: "center", sm: "flex-start" } }}>Restore sample email</Button>
                  <Button variant="contained" onClick={runAnalysis} disabled={loading || !emailText.trim()} endIcon={loading ? undefined : <ArrowForwardRoundedIcon />} sx={{ px: 2.25, py: 1.1, boxShadow: "0 5px 14px rgba(49,85,217,.22)", minWidth: 165 }}>
                    {loading ? <><CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />Analyzing…</> : "Run Risk Analysis"}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={.75} alignItems="center" sx={{ mt: 1.7 }}>
                  <LockOutlinedIcon sx={{ color: "#9aa5b5", fontSize: 13 }} />
                  <Typography sx={{ color: "#929daf", fontSize: 10 }}>Input is processed for analysis and grounded against your source text.</Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ overflow: "hidden" }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#e9f6f2", color: "#158b70", display: "grid", placeItems: "center" }}><TrendingUpRoundedIcon sx={{ fontSize: 20 }} /></Box>
                    <Box><Typography sx={{ fontSize: 14, fontWeight: 800 }}>Extracted risk signals</Typography><Typography sx={{ color: "text.secondary", fontSize: 11, mt: .3 }}>Structured entities from the communication.</Typography></Box>
                  </Stack>
                  {result && <Chip size="small" color={riskStyles[result.risk_level]?.color || "default"} label={riskStyles[result.risk_level]?.label || "Unknown"} sx={{ fontSize: 10, fontWeight: 800 }} />}
                </Stack>

                {!result && !loading ? (
                  <Box sx={{ minHeight: 275, display: "grid", placeItems: "center", textAlign: "center", px: 3 }}>
                    <Box>
                      <Box sx={{ width: 58, height: 58, borderRadius: "50%", bgcolor: "#f2f5fa", color: "#9aa7bc", display: "grid", placeItems: "center", mx: "auto", mb: 1.5 }}><AutoAwesomeRoundedIcon sx={{ fontSize: 25 }} /></Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 750, color: "#48566e" }}>Analysis results will appear here</Typography>
                      <Typography sx={{ maxWidth: 260, mx: "auto", mt: .6, color: "text.secondary", fontSize: 11, lineHeight: 1.6 }}>Run the sample thread or paste a new communication to extract its risk signals.</Typography>
                    </Box>
                  </Box>
                ) : loading ? (
                  <Box sx={{ minHeight: 275, display: "grid", placeItems: "center", px: 3 }}>
                    <Stack alignItems="center" spacing={1.6} sx={{ width: "100%", maxWidth: 290 }}>
                      <CircularProgress size={35} thickness={4} />
                      <Typography sx={{ fontSize: 12, color: "#48566e", fontWeight: 700 }}>Reading communication signals</Typography>
                      <Typography sx={{ fontSize: 10.5, color: "text.secondary", textAlign: "center" }}>Extracting entities and checking each claim against the source.</Typography>
                      <LinearProgress sx={{ width: "100%", borderRadius: 5, height: 4 }} />
                    </Stack>
                  </Box>
                ) : result && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 2, rowGap: 2.1 }}>
                      <Box><Typography sx={{ color: "text.secondary", fontSize: 10, fontWeight: 700, mb: .6 }}>COUNTERPARTY</Typography><Typography sx={{ fontSize: 13, fontWeight: 750 }}>{result.counterparty || "Not identified"}</Typography></Box>
                      <Box><Typography sx={{ color: "text.secondary", fontSize: 10, fontWeight: 700, mb: .6 }}>EXPOSURE AMOUNT</Typography><Typography className="mono" sx={{ fontSize: 13, fontWeight: 750 }}>{formatMoney(result.exposure_amount, result.currency)}</Typography></Box>
                      <Box><Typography sx={{ color: "text.secondary", fontSize: 10, fontWeight: 700, mb: .6 }}>SETTLEMENT DATE</Typography><Typography sx={{ fontSize: 13, fontWeight: 750 }}>{formatDate(result.settlement_date)}</Typography></Box>
                      <Box><Typography sx={{ color: "text.secondary", fontSize: 10, fontWeight: 700, mb: .6 }}>RISK LEVEL</Typography><Chip size="small" color={riskStyles[result.risk_level]?.color || "default"} label={riskStyles[result.risk_level]?.label || "Unknown"} sx={{ height: 23, fontSize: 10, fontWeight: 800 }} /></Box>
                    </Box>

                    <Box sx={{ mt: 2.2, p: 1.6, borderRadius: 2.5, bgcolor: result.grounding_passed ? "#f0f8f5" : "#fff8ef", border: `1px solid ${result.grounding_passed ? "#d9eee6" : "#f6e8d2"}` }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {result.grounding_passed ? <CheckCircleOutlineRoundedIcon sx={{ fontSize: 17, color: "#188267" }} /> : <ErrorOutlineRoundedIcon sx={{ fontSize: 17, color: "#c7872a" }} />}
                        <Typography sx={{ flex: 1, color: "#34435a", fontSize: 11, fontWeight: 750 }}>{result.grounding_passed ? "Source grounding passed" : "Grounding review recommended"}</Typography>
                        <Typography className="mono" sx={{ fontSize: 12, color: result.grounding_passed ? "#188267" : "#b4771e", fontWeight: 850 }}>{confidence === null ? "—" : `${confidence}%`}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={confidence ?? 0} color={result.grounding_passed ? "success" : "warning"} sx={{ mt: 1.1, height: 5, borderRadius: 5, bgcolor: "rgba(35, 65, 75, .08)" }} />
                      <Typography sx={{ color: "#8591a3", fontSize: 9.5, mt: .8 }}>DeepEval grounding alignment against the supplied email text</Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ color: "text.secondary", fontSize: 10, fontWeight: 750, mb: .6 }}>ANALYST SUMMARY</Typography>
                      <Typography sx={{ color: "#4c5a71", fontSize: 11, lineHeight: 1.65 }}>{result.summary || "No summary returned."}</Typography>
                    </Box>

                    <Box sx={{ mt: 1.8 }}>
                      <Typography sx={{ color: "text.secondary", fontSize: 10, fontWeight: 750, mb: .7 }}>SOURCE EVIDENCE</Typography>
                      {result.evidence?.length ? <Stack spacing={.7}>{result.evidence.map((item, index) => <Stack key={`${index}-${item}`} direction="row" spacing={.8} alignItems="flex-start"><Box sx={{ width: 5, height: 5, flex: "0 0 auto", borderRadius: "50%", bgcolor: "#8094d8", mt: .8 }} /><Typography sx={{ color: "#65728a", fontSize: 10.5, lineHeight: 1.55 }}>{item}</Typography></Stack>)}</Stack> : <Typography sx={{ color: "#8994a6", fontSize: 10.5 }}>No supporting evidence was returned.</Typography>}
                    </Box>
                  </>
                )}
              </CardContent>
              {result && <Box sx={{ borderTop: "1px solid #edf0f4", px: 2.5, py: 1.15, bgcolor: "#fcfdfe" }}><Stack direction="row" justifyContent="space-between"><Typography sx={{ color: "#98a2b1", fontSize: 9.5 }}>ANALYSIS ID · SESSION ONLY</Typography><Typography sx={{ color: "#98a2b1", fontSize: 9.5 }}>{lastRun || "Just now"}</Typography></Stack></Box>}
            </Card>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mt: 2, px: .25 }}>
            <Stack direction="row" spacing={.7} alignItems="center"><ShieldOutlinedIcon sx={{ fontSize: 14, color: "#788aa5" }} /><Typography sx={{ color: "#77859b", fontSize: 10 }}>Human review required before any settlement or collateral action.</Typography></Stack>
            <Typography sx={{ display: { xs: "none", sm: "block" }, color: "#c3cad4", fontSize: 10 }}>•</Typography>
            <Typography sx={{ color: "#a2abba", fontSize: 10 }}>Prototype · Simulated treasury communications</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
