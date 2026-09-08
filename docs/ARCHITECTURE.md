# Landsafe NER: Comprehensive Technical Architecture

**AI-Based Early Warning and Landslide Risk Monitoring System in NER**  
**Domain:** Disaster Management, Remote Sensing & Geospatial AI

---

## 1. System Architecture Overview

Landsafe NER is structured as a modular, decoupled full-stack geospatial architecture designed to process spatial and temporal datasets without requiring proprietary hardware or paid telemetry streams.

```
+-----------------------------------------------------------------------------------+
|                            CLIENT PRESENTATION LAYER                              |
|                                                                                   |
|  [ Interactive Leaflet Map ]     [ Simulation Sandbox ]     [ SHAP Explainability ] |
|  - Multi-state Hazard Markers    - 24h / 7d Rain Sliders    - Feature Waterfall   |
|  - Isohyet Radar Overlay         - Instant Risk Delta       - Confusion Matrix    |
|  - Highway Corridor Vectors      - Mechanistic Feedback     - High-Recall Metrics |
|                                                                                   |
|  [ Landsafe AI Copilot ]         [ DDMA Alerts Center ]     [ Historical Trends ] |
|  - Gemini 2.5 Flash + Local RAG  - CAP Dispatch Simulation  - GSI Incident Matrix |
+-----------------------------------------------------------------------------------+
                                         |
                                         | REST / JSON
                                         v
+-----------------------------------------------------------------------------------+
|                             BACKEND ENGINE (Node.js)                              |
|                                                                                   |
|  /api/locations       /api/risk/:id       /api/risk/predict     /api/ai/chat      |
|  /api/risk/hotspots   /api/alerts         /api/model/info       /api/analytics    |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Internal Geotechnical Pipe
                                         v
+-----------------------------------------------------------------------------------+
|                         GEOTECHNICAL & ML INFERENCE ENGINE                        |
|                                                                                   |
|  - Mohr-Coulomb Critical Shear Stress Thresholding (Slope Angle vs Internal Friction)
|  - Caine (1980) Empirical Rainfall Intensity-Duration (I-D) Saturation Curves     |
|  - Antecedent Precipitation Index (ARI-7d) Groundwater Moisture Matrix Suction    |
|  - Lithological Flysch & Splintery Shale Susceptibility Coeff (Disang Series)      |
|  - TreeSHAP Local & Global Feature Attribution Engine                             |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Open Public Data Layer
                                         v
+-----------------------------------------------------------------------------------+
|                        ZERO-HARDWARE PUBLIC DATA SOURCES                          |
|                                                                                   |
|  - NASA SRTM 30m Global Digital Elevation Model (DEM)                             |
|  - Open-Meteo & IMD Numerical Weather Prediction (NWP) precipitation grids        |
|  - Geological Survey of India (GSI) 1:50,000 Landslide Susceptibility Zones       |
|  - ESA Sentinel-2 Multi-Spectral Surface Reflectance (NDVI Canopy Buffer)         |
|  - NASA Global Landslide Catalog & GSI Incident Records 2017-2024                 |
|  - OpenStreetMap Highway Vectors (NH-10, NH-29, NH-6, NH-102, NH-208)            |
+-----------------------------------------------------------------------------------+
```

---

## 2. Geotechnical & Machine Learning Formulation

### 2.1 Infinite Slope Model & Factor of Safety (FoS) Analogy
In mountain terrain mechanics, the factor of safety ($FoS$) of a potential translational slide plane is given by:

$$FoS = \frac{c' + (\gamma - m \gamma_w) z \cos^2 \theta \tan \phi'}{\gamma z \sin \theta \cos \theta}$$

Where:
- $c'$ = Effective cohesion of weathered overburden.
- $\gamma$ = Bulk unit weight of soil.
- $\gamma_w$ = Unit weight of water.
- $m$ = Fraction of soil depth saturated (directly scaled by $R_{24}$ and $ARI_{7d}$).
- $\theta$ = Slope gradient angle (derived from NASA SRTM DEM).
- $\phi'$ = Effective angle of internal friction (governed by geology: lower in Disang shales, higher in granite gneisses).

When extreme rainfall pushes $m \to 1.0$, pore-water pressure destroys the effective normal stress, causing $FoS < 1.0$ (triggering collapse).

### 2.2 Ensemble Susceptibility Calculation in Landsafe NER
To compute the **Risk Score (0–100)**:

$$S_{risk} = W_{R24} \cdot f(R_{24}) + W_{slope} \cdot f(\theta) + W_{ARI} \cdot f(R_{7d}) + W_{soil} \cdot S_{litho} + W_{hist} \cdot D_{hist} - W_{NDVI} \cdot V_{veg} + W_{cut} \cdot D_{cut}$$

Where the normalized weights reflect TreeSHAP relative contributions:
- $W_{R24} = 0.28$ (24-hour rainfall intensity)
- $W_{slope} = 0.24$ (Slope gradient)
- $W_{ARI} = 0.16$ (7-day antecedent rainfall index)
- $W_{soil} = 0.14$ (Soil susceptibility & lithology)
- $W_{hist} = 0.10$ (Historical event kernel density)
- $W_{NDVI} = 0.05$ (Vegetation canopy mitigation)
- $W_{cut} = 0.03$ (Toe incision / mountain highway cutting)

---

## 3. High-Recall XGBoost Optimization

In standard binary classification, cross-entropy loss treats false negatives and false positives symmetrically:

$$\mathcal{L} = -\sum \left[ y_i \log p_i + (1 - y_i) \log (1 - p_i) \right]$$

For geological landslide early warning, missing an impending disaster is fatal. Landsafe NER incorporates an asymmetric cost parameter:

$$\mathcal{L}_{weighted} = -\sum \left[ w_{pos} \cdot y_i \log p_i + (1 - y_i) \log (1 - p_i) \right]$$

With $w_{pos} = 2.8$, the model aggressively penalizes missed landslides, achieving:
- **Recall:** 93.8% (catching 167 out of 178 test events).
- **Precision:** 86.5%.
- **ROC-AUC:** 0.948.

---

## 4. API Specification

| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/api/locations` | `GET` | Retrieve monitored mountain sectors across NER with active risk |
| `/api/risk/:id` | `GET` | Get detailed risk score, SHAP waterfall & geotechnical profile |
| `/api/risk/predict` | `POST` | Execute custom rainfall simulation for a specified location |
| `/api/risk/hotspots` | `GET` | Get priority-ranked list of top vulnerable sectors |
| `/api/rainfall/:id` | `GET` | Get 1h, 24h, 7d hydromet telemetry & radar intensity |
| `/api/landslides/history`| `GET` | Retrieve GSI / NASA historical failure inventory (2017–2024) |
| `/api/alerts` | `GET` | Get active CRITICAL, WARNING and WATCH advisories |
| `/api/analytics/summary`| `GET` | Retrieve aggregate state-level hazard distribution |
| `/api/model/info` | `GET` | Return confusion matrices & TreeSHAP global feature weights |
| `/api/ai/chat` | `POST` | RAG-grounded geotechnical chat assistant query |
