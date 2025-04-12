
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  TrendingUp, 
  Battery, 
  Leaf, 
  Cloud, 
  Droplets,
  AlertTriangle,
  Navigation,
  Zap,
  MapPin,
  Settings
} from 'lucide-react';
import { RouteOption, VehicleData, WeatherData } from '@/hooks/useMapData';

interface DashboardProps {
  selectedRoute: RouteOption | null;
  vehicle: VehicleData;
  weather: WeatherData;
  onAction?: (action: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedRoute,
  vehicle,
  weather,
  onAction
}) => {
  // Calculate eco score
  const ecoScore = selectedRoute?.ecoScore || 0;
  
  // Determine eco status based on score
  const getEcoStatus = () => {
    if (ecoScore >= 85) return { label: 'Excellent', color: 'text-energy-low' };
    if (ecoScore >= 70) return { label: 'Good', color: 'text-energy-medium' };
    return { label: 'Needs Improvement', color: 'text-energy-high' };
  };
  
  const ecoStatus = getEcoStatus();
  
  // Calculate metrics using formulas
  const energyEfficiency = selectedRoute 
    ? (selectedRoute.distance / selectedRoute.energyUsage).toFixed(1) 
    : '0.0';
  
  const batteryUsage = selectedRoute
    ? Math.min(100, Math.round((selectedRoute.energyUsage / vehicle.maxBatteryCapacity) * 100))
    : 0;
  
  const weatherImpact = weather.condition.toLowerCase().includes('rain') || 
                       weather.condition.toLowerCase().includes('snow') ||
                       weather.windSpeed > 20
    ? 'High'
    : weather.windSpeed > 10 || weather.condition.toLowerCase().includes('cloud')
    ? 'Medium'
    : 'Low';
  
  const getWeatherImpactColor = () => {
    if (weatherImpact === 'Low') return 'text-energy-low';
    if (weatherImpact === 'Medium') return 'text-energy-medium';
    return 'text-energy-high';
  };

  const handleActionClick = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <Award className="h-8 w-8 text-eco mb-2" />
            <h3 className="text-sm font-medium">Eco Score</h3>
            <div className={`text-2xl font-bold mt-1 ${ecoStatus.color}`}>
              {ecoScore}
            </div>
            <p className={`text-xs mt-1 ${ecoStatus.color}`}>{ecoStatus.label}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <TrendingUp className="h-8 w-8 text-tech mb-2" />
            <h3 className="text-sm font-medium">Energy Efficiency</h3>
            <div className="text-2xl font-bold mt-1">
              {energyEfficiency}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">km/kWh</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <Battery className="h-8 w-8 text-energy-medium mb-2" />
            <h3 className="text-sm font-medium">Battery Usage</h3>
            <div className="text-2xl font-bold mt-1">
              {batteryUsage}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">of total capacity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <Cloud className="h-8 w-8 text-tech-light mb-2" />
            <h3 className="text-sm font-medium">Weather Impact</h3>
            <div className={`text-2xl font-bold mt-1 ${getWeatherImpactColor()}`}>
              {weatherImpact}
            </div>
            <p className="text-xs mt-1 text-muted-foreground flex items-center justify-center">
              {weather.temperature}°C, {weather.windSpeed} km/h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard action buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-1 bg-eco/10 hover:bg-eco/20"
          onClick={() => handleActionClick('navigate')}
        >
          <Navigation className="h-4 w-4" />
          <span>Navigate</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-1 bg-energy-medium/10 hover:bg-energy-medium/20"
          onClick={() => handleActionClick('recharge')}
        >
          <Zap className="h-4 w-4" />
          <span>Recharge</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-1 bg-tech/10 hover:bg-tech/20"
          onClick={() => handleActionClick('findCharging')}
        >
          <MapPin className="h-4 w-4" />
          <span>Find Charging</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-1 bg-gray-200/50 hover:bg-gray-200"
          onClick={() => handleActionClick('settings')}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </div>

      {/* Range warning if battery is low */}
      {vehicle.batteryLevel < 20 && (
        <div className="flex items-center gap-2 text-sm text-energy-high p-2 bg-energy-high/10 rounded-md mb-4">
          <AlertTriangle className="h-4 w-4" />
          <span>Low battery! Find a charging station soon.</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
