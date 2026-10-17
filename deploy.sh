#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID before deploying}"
GCP_REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-treasury-risk-analyzer}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI is required. Install it and authenticate before deploying." >&2
  exit 1
fi

cat <<EOF
About to deploy Cloud Run service: ${SERVICE_NAME}
Project: ${GCP_PROJECT_ID}
Region: ${GCP_REGION}
Source: . (Dockerfile)
Public access: enabled for judging
Gemini secret: Secret Manager secret gemini-api-key:latest

Create the Secret Manager secret and grant the Cloud Run service identity
access before running this script. No credential values are included here.
EOF

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --project "${GCP_PROJECT_ID}" \
  --region "${GCP_REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "GCP_PROJECT_ID=${GCP_PROJECT_ID},GEMINI_MODEL=${GEMINI_MODEL:-gemini-3.8-flash}" \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"
