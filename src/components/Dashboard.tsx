
import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Shield,
  Layers,
  Gauge
} from 'lucide-react';
import { RouteOption, VehicleData, WeatherData } from '@/hooks/useMapData';
import { useToast } from '@/hooks/use-toast';

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
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const statsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Add animation effect when component loads
  useEffect(() => {
    setAnimateStats(true);
    const timer = setTimeout(() => {
      setAnimateStats(false);
      setStatsVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedRoute]);

  // Animate on scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in-bottom');
          } else {
            entry.target.classList.remove('animate-slide-in-bottom');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
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
    
    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Mode Activated`,
      description: `Switching to ${action} interface`,
      duration: 2000
    });
    
    setActiveNav(action);
  };

  const handleCardHover = (cardId: string) => {
    setActiveCard(cardId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };
  
  // Generate random speed value for UI
  const getRandomSpeed = () => {
    return (50 + Math.random() * 30).toFixed(1);
  };

  const primaryActions = [
    { 
      name: 'navigate', 
      icon: <Navigation className="h-4 w-4" />, 
      label: 'Navigate', 
      color: 'bg-gradient-to-r from-revo/90 to-revo-dark/90 border-revo/30 hover:from-revo hover:to-revo-dark'
    },
    { 
      name: 'recharge', 
      icon: <Zap className="h-4 w-4" />, 
      label: 'Recharge', 
      color: 'bg-gradient-to-r from-energy-medium/90 to-yellow-400/90 border-yellow-400/30 hover:from-energy-medium hover:to-yellow-400'
    },
    { 
      name: 'findCharging', 
      icon: <MapPin className="h-4 w-4" />, 
      label: 'Find Charging', 
      color: 'bg-gradient-to-r from-tech-dark/90 to-tech/90 border-tech/30 hover:from-tech-dark hover:to-tech'
    },
    { 
      name: 'settings', 
      icon: <Settings className="h-4 w-4" />, 
      label: 'Settings', 
      color: 'bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-500/30 hover:from-gray-500 hover:to-gray-600'
    }
  ];

  const secondaryActions = [
    { 
      name: 'analytics', 
      icon: <BarChart2 className="h-4 w-4" />, 
      label: 'Analytics', 
      color: 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 border-purple-500/30 hover:from-purple-500 hover:to-purple-600'
    },
    { 
      name: 'saved', 
      icon: <Star className="h-4 w-4" />, 
      label: 'Saved Routes', 
      color: 'bg-gradient-to-r from-orange-400/90 to-orange-500/90 border-orange-400/30 hover:from-orange-400 hover:to-orange-500'
    },
    { 
      name: 'savings', 
      icon: <IndianRupee className="h-4 w-4" />, 
      label: 'Cost Savings', 
      color: 'bg-gradient-to-r from-pink-500/90 to-pink-600/90 border-pink-500/30 hover:from-pink-500 hover:to-pink-600'
    },
    { 
      name: 'compare', 
      icon: <Leaf className="h-4 w-4" />, 
      label: 'Compare Routes', 
      color: 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 border-blue-500/30 hover:from-blue-500 hover:to-blue-600'
    }
  ];
  
  return (
    <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20 p-6 shadow-2xl transition-all duration-500 ease-in-out">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-revo/20 to-revo-light/10 rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-tech/20 to-tech-light/5 rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-energy-low/10 to-energy-medium/5 rounded-full blur-3xl animate-pulse-soft"></div>
      
      <div className="relative z-10">
        {/* Main header with animated effects */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="relative h-10 w-10 mr-3">
              <div className="absolute inset-0 bg-gradient-to-r from-revo-light to-revo rounded-full animate-pulse-soft"></div>
              <div className="absolute inset-0.5 bg-gradient-to-br from-white/90 to-white/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Gauge className="h-5 w-5 text-revo drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-revo to-revo-light bg-clip-text text-transparent">
                RevoDrive Dashboard
              </h2>
              <p className="text-xs text-white/70">Real-time EV optimization system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-revo hover:text-revo-dark transition-colors bg-white/10 hover:bg-white/20 border border-white/20"
            >
              {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              <span>{expanded ? 'Less Options' : 'More Options'}</span>
            </Button>
            
            <Button 
              variant="outline"
              size="sm" 
              className="px-1.5 bg-white/10 hover:bg-white/20 border border-white/20"
              onClick={() => setShowRouteDetails(!showRouteDetails)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Navigation bar (new) */}
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap mb-6 pb-1.5 border-b border-white/10 scrollbar-none">
          {['dashboard', 'navigate', 'recharge', 'analytics', 'settings'].map(nav => (
            <Button 
              key={nav}
              variant={activeNav === nav ? "default" : "ghost"}
              size="sm"
              className={`rounded-full py-1.5 px-3 ${
                activeNav === nav 
                  ? 'bg-gradient-to-r from-revo to-revo-dark text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
              onClick={() => handleActionClick(nav)}
            >
              {nav === 'dashboard' && <Layers className="h-3.5 w-3.5 mr-1.5" />}
              {nav === 'navigate' && <Navigation className="h-3.5 w-3.5 mr-1.5" />}
              {nav === 'recharge' && <Zap className="h-3.5 w-3.5 mr-1.5" />}
              {nav === 'analytics' && <BarChart2 className="h-3.5 w-3.5 mr-1.5" />}
              {nav === 'settings' && <Settings className="h-3.5 w-3.5 mr-1.5" />}
              {nav.charAt(0).toUpperCase() + nav.slice(1)}
            </Button>
          ))}
        </div>

        {/* Main stats cards with enhanced visuals */}
        <div 
          ref={statsRef} 
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-opacity duration-300 ${statsVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Eco Score Card */}
          <Card 
            className={`overflow-hidden transition-all duration-500 border-0 ${
              activeCard === 'eco' ? 'ring-2 ring-revo/70 scale-[1.03] shadow-lg shadow-revo/30' : 'shadow-md'
            } bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl relative`}
            onMouseEnter={() => handleCardHover('eco')}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-revo/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-revo/10 rounded-full blur-xl"></div>
            </div>
            <div className="h-1 bg-gradient-to-r from-revo-dark via-revo to-revo-light w-full relative z-10"></div>
            <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
              <div className={`relative mb-3 group ${activeCard === 'eco' ? 'animate-bounce' : ''}`}>
                <div className="absolute inset-0 bg-revo/20 rounded-full blur-md animate-pulse-soft group-hover:bg-revo/30"></div>
                <div className="relative bg-white/10 rounded-full p-3">
                  <Award className={`h-9 w-9 ${ecoStatus.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1.5 text-white/80">Eco Score</h3>
              <div className={`text-4xl font-bold ${ecoStatus.color} ${animateStats ? 'animate-scale-in' : ''}`}>
                {ecoScore}
              </div>
              <div className={`flex items-center justify-center mt-1 ${ecoStatus.color}`}>
                <Activity className="h-3 w-3 mr-1" />
                <p className="text-xs font-medium">{ecoStatus.label}</p>
              </div>
              
              <div className="mt-3 w-full">
                <Progress 
                  value={ecoScore} 
                  showValue
                  glowEffect
                  className="h-1.5 bg-white/10" 
                  indicatorClassName={
                    ecoScore >= 85 ? "bg-gradient-to-r from-energy-low/80 to-energy-low" : 
                    ecoScore >= 70 ? "bg-gradient-to-r from-energy-medium/80 to-energy-medium" : 
                    "bg-gradient-to-r from-energy-high/80 to-energy-high"
                  }
                />
              </div>
              
              <div className="mt-3 pt-3 w-full border-t border-white/10 grid grid-cols-2 gap-2 text-center">
                <div className="text-xs">
                  <p className="text-white/60">Yesterday</p>
                  <p className="font-semibold">{(ecoScore - 5 + Math.random() * 10).toFixed(0)}</p>
                </div>
                <div className="text-xs">
                  <p className="text-white/60">Weekly Avg</p>
                  <p className="font-semibold">{(ecoScore - 8 + Math.random() * 15).toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Energy Efficiency Card */}
          <Card 
            className={`overflow-hidden transition-all duration-500 border-0 ${
              activeCard === 'energy' ? 'ring-2 ring-tech/70 scale-[1.03] shadow-lg shadow-tech/30' : 'shadow-md'
            } bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl relative`}
            onMouseEnter={() => handleCardHover('energy')}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-tech/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-tech-light/10 rounded-full blur-xl"></div>
            </div>
            <div className="h-1 bg-gradient-to-r from-tech-dark via-tech to-tech-light w-full relative z-10"></div>
            <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
              <div className={`relative mb-3 group ${activeCard === 'energy' ? 'animate-float' : ''}`}>
                <div className="absolute inset-0 bg-tech/20 rounded-full blur-md animate-pulse-soft group-hover:bg-tech/30"></div>
                <div className="relative bg-white/10 rounded-full p-3">
                  <TrendingUp className="h-9 w-9 text-tech" />
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1.5 text-white/80">Energy Efficiency</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-tech to-tech-light bg-clip-text text-transparent">
                {energyEfficiency}
              </div>
              <p className="flex items-center text-xs mt-1 text-white/70">
                <ArrowUpRight className="h-3 w-3 mr-1 text-tech-light" />
                <span>km/kWh</span>
              </p>
              
              <div className="mt-3 w-full h-10 bg-white/5 rounded-lg relative overflow-hidden">
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-tech-dark/30 to-tech-light/30 backdrop-blur-sm"
                  style={{ 
                    width: `${Math.min(100, Number(energyEfficiency) * 20)}%`,
                    transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  }}
                ></div>
                <div 
                  className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-tech-light to-tech"
                  style={{ 
                    boxShadow: "0 0 10px rgba(125, 211, 252, 0.7)"
                  }}
                ></div>
                
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                  <span className="bg-tech-dark/30 px-1.5 py-0.5 rounded backdrop-blur-sm">City</span>
                  <span className="bg-tech/30 px-1.5 py-0.5 rounded backdrop-blur-sm">Highway</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 w-full border-t border-white/10 grid grid-cols-2 gap-2">
                <div className="text-xs text-center">
                  <p className="text-white/60">Optimal</p>
                  <p className="font-semibold text-tech-light">{(Number(energyEfficiency) * 1.2).toFixed(1)} km/kWh</p>
                </div>
                <div className="text-xs text-center">
                  <p className="text-white/60">Current Speed</p>
                  <p className="font-semibold">{getRandomSpeed()} km/h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Battery Usage Card */}
          <Card 
            className={`overflow-hidden transition-all duration-500 border-0 ${
              activeCard === 'battery' ? 'ring-2 ring-energy-medium/70 scale-[1.03] shadow-lg shadow-energy-medium/30' : 'shadow-md'
            } bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl relative`}
            onMouseEnter={() => handleCardHover('battery')}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-energy-medium/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl"></div>
            </div>
            <div className="h-1 bg-gradient-to-r from-energy-high via-energy-medium to-energy-low w-full relative z-10"></div>
            <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
              <div className={`relative mb-3 group ${activeCard === 'battery' ? 'animate-pulse-soft' : ''}`}>
                <div className="absolute inset-0 bg-energy-medium/20 rounded-full blur-md animate-pulse-soft group-hover:bg-energy-medium/30"></div>
                <div className="relative bg-white/10 rounded-full p-3">
                  <Battery className="h-9 w-9 text-energy-medium" />
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1.5 text-white/80">Battery Usage</h3>
              
              <div className="w-full h-8 bg-white/5 rounded-full overflow-hidden p-1 mt-1 mb-3 relative">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    batteryUsage > 80 ? 'bg-gradient-to-r from-energy-high to-red-500' : 
                    batteryUsage > 50 ? 'bg-gradient-to-r from-energy-medium to-yellow-400' : 
                    'bg-gradient-to-r from-energy-low to-green-400'
                  }`}
                  style={{ 
                    width: `${batteryUsage}%`,
                  }}
                >
                  <div className="absolute top-0 right-0 h-full w-0.5 bg-white/30 shadow-[0_0_5px_rgba(255,255,255,0.7)]"></div>
                  
                  {Array.from({length: 5}).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 bottom-0 w-0.5 bg-white/20"
                      style={{ left: `${(i + 1) * 20}%` }}
                    ></div>
                  ))}
                </div>
                
                <div 
                  className="absolute top-1/2 -translate-y-1/2 right-2 text-xs font-bold text-white"
                  style={{ 
                    textShadow: '0 0 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {batteryUsage}%
                </div>
              </div>
              
              <div className="text-3xl font-bold flex items-center justify-center">
                <span className={
                  batteryUsage > 80 ? 'text-energy-high' : 
                  batteryUsage > 50 ? 'text-energy-medium' : 'text-energy-low'
                }>
                  {selectedRoute ? selectedRoute.energyUsage.toFixed(1) : "0"} kWh
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 flex items-center">
                <PenTool className="h-3 w-3 mr-1" />
                <span>of {vehicle.maxBatteryCapacity} kWh total capacity</span>
              </p>
              
              <div className="mt-3 pt-3 w-full border-t border-white/10 grid grid-cols-2 gap-2">
                <div className="text-xs text-center flex flex-col items-center">
                  <div className="bg-energy-medium/20 p-1 rounded-full mb-1">
                    <Zap className="h-3 w-3 text-energy-medium" />
                  </div>
                  <p className="text-white/60">Charging Time</p>
                  <p className="font-semibold">{(batteryUsage * 0.5).toFixed(0)} min</p>
                </div>
                <div className="text-xs text-center flex flex-col items-center">
                  <div className="bg-tech/20 p-1 rounded-full mb-1">
                    <Navigation className="h-3 w-3 text-tech" />
                  </div>
                  <p className="text-white/60">Range Left</p>
                  <p className="font-semibold">{((100 - batteryUsage) * 3 + 50).toFixed(0)} km</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Weather Impact Card */}
          <Card 
            className={`overflow-hidden transition-all duration-500 border-0 ${
              activeCard === 'weather' ? 'ring-2 ring-tech-light/70 scale-[1.03] shadow-lg shadow-tech-light/30' : 'shadow-md'
            } bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl relative`}
            onMouseEnter={() => handleCardHover('weather')}
            onMouseLeave={handleCardLeave}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-400 via-tech-light to-blue-300 w-full relative z-10"></div>
            <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
              <div className={`relative mb-3 group ${activeCard === 'weather' ? 'animate-float' : ''}`}>
                <div className="absolute inset-0 bg-tech-light/20 rounded-full blur-md animate-pulse-soft group-hover:bg-tech-light/30"></div>
                <div className="relative bg-white/10 rounded-full p-3">
                  <Cloud className="h-9 w-9 text-tech-light" />
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1.5 text-white/80">Weather Impact</h3>
              <div className={`text-3xl font-bold ${getWeatherImpactColor()}`}>
                {weatherImpact}
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-400/20 p-1.5 rounded-full mb-1">
                    <Thermometer className="h-3.5 w-3.5 text-tech-light" />
                  </div>
                  <span className="text-xs font-medium">{weather.temperature}°C</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-blue-400/20 p-1.5 rounded-full mb-1">
                    <Wind className="h-3.5 w-3.5 text-tech-light" />
                  </div>
                  <span className="text-xs font-medium">{weather.windSpeed} km/h</span>
                </div>
              </div>
              
              <div className="mt-3 w-full p-2.5 rounded-lg bg-gradient-to-r from-blue-400/10 to-tech-light/10 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-medium">{weather.condition}</p>
              </div>
              
              <div className="mt-3 pt-3 w-full border-t border-white/10 grid grid-cols-2 gap-2">
                <div className="text-xs text-center flex flex-col items-center">
                  <div className="bg-tech-light/20 p-1 rounded-full mb-1">
                    <Droplets className="h-3 w-3 text-tech-light" />
                  </div>
                  <p className="text-white/60">Precipitation</p>
                  <p className="font-semibold">{Math.floor(Math.random() * 50)}%</p>
                </div>
                <div className="text-xs text-center flex flex-col items-center">
                  <div className="bg-blue-400/20 p-1 rounded-full mb-1">
                    <Shield className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-white/60">Efficiency Loss</p>
                  <p className="font-semibold">{weatherImpact === 'Low' ? '5' : weatherImpact === 'Medium' ? '12' : '18'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons with enhanced design */}
        <div className="animate-on-scroll">
          <h3 className="text-sm font-medium mb-3 flex items-center text-white/80">
            <Sparkles className="h-4 w-4 mr-1.5 text-revo" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-6">
            {primaryActions.map((action, index) => (
              <Button 
                key={action.name}
                className={`w-full sm:w-auto flex items-center gap-2 text-white border transition-all duration-300 animate-fade-in shadow-md hover:shadow-lg ${action.color}`}
                onClick={() => handleActionClick(action.name)}
                style={{ animationDelay: `${index * 100}ms` }}
                disabled={action.name === 'navigate' && !selectedRoute}
              >
                <div className="bg-white/10 p-1 rounded-full">
                  {action.icon}
                </div>
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>

          {expanded && (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-6 animate-slide-in-bottom">
              {secondaryActions.map((action, index) => (
                <Button 
                  key={action.name}
                  size="sm"
                  className={`w-full sm:w-auto flex items-center gap-2 text-white border transition-all duration-300 shadow-sm hover:shadow-md ${action.color}`}
                  onClick={() => handleActionClick(action.name)}
                  style={{ animationDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="bg-white/10 p-0.5 rounded-full">
                    {action.icon}
                  </div>
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Animated Alert with pulsing effect */}
        {vehicle.batteryLevel < 20 && (
          <div className="flex items-center gap-3 text-sm text-white p-4 bg-gradient-to-r from-energy-high/90 to-red-500/90 rounded-xl mb-6 animate-pulse-soft shadow-lg shadow-energy-high/30 border border-red-500/30 backdrop-blur-sm">
            <div className="p-2 bg-white/10 rounded-full">
              <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold">Low battery alert!</p>
              <p className="text-xs opacity-90">Find a charging station soon to avoid being stranded.</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-auto bg-white/10 hover:bg-white/20 text-white"
              onClick={() => handleActionClick('findCharging')}
            >
              <MapPin className="h-4 w-4 mr-1" /> Find Stations
            </Button>
          </div>
        )}
        
        {/* Enhanced Selected Route Card with interactive elements */}
        {selectedRoute && (
          <div className="border border-white/20 p-5 rounded-xl shadow-2xl animate-scale-in backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 relative overflow-hidden animate-on-scroll">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-revo/10 to-revo-dark/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-tech/10 to-tech-dark/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-revo/20 to-revo-dark/10 backdrop-blur-sm mr-3">
                    <Navigation className="h-5 w-5 text-revo" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-revo to-revo-dark bg-clip-text text-transparent">
                    Selected Route
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  <span className="text-xs bg-revo/10 text-revo px-4 py-1.5 rounded-full font-medium border border-revo/20">
                    {selectedRoute.name}
                  </span>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-revo/20 bg-revo/10 text-revo hover:bg-revo/20 h-7"
                    onClick={() => setShowRouteDetails(!showRouteDetails)}
                  >
                    {showRouteDetails ? 'Less' : 'More'} Details
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="bg-tech/20 p-1.5 rounded-full mb-2 transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className="h-4 w-4 text-tech" />
                  </div>
                  <span className="text-xs text-white/70 mb-1">Distance</span>
                  <span className="text-xl font-semibold bg-gradient-to-r from-revo to-revo-light bg-clip-text text-transparent">
                    {selectedRoute.distance} km
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="bg-tech-light/20 p-1.5 rounded-full mb-2 transition-all duration-300 group-hover:scale-110">
                    <Clock className="h-4 w-4 text-tech-light" />
                  </div>
                  <span className="text-xs text-white/70 mb-1">Duration</span>
                  <span className="text-xl font-semibold bg-gradient-to-r from-tech to-tech-light bg-clip-text text-transparent">
                    {selectedRoute.duration} min
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group col-span-2 sm:col-span-1">
                  <div className="bg-energy-medium/20 p-1.5 rounded-full mb-2 transition-all duration-300 group-hover:scale-110">
                    <Zap className="h-4 w-4 text-energy-medium" />
                  </div>
                  <span className="text-xs text-white/70 mb-1">Energy Required</span>
                  <span className="text-xl font-semibold bg-gradient-to-r from-energy-medium to-yellow-400 bg-clip-text text-transparent">
                    {selectedRoute.energyUsage.toFixed(1)} kWh
                  </span>
                </div>
              </div>
              
              {showRouteDetails && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="text-xs flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <Leaf className="h-4 w-4 text-energy-low mb-1" />
                      <span className="text-white/70">CO₂ Saved</span>
                      <span className="font-medium text-energy-low">{selectedRoute.co2Saved} kg</span>
                    </div>
                    <div className="text-xs flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <MapPin className="h-4 w-4 text-tech mb-1" />
                      <span className="text-white/70">Charging stops</span>
                      <span className="font-medium text-tech">{Math.round(selectedRoute.distance / 200)}</span>
                    </div>
                    <div className="text-xs flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <RefreshCw className="h-4 w-4 text-revo mb-1" />
                      <span className="text-white/70">Regeneration</span>
                      <span className="font-medium text-revo">{(selectedRoute.energyUsage * 0.15).toFixed(1)} kWh</span>
                    </div>
                    <div className="text-xs flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <Activity className="h-4 w-4 text-energy-medium mb-1" />
                      <span className="text-white/70">Elevation Gain</span>
                      <span className="font-medium text-energy-medium">{selectedRoute.elevationGain} m</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-xs font-medium mb-2 text-white/70">Route Efficiency Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Energy Optimization</span>
                        <span className="font-medium text-energy-low">{(80 + Math.random() * 15).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={80 + Math.random() * 15} 
                        className="h-1.5 bg-white/10" 
                        indicatorClassName="bg-energy-low"
                      />
                      
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span>Traffic Avoidance</span>
                        <span className="font-medium text-tech">{(70 + Math.random() * 20).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={70 + Math.random() * 20} 
                        className="h-1.5 bg-white/10" 
                        indicatorClassName="bg-tech"
                      />
                      
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span>Time Optimization</span>
                        <span className="font-medium text-revo">{(75 + Math.random() * 15).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={75 + Math.random() * 15} 
                        className="h-1.5 bg-white/10" 
                        indicatorClassName="bg-revo"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-revo-dark via-tech to-energy-low"></div>
    </div>
  );
};

export default Dashboard;
