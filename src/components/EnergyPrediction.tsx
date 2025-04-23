
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Battery, 
  BatteryCharging, 
  CloudSun, 
  Wind, 
  Droplets,
  BarChart3,
  ArrowUpRight,
  LineChart
} from 'lucide-react';
import { RouteOption, VehicleData, WeatherData } from '@/hooks/useMapData';
import { determineChargingNeedFuzzy } from '@/utils/fuzzyLogic';

interface EnergyPredictionProps {
  selectedRoute: RouteOption | null;
  vehicle: VehicleData;
  weather: WeatherData;
}

const EnergyPrediction: React.FC<EnergyPredictionProps> = ({
  selectedRoute,
  vehicle,
  weather
}) => {
  if (!selectedRoute) return null;
  
  // Calculate predicted arrival battery using physics-based formula with fuzzy logic
  const estimatedEnergyUsage = selectedRoute.energyUsage;
  const currentEnergyAvailable = (vehicle.batteryLevel / 100) * vehicle.maxBatteryCapacity;
  const remainingEnergy = currentEnergyAvailable - estimatedEnergyUsage;
  const arrivalBatteryPercentage = Math.max(0, Math.round((remainingEnergy / vehicle.maxBatteryCapacity) * 100));
  
  // Use fuzzy logic to determine if charging is needed
  const chargingInfo = determineChargingNeedFuzzy(
    vehicle.batteryLevel,
    selectedRoute.distance,
    estimatedEnergyUsage / vehicle.maxBatteryCapacity * 100,
    weather.condition
  );
  const chargingNeeded = chargingInfo.needed;
  const chargingConfidence = chargingInfo.confidence;
  
  // Energy usage breakdown based on physics formulas and real-world factors
  // Elevation: energy = mass * g * height (potential energy)
  // Weather: increased resistance from wind, rain
  // Traffic: additional stop-and-go energy waste
  // Distance: base energy consumption per km
  
  // Impact factors for each component based on route conditions
  const calculateElevationImpact = () => {
    const elevationFactor = selectedRoute.elevationGain > 100 ? 0.32 : 
                           selectedRoute.elevationGain > 50 ? 0.22 : 0.15;
    return Math.round(elevationFactor * 100);
  };
  
  const calculateTrafficImpact = () => {
    const trafficFactor = selectedRoute.trafficDelay > 5 ? 0.28 : 
                         selectedRoute.trafficDelay > 2 ? 0.18 : 0.10;
    return Math.round(trafficFactor * 100);
  };
  
  const calculateWeatherImpact = () => {
    const weatherFactor = weather.windSpeed > 20 ? 0.25 : 
                         weather.windSpeed > 10 ? 0.15 : 0.08;
    return Math.round(weatherFactor * 100);
  };
  
  const breakdownData = {
    elevation: calculateElevationImpact(),
    traffic: calculateTrafficImpact(),
    weather: calculateWeatherImpact(),
    // The remainder is base distance energy consumption
    distance: 100 - calculateElevationImpact() - calculateTrafficImpact() - calculateWeatherImpact()
  };
  
  // Battery status color based on arrival level
  const getBatteryColor = () => {
    if (arrivalBatteryPercentage > 50) return 'text-energy-low';
    if (arrivalBatteryPercentage > 20) return 'text-energy-medium';
    return 'text-energy-high';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Battery className="mr-2 h-5 w-5 text-eco" />
          Energy Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Current Battery</div>
            <div className="flex items-center space-x-2">
              <Battery className="h-6 w-6 text-eco" />
              <div className="text-2xl font-bold">{vehicle.batteryLevel}%</div>
            </div>
            <Progress value={vehicle.batteryLevel} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Est. Range: {vehicle.range} km
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Arrival Battery</div>
            <div className="flex items-center space-x-2">
              <Battery className={`h-6 w-6 ${getBatteryColor()}`} />
              <div className={`text-2xl font-bold ${getBatteryColor()}`}>
                {arrivalBatteryPercentage}%
              </div>
            </div>
            <Progress value={arrivalBatteryPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground flex items-center">
              {chargingNeeded && (
                <>
                  <BatteryCharging className="h-3.5 w-3.5 mr-1 text-energy-high" />
                  <span className="text-energy-high font-medium">Charging recommended</span>
                </>
              )}
              {!chargingNeeded && (
                <>
                  <span>Est. Remaining Range: {Math.round(arrivalBatteryPercentage * vehicle.range / vehicle.batteryLevel)} km</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Energy Usage Prediction</div>
            <div className="flex items-center space-x-1 text-sm">
              <Droplets className="h-3.5 w-3.5 text-eco" />
              <span>{selectedRoute.co2Saved} kg CO₂ saved</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                  Elevation Impact
                </span>
                <span>{breakdownData.elevation}%</span>
              </div>
              <Progress value={breakdownData.elevation} className="h-1.5" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center">
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  Traffic Conditions
                </span>
                <span>{breakdownData.traffic}%</span>
              </div>
              <Progress value={breakdownData.traffic} className="h-1.5" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center">
                  <CloudSun className="h-3.5 w-3.5 mr-1" />
                  Weather Factors
                </span>
                <span>{breakdownData.weather}%</span>
              </div>
              <Progress value={breakdownData.weather} className="h-1.5" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center">
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  Base Distance
                </span>
                <span>{breakdownData.distance}%</span>
              </div>
              <Progress value={breakdownData.distance} className="h-1.5" />
            </div>
          </div>
        </div>
        
        {/* Weather information */}
        <div className="pt-2 border-t flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <CloudSun className="h-5 w-5 text-tech" />
            <span>
              {weather.temperature}°C, {weather.condition}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span>{weather.humidity}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnergyPrediction;
