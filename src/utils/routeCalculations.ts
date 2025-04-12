
/**
 * EcoRoute Calculation Utility
 * Contains formulas and algorithms for energy prediction, route optimization, and eco-scoring
 */

import { WeatherData, VehicleData } from '@/hooks/useMapData';

// Constants for energy calculations
const CONSTANTS = {
  // Efficiency factors
  BASE_EFFICIENCY: 0.15, // kWh per km (baseline)
  FAST_ROUTE_EFFICIENCY: 0.18, // kWh per km (fast route)
  BALANCED_ROUTE_EFFICIENCY: 0.16, // kWh per km (balanced route)
  
  // Weather impact factors
  RAIN_IMPACT: 1.15, // 15% increase in energy consumption
  SNOW_IMPACT: 1.25, // 25% increase in energy consumption
  HIGH_WIND_IMPACT: 1.2, // 20% increase in energy consumption
  MEDIUM_WIND_IMPACT: 1.1, // 10% increase in energy consumption
  
  // Elevation impact factors (per meter of elevation)
  ELEVATION_FACTOR: 0.002, // kWh per meter of elevation gain
  
  // Traffic impact
  TRAFFIC_IMPACT: 0.05, // kWh per minute of traffic delay
  
  // Carbon savings (compared to gasoline vehicle)
  // Average gasoline car: ~120g CO2 per km
  // EV in India: ~85g CO2 per km (considering India's energy mix)
  CO2_SAVINGS: 0.035, // kg CO2 saved per km
  
  // Temperature impact
  HIGH_TEMP_IMPACT: 1.12, // 12% increase when > 35°C (AC usage)
  LOW_TEMP_IMPACT: 1.15, // 15% increase when < 10°C (heating usage)
  
  // Route colors for visualization
  ROUTE_COLORS: {
    'eco-route': '#10b981', // green for eco route
    'fast-route': '#ef4444', // red for fast route
    'balanced-route': '#8b5cf6', // purple for balanced route
  }
};

/**
 * Calculate energy usage for a route based on distance, elevation, traffic and weather
 * Uses physics-based formulas for more accurate predictions
 */
export const calculateEnergyUsage = (
  distance: number, // in km
  elevationGain: number, // in meters
  trafficDelay: number, // in minutes
  weather: WeatherData,
  routeType: 'eco' | 'fast' | 'balanced' = 'balanced'
): number => {
  // Base energy consumption based on route type
  let baseEfficiency;
  switch (routeType) {
    case 'eco':
      baseEfficiency = CONSTANTS.BASE_EFFICIENCY;
      break;
    case 'fast':
      baseEfficiency = CONSTANTS.FAST_ROUTE_EFFICIENCY;
      break;
    case 'balanced':
    default:
      baseEfficiency = CONSTANTS.BALANCED_ROUTE_EFFICIENCY;
      break;
  }
  
  let energyUsage = distance * baseEfficiency;
  
  // Add elevation impact (potential energy = mass * g * height)
  // Simplified as a direct factor of elevation gain
  energyUsage += elevationGain * CONSTANTS.ELEVATION_FACTOR;
  
  // Add traffic impact (more energy used in stop-and-go traffic)
  energyUsage += trafficDelay * CONSTANTS.TRAFFIC_IMPACT;
  
  // Apply weather impact multipliers
  if (weather.condition.toLowerCase().includes('rain')) {
    energyUsage *= CONSTANTS.RAIN_IMPACT;
  } else if (weather.condition.toLowerCase().includes('snow')) {
    energyUsage *= CONSTANTS.SNOW_IMPACT;
  }
  
  // Apply wind impact
  if (weather.windSpeed > 20) {
    energyUsage *= CONSTANTS.HIGH_WIND_IMPACT;
  } else if (weather.windSpeed > 10) {
    energyUsage *= CONSTANTS.MEDIUM_WIND_IMPACT;
  }
  
  // Apply temperature impact
  if (weather.temperature > 35) {
    energyUsage *= CONSTANTS.HIGH_TEMP_IMPACT;
  } else if (weather.temperature < 10) {
    energyUsage *= CONSTANTS.LOW_TEMP_IMPACT;
  }
  
  // Round to one decimal place
  return Math.round(energyUsage * 10) / 10;
};

/**
 * Calculate CO2 savings compared to a gasoline vehicle
 */
export const calculateCO2Savings = (distance: number): number => {
  const savings = distance * CONSTANTS.CO2_SAVINGS;
  return Math.round(savings * 10) / 10; // Round to one decimal place
};

/**
 * Calculate eco-score (0-100) based on energy efficiency, speed, and route characteristics
 */
export const calculateEcoScore = (
  energyUsage: number,
  distance: number,
  elevationGain: number,
  trafficDelay: number
): number => {
  // Base score from energy efficiency (lower is better)
  const efficiencyScore = Math.max(0, 100 - (energyUsage / distance) * 100);
  
  // Penalty for excessive elevation (more elevation = more energy)
  const elevationFactor = Math.min(1, elevationGain / 500); // Normalize to 0-1
  const elevationPenalty = elevationFactor * 15; // Up to 15 points penalty
  
  // Penalty for traffic (more traffic = more energy waste)
  const trafficFactor = Math.min(1, trafficDelay / 30); // Normalize to 0-1
  const trafficPenalty = trafficFactor * 20; // Up to 20 points penalty
  
  // Calculate final score and ensure it's within 0-100 range
  const rawScore = efficiencyScore - elevationPenalty - trafficPenalty;
  const finalScore = Math.min(100, Math.max(0, rawScore));
  
  return Math.round(finalScore);
};

/**
 * Calculate arrival battery level based on current battery and route energy usage
 */
export const calculateArrivalBattery = (
  currentBatteryPercentage: number,
  maxBatteryCapacity: number,
  routeEnergyUsage: number
): number => {
  const currentEnergy = (currentBatteryPercentage / 100) * maxBatteryCapacity;
  const remainingEnergy = currentEnergy - routeEnergyUsage;
  const arrivalPercentage = (remainingEnergy / maxBatteryCapacity) * 100;
  
  return Math.max(0, Math.round(arrivalPercentage));
};

/**
 * Calculate number of charging stops needed based on route and vehicle
 */
export const calculateChargingStops = (
  distance: number,
  vehicleRange: number
): number => {
  if (distance <= vehicleRange) {
    return 0;
  }
  
  // Assume we start with full range and need to charge when below 20%
  const effectiveRange = vehicleRange * 0.8; // 80% of range before needing a charge
  const stops = Math.ceil(distance / effectiveRange) - 1;
  
  return Math.max(0, stops);
};

/**
 * Get color for route visualization based on route type
 */
export const getRouteColor = (routeType: string): string => {
  // @ts-ignore
  return CONSTANTS.ROUTE_COLORS[routeType] || '#3b82f6'; // Default to blue
};

/**
 * Calculate estimated cost savings compared to a gasoline vehicle
 */
export const calculateCostSavings = (
  distance: number,
  electricityRate: number = 8, // INR per kWh (average in India)
  fuelPrice: number = 100, // INR per liter (average petrol price in India)
  fuelEfficiency: number = 15 // km per liter (average car in India)
): number => {
  // Cost for EV (Rs per km)
  const evCostPerKm = (CONSTANTS.BASE_EFFICIENCY * electricityRate);
  
  // Cost for gasoline vehicle (Rs per km)
  const gasCostPerKm = fuelPrice / fuelEfficiency;
  
  // Savings per km
  const savingsPerKm = gasCostPerKm - evCostPerKm;
  
  // Total savings
  const totalSavings = savingsPerKm * distance;
  
  return Math.round(totalSavings);
};

/**
 * Calculate monthly cost savings based on average daily travel
 */
export const calculateMonthlySavings = (
  averageDailyDistance: number = 40, // Average daily distance in km
  electricityRate: number = 8, // INR per kWh
  fuelPrice: number = 100 // INR per liter
): number => {
  const monthlySavings = calculateCostSavings(averageDailyDistance * 30, electricityRate, fuelPrice);
  return monthlySavings;
};

/**
 * Calculate lifetime savings of an EV compared to gasoline vehicle
 */
export const calculateLifetimeSavings = (
  yearlyDistance: number = 15000, // km per year
  vehicleLifetime: number = 8, // years
  electricityRate: number = 8, // INR per kWh
  fuelPrice: number = 100 // INR per liter
): number => {
  const lifetimeSavings = calculateCostSavings(yearlyDistance * vehicleLifetime, electricityRate, fuelPrice);
  return lifetimeSavings;
};
