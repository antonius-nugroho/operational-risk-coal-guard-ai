# Coal-Guard™ AI: Coal Power Plant Operational Risk & Opportunity Modeling Engine

A production-grade, user-authenticated risk quantification system for Coal-Fired Thermal Power Plants. It quantifies **Operational Risk (Downside)**, **Economic Opportunity (Upside)**, and **Stochastic Uncertainty (Volatility)** using Machine Learning models trained on historical loss events and high-frequency SCADA telemetry.

---

## 🏛 Industrial Reference Architecture

The application implements Google Cloud Platform's industrial architecture:
1. **Gemini on Vertex AI**: Chief Risk Officer (CRO) probabilistic reasoning, multi-model fallback ladder (`gemini-3.6-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, `gemini-3.7-flash`), and engineering directive synthesis.
2. **Vertex AI Model Registry & Endpoints**: Ensemble Gradient Boosted Trees and LSTM anomaly models predicting 30-day subsystem failure probabilities (Boiler tubes, Pulverizers, Turbine blades, FGD units).
3. **BigQuery**: Petabyte-scale operational data warehouse storing 10-second DCS/SCADA tag telemetry, heat rate performance balances, and loss ledgers.
4. **Cloud Pub/Sub & Dataflow**: Real-time streaming buffer and windowing pipeline ingesting edge OPC-UA sensor telemetry with zero drop.
5. **Google Cloud Storage (GCS)**: Stores thermography drone inspection imagery and coal proximate test certificates.
6. **Firebase Authentication & Cloud Firestore**: User data isolation, owner-bound document security, and persistent risk assessment snapshots.
7. **Google Cloud Run**: Autoscaling, containerized full-stack deployment.

---

## 🔒 Threat Model & Security Posture

| Threat Zone | Identified Attack Vector | Countermeasure & Implementation |
|---|---|---|
| **Input Surfaces** | Malicious injection in Plant parameters & Loss event payloads | Strict numeric range bounds, TypeScript schema validation, zero-crash undefined sanitization |
| **Planning & AI Reasoning** | Indirect prompt injection via sensor logs or unstructured notes | Prompt parameterization and isolation of external logs as static operational data |
| **Tool Execution** | SSRF or unauthorized endpoint invocation | All Gemini calls executed with deterministic fallback ladders and bounded timeouts |
| **Memory & State** | Cross-tenant data leaks and unauthorized document overrides | Cloud Firestore rules enforcing owner-bound isolation (`request.auth.uid == userId`) |
| **Secrets & Keys** | Leaked API credentials | Managed via Google Cloud Secret Manager & runtime injection (`GEMINI_API_KEY`) |

---

## 📋 Firestore Security Rules

Ensure your `firestore.rules` enforces user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/assessments/{assessmentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/lossEvents/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/failure_events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/business_metrics/{metricId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🚀 Google Cloud Run Deployment Guide

### 1. Prerequisites & API Activation
Ensure the `gcloud` CLI is configured with your GCP project:

```bash
# Set default project
gcloud config set project YOUR_PROJECT_ID

# Enable requisite Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  pubsub.googleapis.com \
  dataflow.googleapis.com
```

### 2. Secret Manager Configuration
Store the Gemini API Key securely in Google Cloud Secret Manager:

```bash
# Create the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Inject the secret value
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run
Deploy the application container directly to Cloud Run:

```bash
gcloud run deploy coal-guard-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars=NODE_ENV=production
```

### 4. Mandatory Campaign Verification Label
Apply the required campaign label for automated challenge verification:

```bash
gcloud run services update coal-guard-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Functional Verification Walkthrough
Use the in-app **Verification Checklist** (top navigation button) to walk through all 8 test cases:
1. **TC-1**: Monte Carlo Simulation (Poisson-Lognormal 2,500 iterations, P10/P50/P90 recalculation).
2. **TC-2**: Plant Parameter Calibration (Gross MW, Heat Rate, PPA tariff sensitivity).
3. **TC-3**: Resilient Gemini Multi-Model Fallback Reasoning.
4. **TC-4**: Vertex AI Subsystem Risk Diagnostic (Boiler tubes, Pulverizer, Turbine, FGD).
5. **TC-5**: Historical Loss Event & Root Cause Analysis (RCA) ingestion.
6. **TC-6**: BigQuery Telemetry Stream & Real-Time Sensor Anomaly Injection.
7. **TC-7**: GCP Industrial Architecture Topology inspection.
8. **TC-8**: Owner-Bound Cloud Firestore Snapshot Persistence.
