
/**
 * Fuzzy Logic System for EV Route Planning
 * 
 * This module implements fuzzy logic to handle uncertainty in energy prediction
 * and route optimization for electric vehicles.
 */

// Define fuzzy sets for input variables
type FuzzySet = {
  name: string;
  membershipFunction: (value: number) => number;
};

// Fuzzy sets for weather impact
const weatherImpactSets: Record<string, FuzzySet> = {
  low: {
    name: 'low',
    membershipFunction: (temp: number) => {
      if (temp >= 15 && temp <= 25) return 1;
      if (temp > 25 && temp < 30) return (30 - temp) / 5;
      if (temp > 10 && temp < 15) return (temp - 10) / 5;
      return 0;
    }
  },
  medium: {
    name: 'medium',
    membershipFunction: (temp: number) => {
      if (temp >= 30 && temp <= 33) return 1;
      if (temp > 25 && temp < 30) return (temp - 25) / 5;
      if (temp > 33 && temp < 38) return (38 - temp) / 5;
      return 0;
    }
  },
  high: {
    name: 'high',
    membershipFunction: (temp: number) => {
      if (temp >= 38) return 1;
      if (temp > 33 && temp < 38) return (temp - 33) / 5;
      return 0;
    }
  }
};

// Fuzzy sets for wind impact
const windImpactSets: Record<string, FuzzySet> = {
  low: {
    name: 'low',
    membershipFunction: (speed: number) => {
      if (speed <= 5) return 1;
      if (speed > 5 && speed < 10) return (10 - speed) / 5;
      return 0;
    }
  },
  medium: {
    name: 'medium',
    membershipFunction: (speed: number) => {
      if (speed >= 10 && speed <= 15) return 1;
      if (speed > 5 && speed < 10) return (speed - 5) / 5;
      if (speed > 15 && speed < 20) return (20 - speed) / 5;
      return 0;
    }
  },
  high: {
    name: 'high',
    membershipFunction: (speed: number) => {
      if (speed >= 20) return 1;
      if (speed > 15 && speed < 20) return (speed - 15) / 5;
      return 0;
    }
  }
};

// Fuzzy sets for traffic impact
const trafficImpactSets: Record<string, FuzzySet> = {
  low: {
    name: 'low',
    membershipFunction: (delay: number) => {
      if (delay <= 2) return 1;
      if (delay > 2 && delay < 5) return (5 - delay) / 3;
      return 0;
    }
  },
  medium: {
    name: 'medium',
    membershipFunction: (delay: number) => {
      if (delay >= 5 && delay <= 8) return 1;
      if (delay > 2 && delay < 5) return (delay - 2) / 3;
      if (delay > 8 && delay < 12) return (12 - delay) / 4;
      return 0;
    }
  },
  high: {
    name: 'high',
    membershipFunction: (delay: number) => {
      if (delay >= 12) return 1;
      if (delay > 8 && delay < 12) return (delay - 8) / 4;
      return 0;
    }
  }
};

// Fuzzy sets for elevation impact
const elevationImpactSets: Record<string, FuzzySet> = {
  low: {
    name: 'low',
    membershipFunction: (gain: number) => {
      if (gain <= 50) return 1;
      if (gain > 50 && gain < 100) return (100 - gain) / 50;
      return 0;
    }
  },
  medium: {
    name: 'medium',
    membershipFunction: (gain: number) => {
      if (gain >= 100 && gain <= 150) return 1;
      if (gain > 50 && gain < 100) return (gain - 50) / 50;
      if (gain > 150 && gain < 200) return (200 - gain) / 50;
      return 0;
    }
  },
  high: {
    name: 'high',
    membershipFunction: (gain: number) => {
      if (gain >= 200) return 1;
      if (gain > 150 && gain < 200) return (gain - 150) / 50;
      return 0;
    }
  }
};

// Fuzzy output sets for energy consumption multiplier
const energyConsumptionMultipliers = {
  low: 1.0,
  medium_low: 1.1,
  medium: 1.2,
  medium_high: 1.3,
  high: 1.4,
  very_high: 1.5
};

/**
 * Apply fuzzy rules to evaluate the energy consumption multiplier
 * based on environmental conditions
 */
const applyFuzzyRules = (
  weatherMembership: Record<string, number>,
  windMembership: Record<string, number>,
  trafficMembership: Record<string, number>,
  elevationMembership: Record<string, number>
): Record<string, number> => {
  const outputMembership: Record<string, number> = {
    low: 0,
    medium_low: 0,
    medium: 0,
    medium_high: 0,
    high: 0,
    very_high: 0
  };

  // Rule 1: If weather is low AND wind is low AND traffic is low AND elevation is low THEN energy consumption is low
  outputMembership.low = Math.min(
    weatherMembership.low,
    windMembership.low,
    trafficMembership.low,
    elevationMembership.low
  );

  // Rule 2: If weather is medium OR wind is medium THEN energy consumption is medium
  outputMembership.medium = Math.max(
    weatherMembership.medium,
    windMembership.medium
  );

  // Rule 3: If traffic is high OR elevation is high THEN energy consumption is high
  outputMembership.high = Math.max(
    trafficMembership.high,
    elevationMembership.high
  );

  // Rule 4: If weather is high AND wind is high THEN energy consumption is very_high
  outputMembership.very_high = Math.min(
    weatherMembership.high,
    windMembership.high
  );

  // Rule 5: If weather is medium AND elevation is medium THEN energy consumption is medium_high
  outputMembership.medium_high = Math.min(
    weatherMembership.medium,
    elevationMembership.medium
  );
  
  // Rule 6: If wind is low AND traffic is medium THEN energy consumption is medium_low
  outputMembership.medium_low = Math.min(
    windMembership.low,
    trafficMembership.medium
  );

  return outputMembership;
};

/**
 * Defuzzify the output using center of gravity method
 * to get a specific multiplier value
 */
const defuzzify = (outputMembership: Record<string, number>): number => {
  let numerator = 0;
  let denominator = 0;

  for (const key in outputMembership) {
    if (Object.prototype.hasOwnProperty.call(outputMembership, key)) {
      const membershipValue = outputMembership[key];
      const multiplierValue = energyConsumptionMultipliers[key as keyof typeof energyConsumptionMultipliers];
      
      numerator += membershipValue * multiplierValue;
      denominator += membershipValue;
    }
  }

  return denominator > 0 ? numerator / denominator : 1.0;
};

/**
 * Calculate fuzzy energy consumption multiplier based on environmental factors
 */
export const calculateFuzzyEnergyMultiplier = (
  temperature: number,
  windSpeed: number,
  trafficDelay: number,
  elevationGain: number
): number => {
  // Step 1: Fuzzification - Calculate membership in each fuzzy set
  const weatherMembership = {
    low: weatherImpactSets.low.membershipFunction(temperature),
    medium: weatherImpactSets.medium.membershipFunction(temperature),
    high: weatherImpactSets.high.membershipFunction(temperature)
  };

  const windMembership = {
    low: windImpactSets.low.membershipFunction(windSpeed),
    medium: windImpactSets.medium.membershipFunction(windSpeed),
    high: windImpactSets.high.membershipFunction(windSpeed)
  };

  const trafficMembership = {
    low: trafficImpactSets.low.membershipFunction(trafficDelay),
    medium: trafficImpactSets.medium.membershipFunction(trafficDelay),
    high: trafficImpactSets.high.membershipFunction(trafficDelay)
  };

  const elevationMembership = {
    low: elevationImpactSets.low.membershipFunction(elevationGain),
    medium: elevationImpactSets.medium.membershipFunction(elevationGain),
    high: elevationImpactSets.high.membershipFunction(elevationGain)
  };

  // Step 2: Apply fuzzy rules
  const outputMembership = applyFuzzyRules(
    weatherMembership,
    windMembership,
    trafficMembership,
    elevationMembership
  );

  // Step 3: Defuzzification
  return defuzzify(outputMembership);
};

/**
 * Calculate fuzzy eco-score based on multiple factors
 * using a similar approach to energy multiplier
 */
export const calculateFuzzyEcoScore = (
  energyEfficiency: number, // kWh per km
  elevationGain: number,
  trafficDelay: number,
  weatherCondition: string
): number => {
  // Base efficiency score (lower energy usage per km is better)
  let baseScore = Math.max(0, 100 - (energyEfficiency * 250));
  
  // Apply fuzzy multipliers for various factors
  const weatherMultiplier = weatherCondition.toLowerCase().includes('rain') ? 0.85 :
                            weatherCondition.toLowerCase().includes('snow') ? 0.75 : 0.95;
  
  // Calculate elevation impact using fuzzy sets
  const elevationImpact = 
    elevationImpactSets.low.membershipFunction(elevationGain) * 5 +
    elevationImpactSets.medium.membershipFunction(elevationGain) * 10 +
    elevationImpactSets.high.membershipFunction(elevationGain) * 15;
  
  // Calculate traffic impact using fuzzy sets
  const trafficImpact = 
    trafficImpactSets.low.membershipFunction(trafficDelay) * 2 +
    trafficImpactSets.medium.membershipFunction(trafficDelay) * 5 +
    trafficImpactSets.high.membershipFunction(trafficDelay) * 10;
  
  // Apply impacts to base score
  const finalScore = baseScore * weatherMultiplier - elevationImpact - trafficImpact;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(finalScore)));
};

/**
 * Determine if charging is needed based on fuzzy logic
 */
export const determineChargingNeedFuzzy = (
  batteryPercentage: number,
  distanceToDestination: number,
  expectedConsumption: number,
  weather: string
): { needed: boolean; confidence: number } => {
  // Fuzzy sets for battery level
  const batteryMembership = {
    low: batteryPercentage <= 20 ? 1 : 
         batteryPercentage > 20 && batteryPercentage < 40 ? (40 - batteryPercentage) / 20 : 0,
    medium: batteryPercentage >= 40 && batteryPercentage <= 60 ? 1 :
            batteryPercentage > 20 && batteryPercentage < 40 ? (batteryPercentage - 20) / 20 :
            batteryPercentage > 60 && batteryPercentage < 80 ? (80 - batteryPercentage) / 20 : 0,
    high: batteryPercentage >= 80 ? 1 :
          batteryPercentage > 60 && batteryPercentage < 80 ? (batteryPercentage - 60) / 20 : 0
  };

  // Calculate expected battery after trip
  const expectedRemainingBattery = Math.max(0, batteryPercentage - expectedConsumption);
  
  // Additional weather impact
  const weatherImpact = weather.toLowerCase().includes('rain') || weather.toLowerCase().includes('snow') ? 0.2 : 0;
  
  // Determine charging need with fuzzy rules
  const chargingConfidence = 
    expectedRemainingBattery < 10 ? 1.0 :
    expectedRemainingBattery < 20 ? 0.8 + weatherImpact :
    expectedRemainingBattery < 30 ? 0.5 + weatherImpact :
    batteryMembership.low * 0.7;
  
  return {
    needed: chargingConfidence > 0.5,
    confidence: chargingConfidence
  };
};
