
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WeatherData } from '@/hooks/useMapData';

interface FuzzyLogicVisualizationProps {
  temperature: number;
  windSpeed: number;
  trafficDelay: number;
  elevationGain: number;
  weatherCondition: string;
}

const FuzzyLogicVisualization: React.FC<FuzzyLogicVisualizationProps> = ({
  temperature,
  windSpeed,
  trafficDelay,
  elevationGain,
  weatherCondition
}) => {
  // Calculate fuzzy membership degrees
  const calculateWeatherMembership = () => {
    const low = temperature >= 15 && temperature <= 25 
      ? 100 
      : temperature > 25 && temperature < 30 
        ? Math.round((30 - temperature) / 5 * 100) 
        : temperature > 10 && temperature < 15 
          ? Math.round((temperature - 10) / 5 * 100) 
          : 0;
    
    const medium = temperature >= 30 && temperature <= 33 
      ? 100 
      : temperature > 25 && temperature < 30 
        ? Math.round((temperature - 25) / 5 * 100) 
        : temperature > 33 && temperature < 38 
          ? Math.round((38 - temperature) / 5 * 100) 
          : 0;
    
    const high = temperature >= 38 
      ? 100 
      : temperature > 33 && temperature < 38 
        ? Math.round((temperature - 33) / 5 * 100) 
        : 0;
    
    return { low, medium, high };
  };
  
  const calculateWindMembership = () => {
    const low = windSpeed <= 5 
      ? 100 
      : windSpeed > 5 && windSpeed < 10 
        ? Math.round((10 - windSpeed) / 5 * 100) 
        : 0;
    
    const medium = windSpeed >= 10 && windSpeed <= 15 
      ? 100 
      : windSpeed > 5 && windSpeed < 10 
        ? Math.round((windSpeed - 5) / 5 * 100) 
        : windSpeed > 15 && windSpeed < 20 
          ? Math.round((20 - windSpeed) / 5 * 100) 
          : 0;
    
    const high = windSpeed >= 20 
      ? 100 
      : windSpeed > 15 && windSpeed < 20 
        ? Math.round((windSpeed - 15) / 5 * 100) 
        : 0;
    
    return { low, medium, high };
  };
  
  const calculateTrafficMembership = () => {
    const low = trafficDelay <= 2 
      ? 100 
      : trafficDelay > 2 && trafficDelay < 5 
        ? Math.round((5 - trafficDelay) / 3 * 100) 
        : 0;
    
    const medium = trafficDelay >= 5 && trafficDelay <= 8 
      ? 100 
      : trafficDelay > 2 && trafficDelay < 5 
        ? Math.round((trafficDelay - 2) / 3 * 100) 
        : trafficDelay > 8 && trafficDelay < 12 
          ? Math.round((12 - trafficDelay) / 4 * 100) 
          : 0;
    
    const high = trafficDelay >= 12 
      ? 100 
      : trafficDelay > 8 && trafficDelay < 12 
        ? Math.round((trafficDelay - 8) / 4 * 100) 
        : 0;
    
    return { low, medium, high };
  };
  
  const calculateElevationMembership = () => {
    const low = elevationGain <= 50 
      ? 100 
      : elevationGain > 50 && elevationGain < 100 
        ? Math.round((100 - elevationGain) / 50 * 100) 
        : 0;
    
    const medium = elevationGain >= 100 && elevationGain <= 150 
      ? 100 
      : elevationGain > 50 && elevationGain < 100 
        ? Math.round((elevationGain - 50) / 50 * 100) 
        : elevationGain > 150 && elevationGain < 200 
          ? Math.round((200 - elevationGain) / 50 * 100) 
          : 0;
    
    const high = elevationGain >= 200 
      ? 100 
      : elevationGain > 150 && elevationGain < 200 
        ? Math.round((elevationGain - 150) / 50 * 100) 
        : 0;
    
    return { low, medium, high };
  };

  // Get the membership degrees
  const weatherMembership = calculateWeatherMembership();
  const windMembership = calculateWindMembership();
  const trafficMembership = calculateTrafficMembership();
  const elevationMembership = calculateElevationMembership();
  
  // Helper function for getting membership color
  const getMembershipColor = (value: number) => {
    if (value > 70) return 'bg-energy-low';
    if (value > 30) return 'bg-energy-medium';
    return value > 0 ? 'bg-energy-high' : 'bg-gray-200';
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-tech"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Fuzzy Logic Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground mb-2">
          This visualization shows how the fuzzy logic system evaluates various factors to make energy predictions.
        </div>
        
        {/* Temperature fuzzy sets */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Temperature ({temperature}°C)</span>
            <span className="text-xs text-muted-foreground">{weatherCondition}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>{weatherMembership.low}%</span>
              </div>
              <Progress value={weatherMembership.low} className={`h-1.5 ${getMembershipColor(weatherMembership.low)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Medium</span>
                <span>{weatherMembership.medium}%</span>
              </div>
              <Progress value={weatherMembership.medium} className={`h-1.5 ${getMembershipColor(weatherMembership.medium)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>High</span>
                <span>{weatherMembership.high}%</span>
              </div>
              <Progress value={weatherMembership.high} className={`h-1.5 ${getMembershipColor(weatherMembership.high)}`} />
            </div>
          </div>
        </div>
        
        {/* Wind fuzzy sets */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Wind Speed ({windSpeed} km/h)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>{windMembership.low}%</span>
              </div>
              <Progress value={windMembership.low} className={`h-1.5 ${getMembershipColor(windMembership.low)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Medium</span>
                <span>{windMembership.medium}%</span>
              </div>
              <Progress value={windMembership.medium} className={`h-1.5 ${getMembershipColor(windMembership.medium)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>High</span>
                <span>{windMembership.high}%</span>
              </div>
              <Progress value={windMembership.high} className={`h-1.5 ${getMembershipColor(windMembership.high)}`} />
            </div>
          </div>
        </div>
        
        {/* Traffic fuzzy sets */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Traffic Delay ({trafficDelay} min)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>{trafficMembership.low}%</span>
              </div>
              <Progress value={trafficMembership.low} className={`h-1.5 ${getMembershipColor(trafficMembership.low)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Medium</span>
                <span>{trafficMembership.medium}%</span>
              </div>
              <Progress value={trafficMembership.medium} className={`h-1.5 ${getMembershipColor(trafficMembership.medium)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>High</span>
                <span>{trafficMembership.high}%</span>
              </div>
              <Progress value={trafficMembership.high} className={`h-1.5 ${getMembershipColor(trafficMembership.high)}`} />
            </div>
          </div>
        </div>
        
        {/* Elevation fuzzy sets */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Elevation Gain ({elevationGain} m)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Low</span>
                <span>{elevationMembership.low}%</span>
              </div>
              <Progress value={elevationMembership.low} className={`h-1.5 ${getMembershipColor(elevationMembership.low)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Medium</span>
                <span>{elevationMembership.medium}%</span>
              </div>
              <Progress value={elevationMembership.medium} className={`h-1.5 ${getMembershipColor(elevationMembership.medium)}`} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>High</span>
                <span>{elevationMembership.high}%</span>
              </div>
              <Progress value={elevationMembership.high} className={`h-1.5 ${getMembershipColor(elevationMembership.high)}`} />
            </div>
          </div>
        </div>

        {/* Fuzzy Rules Activation */}
        <div className="pt-2 border-t">
          <div className="text-xs font-medium mb-2">Applied Fuzzy Rules:</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {weatherMembership.low > 0 && windMembership.low > 0 && trafficMembership.low > 0 && elevationMembership.low > 0 && (
                <div>• If Weather is low AND Wind is low AND Traffic is low AND Elevation is low THEN energy consumption is low</div>
              )}
              {(weatherMembership.medium > 0 || windMembership.medium > 0) && (
                <div>• If Weather is medium OR Wind is medium THEN energy consumption is medium</div>
              )}
              {(trafficMembership.high > 0 || elevationMembership.high > 0) && (
                <div>• If Traffic is high OR Elevation is high THEN energy consumption is high</div>
              )}
              {weatherMembership.high > 0 && windMembership.high > 0 && (
                <div>• If Weather is high AND Wind is high THEN energy consumption is very high</div>
              )}
              {weatherMembership.medium > 0 && elevationMembership.medium > 0 && (
                <div>• If Weather is medium AND Elevation is medium THEN energy consumption is medium-high</div>
              )}
              {windMembership.low > 0 && trafficMembership.medium > 0 && (
                <div>• If Wind is low AND Traffic is medium THEN energy consumption is medium-low</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuzzyLogicVisualization;
