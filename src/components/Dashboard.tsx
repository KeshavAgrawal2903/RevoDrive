
import React, { useState } from 'react';
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
  Settings,
  BarChart2,
  Star,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Maximize
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
  const [expanded, setExpanded] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
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

  // Card hover handler
  const handleCardHover = (cardId: string) => {
    setActiveCard(cardId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  // Main actions for the dashboard
  const primaryActions = [
    { name: 'navigate', icon: <Navigation className="h-4 w-4" />, label: 'Navigate', color: 'bg-gradient-to-r from-eco-dark to-eco hover:from-eco hover:to-eco-light text-white' },
    { name: 'recharge', icon: <Zap className="h-4 w-4" />, label: 'Recharge', color: 'bg-gradient-to-r from-energy-medium to-yellow-400 hover:from-yellow-400 hover:to-energy-medium text-white' },
    { name: 'findCharging', icon: <MapPin className="h-4 w-4" />, label: 'Find Charging', color: 'bg-gradient-to-r from-tech-dark to-tech hover:from-tech hover:to-tech-light text-white' },
    { name: 'settings', icon: <Settings className="h-4 w-4" />, label: 'Settings', color: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' }
  ];

  // Secondary actions for the expanded dashboard
  const secondaryActions = [
    { name: 'analytics', icon: <BarChart2 className="h-4 w-4" />, label: 'Analytics', color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white' },
    { name: 'saved', icon: <Star className="h-4 w-4" />, label: 'Saved Routes', color: 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white' },
    { name: 'savings', icon: <IndianRupee className="h-4 w-4" />, label: 'Cost Savings', color: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white' },
    { name: 'compare', icon: <Leaf className="h-4 w-4" />, label: 'Compare Routes', color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' }
  ];
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-xl shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-eco-dark to-eco bg-clip-text text-transparent">
          EcoRoute Dashboard
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-eco hover:text-eco-dark transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="ml-1 text-xs">{expanded ? 'Less' : 'More'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card 
          className={`overflow-hidden transition-all duration-300 ${activeCard === 'eco' ? 'ring-2 ring-eco scale-[1.02]' : 'hover:shadow-md'}`}
          onMouseEnter={() => handleCardHover('eco')}
          onMouseLeave={handleCardLeave}
        >
          <div className="h-1 bg-gradient-to-r from-eco-dark to-eco-light"></div>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <Award className={`h-8 w-8 text-eco mb-2 ${activeCard === 'eco' ? 'animate-pulse' : ''}`} />
            <h3 className="text-sm font-medium">Eco Score</h3>
            <div className={`text-2xl font-bold mt-1 ${ecoStatus.color}`}>
              {ecoScore}
            </div>
            <p className={`text-xs mt-1 ${ecoStatus.color}`}>{ecoStatus.label}</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`overflow-hidden transition-all duration-300 ${activeCard === 'energy' ? 'ring-2 ring-tech scale-[1.02]' : 'hover:shadow-md'}`}
          onMouseEnter={() => handleCardHover('energy')}
          onMouseLeave={handleCardLeave}
        >
          <div className="h-1 bg-gradient-to-r from-tech-dark to-tech-light"></div>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <TrendingUp className={`h-8 w-8 text-tech mb-2 ${activeCard === 'energy' ? 'animate-pulse' : ''}`} />
            <h3 className="text-sm font-medium">Energy Efficiency</h3>
            <div className="text-2xl font-bold mt-1 bg-gradient-to-r from-tech to-tech-light bg-clip-text text-transparent">
              {energyEfficiency}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">km/kWh</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`overflow-hidden transition-all duration-300 ${activeCard === 'battery' ? 'ring-2 ring-energy-medium scale-[1.02]' : 'hover:shadow-md'}`}
          onMouseEnter={() => handleCardHover('battery')}
          onMouseLeave={handleCardLeave}
        >
          <div className="h-1 bg-gradient-to-r from-energy-high via-energy-medium to-energy-low"></div>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <Battery className={`h-8 w-8 text-energy-medium mb-2 ${activeCard === 'battery' ? 'animate-pulse' : ''}`} />
            <h3 className="text-sm font-medium">Battery Usage</h3>
            <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2 mb-2">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${
                  batteryUsage > 80 ? 'bg-energy-high' : 
                  batteryUsage > 50 ? 'bg-energy-medium' : 'bg-energy-low'
                }`}
                style={{ width: `${batteryUsage}%` }}
              ></div>
            </div>
            <div className="text-lg font-bold">
              {batteryUsage}%
            </div>
            <p className="text-xs text-muted-foreground">of total capacity</p>
          </CardContent>
        </Card>
        
        <Card 
          className={`overflow-hidden transition-all duration-300 ${activeCard === 'weather' ? 'ring-2 ring-tech-light scale-[1.02]' : 'hover:shadow-md'}`}
          onMouseEnter={() => handleCardHover('weather')}
          onMouseLeave={handleCardLeave}
        >
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-300"></div>
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <Cloud className={`h-8 w-8 text-tech-light mb-2 ${activeCard === 'weather' ? 'animate-pulse' : ''}`} />
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

      {/* Primary dashboard action buttons with more attractive styling */}
      <div className="flex flex-wrap gap-2 mb-2">
        {primaryActions.map(action => (
          <Button 
            key={action.name}
            className={`flex items-center gap-1 shadow-md transition-all duration-300 ${action.color}`}
            onClick={() => handleActionClick(action.name)}
            disabled={action.name === 'navigate' && !selectedRoute}
          >
            {action.icon}
            <span>{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Secondary dashboard action buttons with expanded view */}
      {expanded && (
        <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
          {secondaryActions.map(action => (
            <Button 
              key={action.name}
              size="sm"
              className={`flex items-center gap-1 shadow-sm transition-all duration-300 ${action.color}`}
              onClick={() => handleActionClick(action.name)}
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Range warning if battery is low */}
      {vehicle.batteryLevel < 20 && (
        <div className="flex items-center gap-2 text-sm text-white p-3 bg-gradient-to-r from-energy-high to-red-500 rounded-md mb-4 animate-pulse shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Low battery! Find a charging station soon.</span>
        </div>
      )}
      
      {/* Selected route summary if a route is selected */}
      {selectedRoute && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-eco-dark">Selected Route</h3>
            <span className="text-xs bg-eco/10 text-eco px-2 py-1 rounded-full">{selectedRoute.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center p-1 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{selectedRoute.distance} km</span>
            </div>
            <div className="flex flex-col items-center p-1 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{selectedRoute.duration} min</span>
            </div>
            <div className="flex flex-col items-center p-1 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-muted-foreground">Energy</span>
              <span className="font-medium">{selectedRoute.energyUsage.toFixed(1)} kWh</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
