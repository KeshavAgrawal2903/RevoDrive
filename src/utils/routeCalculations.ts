
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
  // Base efficiency score (lower energy usage per km is better)
  const efficiencyKWhPerKm = energyUsage / distance;
  const efficiencyScore = Math.max(0, 100 - (efficiencyKWhPerKm * 250));
  
  // Elevation penalty (high elevation changes reduce score)
  const elevationPenalty = Math.min(15, elevationGain / 100);
  
  // Traffic penalty (more traffic reduces score)
  const trafficPenalty = Math.min(10, trafficDelay);
  
  // Final score calculation
  let score = efficiencyScore - elevationPenalty - trafficPenalty;
  
  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
};

/**
 * Calculate number of charging stops needed based on distance and vehicle range
 */
export const calculateChargingStops = (
  distance: number, 
  vehicleRange: number, 
  safetyBuffer: number = 0.2 // 20% safety buffer
): number => {
  // If distance is within vehicle range with safety buffer, no stops needed
  const effectiveRange = vehicleRange * (1 - safetyBuffer);
  
  if (distance <= effectiveRange) {
    return 0;
  }
  
  // Calculate number of stops needed
  // Formula: stops = ceil(distance / effectiveRange) - 1
  // Subtract 1 because we don't count the final destination as a charging stop
  return Math.ceil(distance / effectiveRange) - 1;
};

/**
 * Get route color based on route type
 */
export const getRouteColor = (routeType: string): string => {
  return CONSTANTS.ROUTE_COLORS[routeType as keyof typeof CONSTANTS.ROUTE_COLORS] || '#3b82f6';
};

/**
 * Calculate cost savings compared to a petrol vehicle
 * 
 * @param distance Distance in km
 * @param electricityRatePerKWh Electricity rate in rupees per kWh (default: ₹8)
 * @param petrolRatePerLiter Petrol rate in rupees per liter (default: ₹95)
 * @param petrolEfficiency Average petrol car efficiency in km per liter (default: 12)
 * @param evEfficiency EV efficiency in km per kWh (default: 6)
 * @returns Savings in rupees
 */
export const calculateCostSavings = (
  distance: number,
  electricityRatePerKWh = 8,
  petrolRatePerLiter = 95,
  petrolEfficiency = 12,
  evEfficiency = 6
): number => {
  // Cost for petrol vehicle = (distance / km per liter) * rate per liter
  const petrolCost = (distance / petrolEfficiency) * petrolRatePerLiter;
  
  // Cost for electric vehicle = (distance / km per kWh) * rate per kWh
  const electricityCost = (distance / evEfficiency) * electricityRatePerKWh;
  
  // Savings = petrol cost - electricity cost
  const savings = petrolCost - electricityCost;
  
  return Math.round(savings);
};

/**
 * Calculate energy usage based on various factors
 * More detailed calculation for energy prediction component
 */
export const calculateDetailedEnergyUsage = (
  distance: number,
  elevationGain: number,
  trafficDelay: number,
  vehicle: VehicleData,
  weather: WeatherData,
  routeType: 'eco' | 'fast' | 'balanced' = 'balanced'
) => {
  // Base calculation
  let energyUsage = calculateEnergyUsage(distance, elevationGain, trafficDelay, weather, routeType);
  
  // Calculate individual components for detailed breakdown
  const baseEnergy = distance * vehicle.efficiency / 100; // kWh for basic movement
  const elevationEnergy = elevationGain * CONSTANTS.ELEVATION_FACTOR; // kWh for climbing
  const trafficEnergy = trafficDelay * CONSTANTS.TRAFFIC_IMPACT; // kWh for traffic
  
  // Weather factors
  let weatherMultiplier = 1;
  if (weather.condition.toLowerCase().includes('rain')) {
    weatherMultiplier = CONSTANTS.RAIN_IMPACT;
  } else if (weather.condition.toLowerCase().includes('snow')) {
    weatherMultiplier = CONSTANTS.SNOW_IMPACT;
  }
  
  // Wind impact
  let windMultiplier = 1;
  if (weather.windSpeed > 20) {
    windMultiplier = CONSTANTS.HIGH_WIND_IMPACT;
  } else if (weather.windSpeed > 10) {
    windMultiplier = CONSTANTS.MEDIUM_WIND_IMPACT;
  }
  
  // Temperature impact
  let tempMultiplier = 1;
  if (weather.temperature > 35) {
    tempMultiplier = CONSTANTS.HIGH_TEMP_IMPACT;
  } else if (weather.temperature < 10) {
    tempMultiplier = CONSTANTS.LOW_TEMP_IMPACT;
  }
  
  const weatherEnergy = baseEnergy * (Math.max(weatherMultiplier, windMultiplier, tempMultiplier) - 1);
  
  // Climate control energy (heating/cooling)
  const climateControlEnergy = (weather.temperature > 30 || weather.temperature < 15) 
    ? distance * 0.01 : 0;
  
  // Return detailed breakdown
  return {
    total: energyUsage,
    base: Math.round(baseEnergy * 10) / 10,
    elevation: Math.round(elevationEnergy * 10) / 10,
    traffic: Math.round(trafficEnergy * 10) / 10,
    weather: Math.round(weatherEnergy * 10) / 10,
    climateControl: Math.round(climateControlEnergy * 10) / 10,
  };
};

/**
 * Calculate range remaining after a trip
 */
export const calculateRangeAfterTrip = (
  currentRange: number,
  energyUsage: number,
  batteryCapacity: number,
  efficiency: number
): number => {
  // Convert current range to battery percentage
  const currentBatteryPercentage = (currentRange * efficiency) / batteryCapacity;
  
  // Energy used as a percentage of total capacity
  const energyPercentageUsed = energyUsage / batteryCapacity;
  
  // Remaining battery percentage
  const remainingPercentage = Math.max(0, currentBatteryPercentage - energyPercentageUsed);
  
  // Convert back to range
  const remainingRange = (remainingPercentage * batteryCapacity) / efficiency;
  
  return Math.round(remainingRange);
};
