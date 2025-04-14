
/**
 * Green Drive - Route Calculation Formulas
 * 
 * This utility file contains all formulas used for calculating energy usage,
 * eco scores, CO2 savings, and other metrics for electric vehicle routing.
 */

// ========== ENERGY USAGE CALCULATION ==========

/**
 * Calculate the energy usage for a route
 * Formula: Energy (kWh) = (Base Consumption × Distance) + Elevation Factor + Traffic Factor + Weather Factor
 *
 * @param distance - Distance in kilometers
 * @param elevationGain - Elevation gain in meters
 * @param trafficDelay - Traffic delay in minutes
 * @param weather - Weather conditions data
 * @param routeType - Type of route (eco, fast, balanced)
 * @returns Energy usage in kWh
 */
export const calculateEnergyUsage = (
  distance: number,
  elevationGain: number,
  trafficDelay: number,
  weather: any,
  routeType: 'eco' | 'fast' | 'balanced'
): number => {
  // 1. Base consumption rates in kWh per km (average for modern EVs in India)
  // Based on real-world efficiency of popular EVs in India
  const baseConsumptionRates = {
    eco: 0.14, // Most efficient driving style (gentle acceleration, lower speeds)
    balanced: 0.16, // Normal driving style
    fast: 0.19, // Aggressive driving style (rapid acceleration, higher speeds)
  };

  // 2. Elevation impact
  // Formula: Additional energy = 0.002 kWh per meter of elevation gain per km
  const elevationFactor = (elevationGain / 100) * distance * 0.002;

  // 3. Traffic impact
  // Each minute of delay increases consumption by 0.03 kWh per km (due to stop-and-go)
  const trafficFactor = (trafficDelay / 10) * distance * 0.03;

  // 4. Weather impact
  // Temperature affects battery efficiency (optimal range is 20-25°C)
  let weatherFactor = 0;
  
  if (weather) {
    // Temperature effects (non-linear relationship)
    const tempDeviation = Math.abs(weather.temperature - 22.5); // Deviation from optimal (22.5°C)
    weatherFactor += (tempDeviation / 10) * distance * 0.01;
    
    // Wind and precipitation effects
    weatherFactor += (weather.windSpeed / 20) * distance * 0.005;
    weatherFactor += (weather.precipitation * 2) * distance * 0.01;
  }

  // Calculate total energy usage
  const baseConsumption = baseConsumptionRates[routeType] * distance;
  const totalEnergy = baseConsumption + elevationFactor + trafficFactor + weatherFactor;
  
  // Round to 2 decimal places
  return Math.round(totalEnergy * 100) / 100;
};

// ========== ECO SCORE CALCULATION ==========

/**
 * Calculate eco-score for a route
 * Formula: Weighted score based on energy efficiency, distance optimization, elevation, and traffic
 * 
 * @param energyUsage - Energy usage in kWh
 * @param distance - Distance in kilometers
 * @param elevationGain - Elevation gain in meters
 * @param trafficDelay - Traffic delay in minutes
 * @returns Eco-score from 0-100 (higher is better)
 */
export const calculateEcoScore = (
  energyUsage: number,
  distance: number,
  elevationGain: number,
  trafficDelay: number
): number => {
  // Energy efficiency score (50% weight)
  // Lower kWh/km is better, typical range 0.12-0.25 kWh/km
  const efficiencyRatio = energyUsage / distance;
  const efficiencyScore = Math.max(0, 50 * (1 - ((efficiencyRatio - 0.12) / 0.13)));
  
  // Route optimization score (20% weight)
  // Based on how direct the route is compared to straight-line distance
  // We estimate this using elevation and traffic as proxies
  const optimizationScore = 20 * (1 - ((elevationGain / 500) * 0.3 + (trafficDelay / 30) * 0.7));
  
  // Terrain compatibility score (15% weight)
  // Lower elevation gain is better for EVs
  const terrainScore = 15 * (1 - Math.min(1, elevationGain / 800));
  
  // Traffic efficiency score (15% weight)
  // Less traffic delay is better
  const trafficScore = 15 * (1 - Math.min(1, trafficDelay / 30));
  
  // Calculate total score and ensure it's in the 0-100 range
  let finalScore = efficiencyScore + optimizationScore + terrainScore + trafficScore;
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  return Math.round(finalScore);
};

// ========== CO2 SAVINGS CALCULATION ==========

/**
 * Calculate CO2 savings compared to equivalent gasoline/diesel vehicle
 * Formula: CO2 saved = Distance × (ICE emissions - EV emissions)
 * 
 * @param distance - Distance in kilometers
 * @returns CO2 savings in kg
 */
export const calculateCO2Savings = (distance: number): number => {
  // Average CO2 emissions for gasoline cars in India: 150-180 g/km
  const gasolineEmissions = 0.170; // kg CO2 per km
  
  // Average CO2 emissions for EV in India (based on grid mix): 80-110 g/km
  // India's electricity grid has high coal dependency, so EV emissions are higher than in countries with cleaner grids
  const evEmissions = 0.095; // kg CO2 per km
  
  // Calculate CO2 saved
  const co2Saved = (gasolineEmissions - evEmissions) * distance;
  
  return Math.round(co2Saved * 100) / 100;
};

// ========== CHARGING STOPS CALCULATION ==========

/**
 * Calculate number of charging stops needed for a route
 * 
 * @param distance - Distance in kilometers
 * @param vehicleRange - Vehicle range in kilometers
 * @returns Number of charging stops required
 */
export const calculateChargingStops = (distance: number, vehicleRange: number): number => {
  // If distance is less than 80% of vehicle range, no charging stop needed
  // 80% buffer for safety and to account for real-world range being less than rated
  if (distance <= vehicleRange * 0.8) {
    return 0;
  }
  
  // Calculate stops needed, assuming charging to 80% each time
  // We subtract the initial range, then divide remaining distance by usable range per charge
  const effectiveRangePerCharge = vehicleRange * 0.7; // Assuming charging to 80% and keeping 10% buffer
  const remainingDistance = distance - (vehicleRange * 0.8);
  
  return Math.ceil(remainingDistance / effectiveRangePerCharge);
};

// ========== COST CALCULATIONS ==========

/**
 * Calculate charging cost for a route
 * 
 * @param energyUsage - Energy usage in kWh
 * @param electricityRate - Electricity rate in ₹/kWh
 * @returns Cost in ₹
 */
export const calculateChargingCost = (energyUsage: number, electricityRate: number = 8): number => {
  return Math.round(energyUsage * electricityRate);
};

/**
 * Calculate cost savings compared to gasoline/diesel vehicle
 * 
 * @param distance - Distance in kilometers
 * @param fuelPrice - Fuel price in ₹/liter
 * @param fuelEfficiency - Fuel efficiency in km/liter
 * @param energyUsage - Energy usage in kWh
 * @param electricityRate - Electricity rate in ₹/kWh
 * @returns Cost savings in ₹
 */
export const calculateCostSavings = (
  distance: number,
  fuelPrice: number = 102, // Average fuel price in India (₹/liter)
  fuelEfficiency: number = 12, // Average fuel efficiency in km/liter
  energyUsage: number,
  electricityRate: number = 8 // Average electricity rate in India (₹/kWh)
): number => {
  // Cost of using gasoline/diesel vehicle
  const fuelCost = (distance / fuelEfficiency) * fuelPrice;
  
  // Cost of using EV
  const electricityCost = energyUsage * electricityRate;
  
  // Calculate savings
  const savings = fuelCost - electricityCost;
  
  return Math.round(savings);
};

// ========== BATTERY RANGE CALCULATIONS ==========

/**
 * Calculate remaining driving range based on current battery level
 * 
 * @param batteryPercentage - Current battery percentage (0-100)
 * @param fullRangeKm - Full charge range in kilometers
 * @returns Remaining range in kilometers
 */
export const calculateRemainingRange = (batteryPercentage: number, fullRangeKm: number): number => {
  // Apply a non-linear formula since battery consumption isn't perfectly linear
  // Lower battery percentage yields slightly less range proportionally
  const adjustedPercentage = Math.pow(batteryPercentage / 100, 1.05);
  return Math.round(adjustedPercentage * fullRangeKm);
};

/**
 * Calculate charging time estimate
 * 
 * @param currentBattery - Current battery percentage (0-100)
 * @param targetBattery - Target battery percentage (0-100)
 * @param chargerPower - Charger power in kW
 * @param batteryCapacity - Battery capacity in kWh
 * @returns Charging time in minutes
 */
export const calculateChargingTime = (
  currentBattery: number,
  targetBattery: number,
  chargerPower: number,
  batteryCapacity: number
): number => {
  // Different charging speeds at different battery levels
  // Charging slows down significantly above 80%
  const batteryToCharge = targetBattery - currentBattery;
  
  if (batteryToCharge <= 0) {
    return 0;
  }
  
  let chargingTime = 0;
  
  // Calculate time to reach 80% if target is above 80%
  if (currentBattery < 80 && targetBattery > 80) {
    // Time to reach 80% from current
    const timeToEighty = ((80 - currentBattery) / 100) * batteryCapacity / chargerPower * 60;
    // Time to reach target from 80%
    const timeAboveEighty = ((targetBattery - 80) / 100) * batteryCapacity / (chargerPower * 0.5) * 60;
    chargingTime = timeToEighty + timeAboveEighty;
  } 
  // If all charging is above 80%, it's slower
  else if (currentBattery >= 80) {
    chargingTime = (batteryToCharge / 100) * batteryCapacity / (chargerPower * 0.5) * 60;
  } 
  // If all charging is below 80%, it's faster
  else {
    chargingTime = (batteryToCharge / 100) * batteryCapacity / chargerPower * 60;
  }
  
  return Math.round(chargingTime);
};
