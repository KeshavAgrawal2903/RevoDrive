
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  RouteOption, 
  Location,
  VehicleData
} from '@/hooks/useMapData';
import useLocationSearch from '@/hooks/useLocationSearch';
import { useToast } from '@/components/ui/use-toast';
import { 
  Map, 
  CornerDownRight, 
  Zap, 
  Clock, 
  Droplets,
  Timer, 
  ArrowRight, 
  Car,
  ChevronRight,
  RefreshCw,
  Search,
  MapPin
} from 'lucide-react';

interface RouteOptimizerProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
  vehicle: VehicleData;
  isLoading: boolean;
  onFindRoutes?: (start: Location, end: Location) => void;
  onAddLocation?: (location: Location) => void;
}

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  vehicle,
  isLoading,
  onFindRoutes,
  onAddLocation
}) => {
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [endSearchQuery, setEndSearchQuery] = useState('');
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [prioritizeRenewable, setPrioritizeRenewable] = useState(true);
  const [ecoEmphasis, setEcoEmphasis] = useState(75);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStart, setSelectedStart] = useState<Location | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Location | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  const { 
    searchLocations: searchStartLocations, 
    searchResults: startResults,
    isSearching: isSearchingStart,
    clearResults: clearStartResults
  } = useLocationSearch();
  
  const { 
    searchLocations: searchEndLocations, 
    searchResults: endResults,
    isSearching: isSearchingEnd,
    clearResults: clearEndResults
  } = useLocationSearch();

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (startSearchQuery.length >= 3) {
        searchStartLocations(startSearchQuery, 'start', true);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [startSearchQuery, searchStartLocations]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (endSearchQuery.length >= 3) {
        searchEndLocations(endSearchQuery, 'end', true);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [endSearchQuery, searchEndLocations]);
  
  const getEcoScoreColor = (score: number) => {
    if (score >= 85) return 'text-energy-low';
    if (score >= 70) return 'text-energy-medium';
    return 'text-energy-high';
  };
  
  const handleFindRoute = () => {
    if (!selectedStart || !selectedEnd) {
      toast({
        title: "Missing Locations",
        description: "Please select both starting point and destination",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate real-time route finding
    setRefreshing(true);
    
    if (onAddLocation && selectedStart) {
      onAddLocation(selectedStart);
    }
    
    if (onAddLocation && selectedEnd) {
      onAddLocation(selectedEnd);
    }
    
    if (onFindRoutes) {
      onFindRoutes(selectedStart, selectedEnd);
      
      toast({
        title: "Finding Routes",
        description: `Calculating routes from ${selectedStart.name} to ${selectedEnd.name}`,
        duration: 3000,
      });
    }
    
    // Simulate API delay
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleStartSelect = (location: Location) => {
    setSelectedStart(location);
    setStartSearchQuery(location.name);
    setStartOpen(false);
    
    if (onAddLocation) {
      onAddLocation({...location, type: 'start'});
    }
  };

  const handleEndSelect = (location: Location) => {
    setSelectedEnd(location);
    setEndSearchQuery(location.name);
    setEndOpen(false);
    
    if (onAddLocation) {
      onAddLocation({...location, type: 'end'});
    }
  };

  const handleRouteSelect = (route: RouteOption) => {
    onSelectRoute(route);
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
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={startOpen}
                      className="w-full justify-between"
                    >
                      {selectedStart ? (
                        <span className="truncate">{selectedStart.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Search for a location</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search location..."
                        className="h-9"
                        value={startSearchQuery}
                        onValueChange={setStartSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isSearchingStart ? (
                            <div className="flex items-center justify-center p-4">
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              Searching...
                            </div>
                          ) : (
                            startSearchQuery.length < 3 ? (
                              "Type at least 3 characters to search"
                            ) : (
                              "No location found"
                            )
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {startResults.map((location) => (
                            <CommandItem
                              key={location.id}
                              value={location.name}
                              onSelect={() => handleStartSelect(location)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="truncate">{location.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end" className="text-sm">Destination</Label>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={endOpen}
                      className="w-full justify-between"
                    >
                      {selectedEnd ? (
                        <span className="truncate">{selectedEnd.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Search for a location</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search location..."
                        className="h-9"
                        value={endSearchQuery}
                        onValueChange={setEndSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isSearchingEnd ? (
                            <div className="flex items-center justify-center p-4">
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              Searching...
                            </div>
                          ) : (
                            endSearchQuery.length < 3 ? (
                              "Type at least 3 characters to search"
                            ) : (
                              "No location found"
                            )
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {endResults.map((location) => (
                            <CommandItem
                              key={location.id}
                              value={location.name}
                              onSelect={() => handleEndSelect(location)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <span className="truncate">{location.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
              disabled={isLoading || refreshing || !selectedStart || !selectedEnd}
            >
              {isLoading || refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Calculating Routes...
                </>
              ) : 'Find Best Route'}
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
