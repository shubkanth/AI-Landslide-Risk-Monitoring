# Landsafe NER: 3-Minute Hackathon Demo Script

Follow this step-by-step walkthrough during the Smart India Hackathon evaluation to demonstrate all required capabilities smoothly to the judges.

---

## Step 1: The Live Regional Surveillance View (0:00 – 0:45)
1. **Screen:** Open the default **Regional Risk Map**.
2. **Action:**
   - Point to the live metric bar at the top: *Monitored Locations*, *Active Critical Hazards*, and *Average 24h Rainfall*.
   - Use the **NER State Selector** in the navbar to filter by **"Manipur"** or **"Sikkim"**.
   - Show how the map and list dynamically center on the selected state.
3. **Narration:**
   > *"Here is the live Landsafe NER command center. We are currently monitoring all 8 North Eastern states using NASA 30m DEM terrain slopes, GSI susceptibility classifications, and real-time rainfall data. Notice the color-coded markers from Low risk green to Critical red with pulsating hazard rings."*
4. **Action:**
   - On the top right of the map, toggle the **"Highway Corridors"** layer.
   - Show NH-10 (Sikkim lifeline) and NH-29 (Kohima-Dimapur corridor).
   - Toggle the **"Rainfall Radar"** and **"Historical Incidents"** layers to show the multi-layer GIS capability.

---

## Step 2: Location Analysis & TreeSHAP Explainability (0:45 – 1:30)
1. **Action:**
   - Click on the marker for **"Noney / Tupul Section"** (Manipur) or select it from the search bar.
   - The **Location Analysis Drawer** slides out from the right.
2. **Narration:**
   > *"When a district magistrate clicks on a vulnerable sector, they get complete explainability rather than a black-box number. We see a Risk Score of 89/100 and a 91.2% probability of slope failure."*
3. **Action:**
   - Scroll down to the **"Feature Contributions (SHAP Attributions)"** waterfall bar chart.
   - Point to the **"Why is this location at risk?"** machine-generated text.
4. **Narration:**
   > *"Notice the explainable AI breakdown: 24h rainfall (+26.8 impact) and steep 42-degree slope (+21.4 impact) are the dominant drivers overpowering vegetation resistance. Below, we provide clear geotechnical Standard Operating Procedures for the DDMA: halting railway earthworks and issuing evacuation orders for riverbank encampments."*

---

## Step 3: The Interactive Rainfall Simulation Sandbox (1:30 – 2:15)
1. **Action:**
   - Click the amber button: **"Simulate Extreme Rain"** inside the drawer, or switch to the **"Simulation Sandbox"** tab in the sidebar.
2. **Narration:**
   > *"One of our flagship innovations for disaster preparedness is this interactive What-If Simulation Sandbox."*
3. **Action:**
   - Click the preset button: **"Extreme Cloudburst / Remal Cyclone (220mm)"** OR drag the **24-Hour Rainfall slider** from 40mm up to 180mm.
   - Observe the real-time calculation update: the baseline risk jumps from Moderate (45) to Critical (88), the badge turns red, and the SHAP bar chart recalculates instantly!
4. **Narration:**
   > *"Notice how the model recalculates pore-water response in real-time. A district magistrate can simulate an incoming IMD heavy rainfall alert 6 hours before it hits, and see exactly which hill slopes will cross the catastrophic failure threshold."*

---

## Step 4: Alerts Center & Landsafe AI Assistant (2:15 – 3:00)
1. **Action:**
   - Navigate to the **"Early Warnings"** tab.
   - Click **"Dispatch Alert (CAP Protocol)"** to demonstrate the simulated automated SMS & emergency radio dispatch.
   - Click **"Export SITREP (JSON)"** to show how disaster authorities can download an instant standardized situation report.
2. **Action:**
   - Navigate to the **"Landsafe AI Chat"** tab.
   - Click one of the suggested prompts: *"Which districts currently have the highest landslide risk?"*
   - Show how the AI retrieves current live platform telemetry rather than hallucinating generic advice.
3. **Concluding Statement:**
   > *"In conclusion, Landsafe NER provides a scalable, zero-hardware, production-grade early-warning prototype engineered specifically for the terrain realities of North East India. Thank you!"*
