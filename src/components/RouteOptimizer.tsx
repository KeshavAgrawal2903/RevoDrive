
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  RouteOption, 
  Location,
  VehicleData
} from '@/hooks/useMapData';
import { 
  Map, 
  CornerDownRight, 
  Zap, 
  Clock, 
  Droplets,
  Timer, 
  ArrowRight, 
  Car,
  ChevronRight
} from 'lucide-react';

interface RouteOptimizerProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
  vehicle: VehicleData;
  isLoading: boolean;
}

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  vehicle,
  isLoading
}) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [prioritizeRenewable, setPrioritizeRenewable] = useState(true);
  const [ecoEmphasis, setEcoEmphasis] = useState(75);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleRouteSelect = (route: RouteOption) => {
    onSelectRoute(route);
  };
  
  const getEcoScoreColor = (score: number) => {
    if (score >= 85) return 'text-energy-low';
    if (score >= 70) return 'text-energy-medium';
    return 'text-energy-high';
  };
  
  const handleFindRoute = () => {
    // This would trigger an actual route finding logic
    console.log('Finding routes...');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Map className="mr-2 h-5 w-5 text-eco" />
            Route Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start" className="text-sm">Starting Point</Label>
                <div className="relative">
                  <Input
                    id="start"
                    placeholder="Current Location"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="pl-8"
                  />
                  <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 rounded-full bg-eco"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end" className="text-sm">Destination</Label>
                <div className="relative">
                  <Input
                    id="end"
                    placeholder="Enter Destination"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    className="pl-8"
                  />
                  <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 rounded-full bg-tech"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="renewable"
                  checked={prioritizeRenewable}
                  onCheckedChange={setPrioritizeRenewable}
                />
                <Label htmlFor="renewable" className="text-sm">Prioritize Renewable Charging</Label>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Advanced'} Options
              </Button>
            </div>
            
            {showAdvanced && (
              <div className="pt-2 space-y-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="eco-emphasis" className="text-sm">Eco-Efficiency Emphasis</Label>
                    <span className="text-xs font-medium">{ecoEmphasis}%</span>
                  </div>
                  <Slider
                    id="eco-emphasis"
                    min={0}
                    max={100}
                    step={5}
                    value={[ecoEmphasis]}
                    onValueChange={(value) => setEcoEmphasis(value[0])}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Speed Priority</span>
                    <span>Energy Priority</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="vehicle-type" className="text-xs">Vehicle Type</Label>
                    <div className="flex items-center space-x-2 text-sm border p-1.5 rounded-md bg-muted/30">
                      <Car className="h-3.5 w-3.5" />
                      <span className="truncate">{vehicle.name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="battery-level" className="text-xs">Battery Level</Label>
                    <div className="flex items-center space-x-2 text-sm border p-1.5 rounded-md bg-muted/30">
                      <Zap className="h-3.5 w-3.5" />
                      <span>{vehicle.batteryLevel}%</span>
                      <div className="ml-auto w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-eco" 
                          style={{ width: `${vehicle.batteryLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleFindRoute}
              className="w-full bg-eco hover:bg-eco-dark"
              disabled={isLoading}
            >
              {isLoading ? 'Calculating Routes...' : 'Find Best Route'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {routes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <CornerDownRight className="mr-2 h-5 w-5 text-eco" />
              Route Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedRoute?.id === route.id
                      ? 'border-eco bg-eco/5'
                      : 'hover:border-eco/50'
                  }`}
                  onClick={() => handleRouteSelect(route)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{route.name}</h4>
                    <div className={`eco-score ${getEcoScoreColor(route.ecoScore)}`}>
                      {route.ecoScore}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3.5 w-3.5 text-energy-medium" />
                      <span>{route.energyUsage} kWh</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{route.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Droplets className="h-3.5 w-3.5 text-tech" />
                      <span>{route.co2Saved} kg saved</span>
                    </div>
                  </div>
                  
                  {selectedRoute?.id === route.id && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex items-center space-x-1">
                        <Timer className="h-3 w-3" />
                        <span>Traffic: +{route.trafficDelay} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ArrowRight className="h-3 w-3" />
                        <span>Distance: {route.distance} km</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChevronRight className="h-3 w-3 rotate-90" />
                        <span>Elevation: {route.elevationGain} m</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>Charging Stops: {route.chargingStops}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteOptimizer;
