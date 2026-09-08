export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type AlertLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface LocationData {
  id: string;
  name: string;
  district: string;
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Manipur' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Sikkim';
  lat: number;
  lng: number;
  elevation: number; // meters
  slope: number; // degrees
  aspect: string; // N, NE, E, SE, S, SW, W, NW
  geology: string;
  soilType: string;
  soilSusceptibility: number; // 1 to 10
  ndvi: number; // Normalized Difference Vegetation Index 0 to 1
  historicalEventsCount: number;
  distanceToDrainage: number; // meters
  distanceToRoads: number; // meters
  currentRainfall: number; // mm in last 1h
  rainfall6h: number;
  rainfall24h: number;
  rainfall7d: number; // antecedent rainfall
  historicalDensity: number; // score 0 to 10
}

export interface SHAPContribution {
  feature: string;
  displayName: string;
  value: string;
  delta: number; // impact on risk score (e.g. +18 or -6)
  isRiskIncreasing: boolean;
}

export interface RiskPredictionResult {
  locationId: string;
  score: number; // 0 - 100
  category: RiskCategory;
  probability: number; // 0.0 - 1.0
  alertLevel: AlertLevel;
  confidence: number; // %
  topFactors: SHAPContribution[];
  explanation: string;
  recommendedAction: string;
  rainfallStatus: {
    intensity: 'Low' | 'Moderate' | 'Heavy' | 'Very Heavy' | 'Extreme';
    value24h: number;
    antecedent7d: number;
  };
  terrainStatus: {
    slopeCategory: 'Gentle' | 'Moderate' | 'Steep' | 'Very Steep' | 'Precipitous';
    slopeAngle: number;
  };
  simulated?: boolean;
}

export interface LandslideEvent {
  id: string;
  date: string;
  year: number;
  month: string;
  locationName: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  fatalities: number;
  injuries: number;
  trigger: 'Monsoon Deluge' | 'Cloudburst' | 'Road Cutting / Excavation' | 'Earthquake / Tremor' | 'Continuous Heavy Rain';
  impactDescription: string;
  estimatedVolumeM3: number;
  source: 'GSI National Landslide Susceptibility Mapping' | 'NASA Global Landslide Catalog' | 'SDMA State Incident Log';
}

export interface AlertItem {
  id: string;
  locationId: string;
  locationName: string;
  district: string;
  state: string;
  timestamp: string;
  alertLevel: AlertLevel;
  riskScore: number;
  triggerReason: string;
  recommendedAction: string;
  rainfall24h: number;
  slope: number;
}

export interface ModelMetrics {
  name: string;
  type: string;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  accuracy: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  hyperparameters: Record<string, string | number>;
  keyStrength: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
}
