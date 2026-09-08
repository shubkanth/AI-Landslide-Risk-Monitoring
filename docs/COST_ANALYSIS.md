# Landsafe NER: Cost Analysis & Budget Feasibility

**Economic Justification: Zero-Hardware Prototype vs. IoT Hardware vs. Production Scale**

---

## 1. Student Hackathon Prototype Budget: ₹0 (Zero Hardware Cost)

Landsafe NER was specifically architected to prove that an enterprise-grade disaster monitoring platform can be designed with **zero capital expenditure**, fulfilling the student hackathon mandate:

| Component | Technology Used | Cost (INR) |
| :--- | :--- | :--- |
| **Development & ML Environment** | Node.js, Express, TypeScript, Vite, Python scikit-learn/XGBoost | **₹0.00** (Free & Open Source) |
| **Digital Elevation Models (DEM)** | NASA Shuttle Radar Topography Mission (SRTM 30m) & ALOS PALSAR | **₹0.00** (Open Data Policy) |
| **Weather & Hydromet Telemetry** | Open-Meteo & IMD Public Numerical Weather Feeds | **₹0.00** (Open Public API) |
| **Geological Susceptibility Maps** | Geological Survey of India (GSI) 1:50k Regional Baselines | **₹0.00** (Govt Public Domain) |
| **Satellite Imagery & Canopy** | ESA Copernicus Sentinel-2 (Copernicus Browser) | **₹0.00** (Open Data Access) |
| **Map Engine & Vectors** | Leaflet.js, OpenStreetMap, CartoDB Dark Matter | **₹0.00** (Open Source / Free Tier) |
| **Hosting & Cloud Runtime** | Free Cloud Hosting (Render / Vercel / Cloud Run free quota) | **₹0.00** |
| **Total Prototype Budget** | | **₹0.00** |

---

## 2. Hardware-Based Approach vs. Landsafe NER Software Approach

A common proposal in university hackathons is deploying microcontrollers (ESP32, Arduino, Raspberry Pi) with physical geotechnical sensors (accelerometers, soil moisture probes, tiltmeters, wire extensometers). The table below contrasts this approach against Landsafe NER for monitoring the **50-kilometer NH-10 corridor (Sevoke to Gangtok)**:

| Cost & Operational Item | Physical Hardware / IoT Grid (ESP32) | Landsafe NER (Software & Satellite AI) |
| :--- | :--- | :--- |
| **Sensor Units Required** | ~500 nodes (1 node every 100 meters) | **0 physical nodes** |
| **Hardware Procurement** | ₹75,00,000 (at ₹15,000/node including weather-proof housing) | **₹0.00** |
| **Solar Power & Battery Replacement** | ₹12,50,000 (at ₹2,500/node) | **₹0.00** |
| **Installation & Rigging in Steep Terrain** | ₹20,00,000 (specialized mountaineering teams) | **₹0.00** |
| **Cellular / LoRa Gateway Uplinks** | ₹8,00,000 initial + recurring monthly SIM costs | **₹0.00** (Central server pull) |
| **Vulnerability to Debris Flow Destruction** | **High** (sensors destroyed during the very event they monitor) | **Zero risk** (100% remote satellite observation) |
| **Total Estimated First-Year Cost** | **₹1,15,50,000 (~₹1.15 Crores)** | **₹0.00 (Prototype) / ~₹25,000 (Hosting)** |

---

## 3. Production Deployment Cost Estimate (Regional NER Scale)

For deployment by the **North Eastern Council (NEC)** or **National Disaster Management Authority (NDMA)** to monitor all 8 NER states continuously:

### Monthly Cloud Infrastructure (Scalable Serverless Architecture)
- **Geospatial Processing Server (2 x vCPU, 8GB RAM Cloud Run / Container):** ~₹3,500 / month
- **High-Resolution Satellite Raster Storage (Google Cloud Storage / AWS S3 - 500GB):** ~₹900 / month
- **SMS Gateway for CAP Alert Dispatches (10,000 SMS/month to local responders):** ~₹2,500 / month
- **Domain & SSL Maintenance:** ~₹200 / month
- **Total Monthly Production Cost:** **~₹7,100 / month (~₹85,200 / year)**

### Cost Benefit Ratio
For less than **₹1,00,000 annually**, the state disaster management authorities can provide continuous, real-time landslide surveillance covering thousands of square kilometres across the North East, saving crores of rupees in highway clearance delays, equipment damage, and countless human lives.
