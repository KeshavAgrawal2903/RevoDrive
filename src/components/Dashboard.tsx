
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Maximize,
  ArrowUpRight,
  PenTool,
  Thermometer,
  Wind,
  Activity
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
  const [animateStats, setAnimateStats] = useState(false);
  
  // Add animation effect when component loads
  useEffect(() => {
    setAnimateStats(true);
    const timer = setTimeout(() => setAnimateStats(false), 1500);
    return () => clearTimeout(timer);
  }, [selectedRoute]);
  
  const ecoScore = selectedRoute?.ecoScore || 0;
  
  const getEcoStatus = () => {
    if (ecoScore >= 85) return { label: 'Excellent', color: 'text-energy-low' };
    if (ecoScore >= 70) return { label: 'Good', color: 'text-energy-medium' };
    return { label: 'Needs Improvement', color: 'text-energy-high' };
  };
  
  const ecoStatus = getEcoStatus();
  
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

  const handleCardHover = (cardId: string) => {
    setActiveCard(cardId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  const primaryActions = [
    { name: 'navigate', icon: <Navigation className="h-4 w-4" />, label: 'Navigate', color: 'revo-glass bg-gradient-to-r from-revo/80 to-revo-dark/80 text-white hover:from-revo hover:to-revo-dark hover:shadow-lg hover:shadow-revo/20 transition-all' },
    { name: 'recharge', icon: <Zap className="h-4 w-4" />, label: 'Recharge', color: 'revo-glass bg-gradient-to-r from-energy-medium/80 to-yellow-400/80 text-white hover:from-energy-medium hover:to-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all' },
    { name: 'findCharging', icon: <MapPin className="h-4 w-4" />, label: 'Find Charging', color: 'revo-glass bg-gradient-to-r from-tech-dark/80 to-tech/80 text-white hover:from-tech-dark hover:to-tech hover:shadow-lg hover:shadow-tech/20 transition-all' },
    { name: 'settings', icon: <Settings className="h-4 w-4" />, label: 'Settings', color: 'revo-glass bg-gradient-to-r from-gray-500/80 to-gray-600/80 text-white hover:from-gray-500 hover:to-gray-600 hover:shadow-lg hover:shadow-gray-500/20 transition-all' }
  ];

  const secondaryActions = [
    { name: 'analytics', icon: <BarChart2 className="h-4 w-4" />, label: 'Analytics', color: 'revo-glass bg-gradient-to-r from-purple-500/80 to-purple-600/80 text-white hover:from-purple-500 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all' },
    { name: 'saved', icon: <Star className="h-4 w-4" />, label: 'Saved Routes', color: 'revo-glass bg-gradient-to-r from-orange-400/80 to-orange-500/80 text-white hover:from-orange-400 hover:to-orange-500 hover:shadow-lg hover:shadow-orange-400/20 transition-all' },
    { name: 'savings', icon: <IndianRupee className="h-4 w-4" />, label: 'Cost Savings', color: 'revo-glass bg-gradient-to-r from-pink-500/80 to-pink-600/80 text-white hover:from-pink-500 hover:to-pink-600 hover:shadow-lg hover:shadow-pink-500/20 transition-all' },
    { name: 'compare', icon: <Leaf className="h-4 w-4" />, label: 'Compare Routes', color: 'revo-glass bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all' }
  ];
  
  return (
    <div className="revo-glass border border-white/20 p-6 rounded-2xl shadow-xl backdrop-blur-xl relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-revo/30 to-revo-light/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-tech/20 to-tech-light/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header with animated gradient text */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-revo to-revo-light bg-clip-text text-transparent animate-pulse-soft">
            RevoDrive Dashboard
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-revo hover:text-revo-dark transition-colors w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20"
          >
            {expanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
            <span>{expanded ? 'Less Options' : 'More Options'}</span>
          </Button>
        </div>

        {/* Main stats cards with animated entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Eco Score Card */}
          <Card 
            className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-0 ${
              activeCard === 'eco' ? 'ring-2 ring-revo scale-[1.02]' : ''
            } revo-glass bg-gradient-to-br from-white/10 to-white/5`}
            onMouseEnter={() => handleCardHover('eco')}
            onMouseLeave={handleCardLeave}
          >
            <div className="h-1 bg-gradient-to-r from-revo-dark to-revo-light" />
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <div className={`rounded-full p-3 mb-3 bg-white/10 ${activeCard === 'eco' ? 'animate-bounce' : ''}`}>
                <Award className={`h-8 w-8 text-revo`} />
              </div>
              <h3 className="text-sm font-medium">Eco Score</h3>
              <div className={`text-4xl font-bold mt-2 ${ecoStatus.color} ${animateStats ? 'animate-scale-in' : ''}`}>
                {ecoScore}
              </div>
              <div className={`flex items-center justify-center mt-2 ${ecoStatus.color}`}>
                <Activity className="h-3 w-3 mr-1" />
                <p className="text-xs font-medium">{ecoStatus.label}</p>
              </div>
              
              <Progress 
                value={ecoScore} 
                className="h-1.5 mt-3 bg-white/10" 
                indicatorClassName={
                  ecoScore >= 85 ? "bg-energy-low" : 
                  ecoScore >= 70 ? "bg-energy-medium" : 
                  "bg-energy-high"
                }
              />
            </CardContent>
          </Card>
          
          {/* Energy Efficiency Card */}
          <Card 
            className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-0 ${
              activeCard === 'energy' ? 'ring-2 ring-tech scale-[1.02]' : ''
            } revo-glass bg-gradient-to-br from-white/10 to-white/5`}
            onMouseEnter={() => handleCardHover('energy')}
            onMouseLeave={handleCardLeave}
          >
            <div className="h-1 bg-gradient-to-r from-tech-dark to-tech-light"></div>
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <div className={`rounded-full p-3 mb-3 bg-white/10 ${activeCard === 'energy' ? 'animate-float' : ''}`}>
                <TrendingUp className="h-8 w-8 text-tech" />
              </div>
              <h3 className="text-sm font-medium">Energy Efficiency</h3>
              <div className="text-4xl font-bold mt-2 bg-gradient-to-r from-tech to-tech-light bg-clip-text text-transparent">
                {energyEfficiency}
              </div>
              <p className="flex items-center text-xs mt-2 text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>km/kWh</span>
              </p>
              
              <div className="w-full mt-3 h-8 bg-white/5 rounded-md relative overflow-hidden">
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-tech-dark/20 to-tech-light/20"
                  style={{ 
                    width: `${Math.min(100, Number(energyEfficiency) * 20)}%`,
                    transition: "width 1s ease-in-out"
                  }}
                ></div>
                <div className="absolute top-0 left-0 h-full w-1 bg-tech animate-pulse-soft"></div>
              </div>
            </CardContent>
          </Card>
          
          {/* Battery Usage Card */}
          <Card 
            className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-0 ${
              activeCard === 'battery' ? 'ring-2 ring-energy-medium scale-[1.02]' : ''
            } revo-glass bg-gradient-to-br from-white/10 to-white/5`}
            onMouseEnter={() => handleCardHover('battery')}
            onMouseLeave={handleCardLeave}
          >
            <div className="h-1 bg-gradient-to-r from-energy-high via-energy-medium to-energy-low"></div>
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <div className={`rounded-full p-3 mb-3 bg-white/10 ${activeCard === 'battery' ? 'animate-pulse-soft' : ''}`}>
                <Battery className="h-8 w-8 text-energy-medium" />
              </div>
              <h3 className="text-sm font-medium">Battery Usage</h3>
              <div className="relative w-full h-6 bg-white/5 rounded-full mt-3 mb-3 overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full
                    ${batteryUsage > 80 ? 'bg-gradient-to-r from-energy-high to-red-500/80' : 
                    batteryUsage > 50 ? 'bg-gradient-to-r from-energy-medium to-yellow-400/80' : 
                    'bg-gradient-to-r from-energy-low to-green-400/80'}`}
                  style={{ 
                    width: `${batteryUsage}%`,
                    transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)" 
                  }}
                >
                  <div className="absolute top-0 right-0 h-full w-1 bg-white/20"></div>
                </div>
              </div>
              <div className="text-3xl font-bold flex items-center justify-center">
                <span className={
                  batteryUsage > 80 ? 'text-energy-high' : 
                  batteryUsage > 50 ? 'text-energy-medium' : 'text-energy-low'
                }>
                  {batteryUsage}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <PenTool className="h-3 w-3 mr-1" />
                <span>of total capacity</span>
              </p>
            </CardContent>
          </Card>
          
          {/* Weather Impact Card */}
          <Card 
            className={`overflow-hidden transition-all duration-300 hover:shadow-xl border-0 ${
              activeCard === 'weather' ? 'ring-2 ring-tech-light scale-[1.02]' : ''
            } revo-glass bg-gradient-to-br from-white/10 to-white/5`}
            onMouseEnter={() => handleCardHover('weather')}
            onMouseLeave={handleCardLeave}
          >
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-300"></div>
            <CardContent className="p-6 flex flex-col justify-center items-center text-center">
              <div className={`rounded-full p-3 mb-3 bg-white/10 ${activeCard === 'weather' ? 'animate-float' : ''}`}>
                <Cloud className="h-8 w-8 text-tech-light" />
              </div>
              <h3 className="text-sm font-medium">Weather Impact</h3>
              <div className={`text-3xl font-bold mt-2 ${getWeatherImpactColor()}`}>
                {weatherImpact}
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="flex items-center">
                  <Thermometer className="h-3.5 w-3.5 text-tech-light mr-1" />
                  <span className="text-xs">{weather.temperature}°C</span>
                </div>
                <div className="flex items-center">
                  <Wind className="h-3.5 w-3.5 text-tech-light mr-1" />
                  <span className="text-xs">{weather.windSpeed} km/h</span>
                </div>
              </div>
              
              <div className="mt-3 w-full p-2 rounded-lg bg-white/5 text-xs">
                {weather.condition}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons with gradient backgrounds and hover effects */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-6">
          {primaryActions.map(action => (
            <Button 
              key={action.name}
              className={`w-full sm:w-auto flex items-center gap-2 shadow-md transition-all duration-300 animate-fade-in ${action.color}`}
              onClick={() => handleActionClick(action.name)}
              disabled={action.name === 'navigate' && !selectedRoute}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}
        </div>

        {expanded && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-6 animate-slide-up">
            {secondaryActions.map(action => (
              <Button 
                key={action.name}
                size="sm"
                className={`w-full sm:w-auto flex items-center gap-2 shadow-sm transition-all duration-300 ${action.color}`}
                onClick={() => handleActionClick(action.name)}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Alert with animation */}
        {vehicle.batteryLevel < 20 && (
          <div className="flex items-center gap-3 text-sm text-white p-4 bg-gradient-to-r from-energy-high to-red-500 rounded-xl mb-6 animate-pulse-soft shadow-lg shadow-energy-high/30 border border-red-500/30 backdrop-blur-sm">
            <div className="p-2 bg-white/10 rounded-full">
              <AlertTriangle className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <p className="font-semibold">Low battery alert!</p>
              <p className="text-xs opacity-90">Find a charging station soon to avoid being stranded.</p>
            </div>
          </div>
        )}
        
        {/* Selected Route Card with enhanced styling */}
        {selectedRoute && (
          <div className="revo-glass border border-white/20 p-5 rounded-xl shadow-lg animate-scale-in backdrop-blur-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-revo/10 mr-3">
                  <Navigation className="h-5 w-5 text-revo" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-revo to-revo-dark bg-clip-text text-transparent">
                  Selected Route
                </h3>
              </div>
              <span className="text-xs bg-revo/10 text-revo px-4 py-1.5 rounded-full mt-2 sm:mt-0 font-medium">
                {selectedRoute.name}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 revo-glass rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-xs text-muted-foreground mb-1">Distance</span>
                <span className="text-xl font-semibold bg-gradient-to-r from-revo to-revo-light bg-clip-text text-transparent">
                  {selectedRoute.distance} km
                </span>
              </div>
              <div className="flex flex-col items-center p-4 revo-glass rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-xs text-muted-foreground mb-1">Duration</span>
                <span className="text-xl font-semibold bg-gradient-to-r from-tech to-tech-light bg-clip-text text-transparent">
                  {selectedRoute.duration} min
                </span>
              </div>
              <div className="flex flex-col items-center p-4 revo-glass rounded-lg hover:bg-white/10 transition-colors col-span-2 sm:col-span-1">
                <span className="text-xs text-muted-foreground mb-1">Energy Required</span>
                <span className="text-xl font-semibold bg-gradient-to-r from-energy-medium to-yellow-400 bg-clip-text text-transparent">
                  {selectedRoute.energyUsage.toFixed(1)} kWh
                </span>
              </div>
            </div>
            
            {/* Additional route info with subtle animation */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div className="text-xs flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-energy-low" />
                <span>CO₂ Saved: <span className="font-medium text-energy-low">{selectedRoute.co2Saved} kg</span></span>
              </div>
              <div className="text-xs flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-tech" />
                <span>Charging stops: <span className="font-medium text-tech">{Math.round(selectedRoute.distance / 200)}</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
