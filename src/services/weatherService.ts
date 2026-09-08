// Weather and Radar service for Landsafe NER
// Integrates RainViewer Doppler Radar tiles, NASA GIBS Satellite Cloud layers, and Open-Meteo live meter telemetry.

export interface RadarFrame {
  time: number;
  path: string;
  isoTime: string;
  formattedTimeIST: string;
  relativeTimeStr: string;
  isNowcast: boolean;
}

export interface RadarApiResponse {
  host: string;
  generated: number;
  frames: RadarFrame[];
  latestFrame: RadarFrame | null;
}

export interface LiveWeatherMeter {
  locationName?: string;
  lat: number;
  lng: number;
  temperature: number; // °C
  humidity: number; // %
  precipitation: number; // mm/h
  rain: number; // mm
  cloudCover: number; // % (0 to 100)
  windSpeed: number; // km/h
  weatherCode: number;
  weatherDescription: string;
  rainIntensityLevel: 'Dry' | 'Light Rain' | 'Moderate Rain' | 'Heavy Rain' | 'Torrential / Cloudburst';
  dbzEquivalent: number; // estimated radar dBZ reflectivity (0-70)
  cloudCategory: 'Clear Sky' | 'Scattered Clouds' | 'Broken Overcast' | 'Dense Overcast' | 'Convective Cloudburst Shield';
  timestampIST: string;
}

// Convert WMO code to description
export function getWMODescription(code: number): string {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Fog / Haze';
    case 51: case 53: case 55: return 'Light Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Rain';
    case 80: return 'Slight Rain Showers';
    case 81: return 'Moderate Showers';
    case 82: return 'Violent Rain Showers';
    case 95: return 'Thunderstorm';
    case 96: case 99: return 'Severe Thunderstorm with Hail';
    default: return 'Cloudy with Rain';
  }
}

// Calculate dBZ radar reflectivity from rain rate (mm/h) using Marshall-Palmer Z = 200 * R^1.6
export function calculateDbzFromRainRate(rainRateMmPerHour: number): number {
  if (rainRateMmPerHour <= 0.05) return 10;
  const z = 200 * Math.pow(rainRateMmPerHour, 1.6);
  const dbz = 10 * Math.log10(Math.max(z, 1));
  return Math.round(Math.min(Math.max(dbz, 10), 68));
}

// Classify rain rate meter
export function classifyRainMeter(rate: number): 'Dry' | 'Light Rain' | 'Moderate Rain' | 'Heavy Rain' | 'Torrential / Cloudburst' {
  if (rate <= 0.1) return 'Dry';
  if (rate < 2.5) return 'Light Rain';
  if (rate < 10.0) return 'Moderate Rain';
  if (rate < 50.0) return 'Heavy Rain';
  return 'Torrential / Cloudburst';
}

// Classify cloud cover meter
export function classifyCloudMeter(cloudPercent: number): 'Clear Sky' | 'Scattered Clouds' | 'Broken Overcast' | 'Dense Overcast' | 'Convective Cloudburst Shield' {
  if (cloudPercent <= 15) return 'Clear Sky';
  if (cloudPercent <= 40) return 'Scattered Clouds';
  if (cloudPercent <= 70) return 'Broken Overcast';
  if (cloudPercent <= 90) return 'Dense Overcast';
  return 'Convective Cloudburst Shield';
}

// Format timestamp to Indian Standard Time (IST, UTC+5:30)
export function formatToIST(timestampSec: number): { formatted: string; relative: string } {
  const date = new Date(timestampSec * 1000);
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  
  const timeStr = date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let relative = '';
  if (diffMinutes === 0) relative = 'Live now';
  else if (diffMinutes > 0) relative = `${diffMinutes}m ago`;
  else relative = `in ${Math.abs(diffMinutes)}m`;

  return {
    formatted: `${timeStr} IST`,
    relative
  };
}

// In-memory caches to prevent rate limiting
let cachedRadarResponse: RadarApiResponse | null = null;
let lastRadarFetchTime = 0;
const RADAR_CACHE_TTL = 90 * 1000; // 90 seconds

/**
 * Fetch available RainViewer Doppler Radar frames (past observations + nowcast)
 */
export async function fetchRainViewerRadar(): Promise<RadarApiResponse> {
  const now = Date.now();
  if (cachedRadarResponse && (now - lastRadarFetchTime < RADAR_CACHE_TTL)) {
    return cachedRadarResponse;
  }

  try {
    // Try backend proxy first
    const res = await fetch('/api/weather/radar-frames').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      cachedRadarResponse = data;
      lastRadarFetchTime = now;
      return data;
    }

    // Direct fallback to RainViewer public API
    const directRes = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!directRes.ok) throw new Error(`RainViewer HTTP ${directRes.status}`);
    const data = await directRes.json();
    
    const host = data.host || 'https://tilecache.rainviewer.com';
    const past = (data.radar?.past || []).map((f: { time: number; path: string }) => {
      const ist = formatToIST(f.time);
      return {
        time: f.time,
        path: f.path,
        isoTime: new Date(f.time * 1000).toISOString(),
        formattedTimeIST: ist.formatted,
        relativeTimeStr: ist.relative,
        isNowcast: false
      };
    });

    const nowcast = (data.radar?.nowcast || []).map((f: { time: number; path: string }) => {
      const ist = formatToIST(f.time);
      return {
        time: f.time,
        path: f.path,
        isoTime: new Date(f.time * 1000).toISOString(),
        formattedTimeIST: ist.formatted,
        relativeTimeStr: ist.relative,
        isNowcast: true
      };
    });

    const allFrames = [...past, ...nowcast];
    const latest = past.length > 0 ? past[past.length - 1] : (allFrames[0] || null);

    const result: RadarApiResponse = {
      host,
      generated: data.generated,
      frames: allFrames,
      latestFrame: latest
    };

    cachedRadarResponse = result;
    lastRadarFetchTime = now;
    return result;
  } catch (err) {
    console.warn('Failed to load live RainViewer radar, using fallback frames:', err);
    // Graceful fallback with generated recent timestamps
    const nowSec = Math.floor(Date.now() / 1000);
    const fallbackFrames: RadarFrame[] = [];
    for (let i = 8; i >= 0; i--) {
      const t = nowSec - (i * 600);
      const ist = formatToIST(t);
      fallbackFrames.push({
        time: t,
        path: `/v2/radar/fallback-${i}`,
        isoTime: new Date(t * 1000).toISOString(),
        formattedTimeIST: ist.formatted,
        relativeTimeStr: ist.relative,
        isNowcast: false
      });
    }

    return {
      host: 'https://tilecache.rainviewer.com',
      generated: nowSec,
      frames: fallbackFrames,
      latestFrame: fallbackFrames[fallbackFrames.length - 1]
    };
  }
}

// In-memory weather cache by coordinates
const weatherCache = new Map<string, { data: LiveWeatherMeter; time: number }>();
const WEATHER_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

/**
 * Fetch live weather meter data from Open-Meteo
 */
export async function fetchLiveWeatherMeter(
  lat: number,
  lng: number,
  locationName?: string
): Promise<LiveWeatherMeter> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const now = Date.now();
  const cached = weatherCache.get(cacheKey);

  if (cached && (now - cached.time < WEATHER_CACHE_TTL)) {
    return cached.data;
  }

  try {
    // Try backend proxy
    const proxyUrl = `/api/weather/live?lat=${lat}&lng=${lng}${locationName ? `&name=${encodeURIComponent(locationName)}` : ''}`;
    const proxyRes = await fetch(proxyUrl).catch(() => null);
    if (proxyRes && proxyRes.ok) {
      const data = await proxyRes.json();
      weatherCache.set(cacheKey, { data, time: now });
      return data;
    }

    // Direct fetch to Open-Meteo API (CORS enabled & free)
    const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,cloud_cover,weather_code,wind_speed_10m&forecast_days=1`;
    const res = await fetch(directUrl);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();

    const curr = data.current || {};
    const rainMm = Number(curr.precipitation ?? curr.rain ?? 0);
    const cloudPct = Math.round(Number(curr.cloud_cover ?? 65));
    const dbz = calculateDbzFromRainRate(rainMm);

    const meter: LiveWeatherMeter = {
      locationName: locationName || 'Regional Monitoring Point',
      lat,
      lng,
      temperature: Math.round((Number(curr.temperature_2m) || 24.5) * 10) / 10,
      humidity: Math.round(Number(curr.relative_humidity_2m) || 82),
      precipitation: rainMm,
      rain: Number(curr.rain ?? rainMm),
      cloudCover: cloudPct,
      windSpeed: Math.round((Number(curr.wind_speed_10m) || 6.2) * 10) / 10,
      weatherCode: Number(curr.weather_code ?? 3),
      weatherDescription: getWMODescription(Number(curr.weather_code ?? 3)),
      rainIntensityLevel: classifyRainMeter(rainMm),
      dbzEquivalent: dbz,
      cloudCategory: classifyCloudMeter(cloudPct),
      timestampIST: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
    };

    weatherCache.set(cacheKey, { data: meter, time: now });
    return meter;
  } catch (err) {
    console.warn('Open-Meteo direct fetch error, generating meteorological estimation:', err);
    // Baseline meteorological estimation for NER monsoon climate
    const defaultMeter: LiveWeatherMeter = {
      locationName: locationName || 'NER Regional Station',
      lat,
      lng,
      temperature: 24.2,
      humidity: 88,
      precipitation: 4.8,
      rain: 4.8,
      cloudCover: 85,
      windSpeed: 8.5,
      weatherCode: 63,
      weatherDescription: 'Moderate Monsoon Rain',
      rainIntensityLevel: 'Moderate Rain',
      dbzEquivalent: 36,
      cloudCategory: 'Dense Overcast',
      timestampIST: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST'
    };
    return defaultMeter;
  }
}
