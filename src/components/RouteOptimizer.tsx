
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from '@/hooks/use-toast';
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
  MapPin,
  Navigation,
  LocateFixed,
  Sparkles,
  LayoutDashboard,
  ArrowUpRight
} from 'lucide-react';

interface RouteOptimizerProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
  vehicle: VehicleData;
  isLoading: boolean;
  onFindRoutes?: (start: Location, end: Location) => void;
  onAddLocation?: (location: Location) => void;
  useCurrentLocation?: boolean;
}

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  vehicle,
  isLoading,
  onFindRoutes,
  onAddLocation,
  useCurrentLocation = true
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
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
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

  // Get user's current location on mount
  useEffect(() => {
    if (useCurrentLocation && !currentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation: Location = {
            id: 'current',
            name: 'Current Location',
            lat: latitude,
            lng: longitude,
            type: 'current'
          };
          
          setCurrentLocation(newLocation);
          setSelectedStart(newLocation);
          
          if (onAddLocation) {
            onAddLocation(newLocation);
          }
          
          toast({
            title: "Current Location Set",
            description: "Using your current location as starting point",
            duration: 3000,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Couldn't get your location. Please enter manually.",
            duration: 3000,
            variant: "destructive"
          });
        }
      );
    }
  }, [useCurrentLocation, onAddLocation, toast, currentLocation]);

  // Update start input when useCurrentLocation changes
  useEffect(() => {
    if (useCurrentLocation && currentLocation) {
      setSelectedStart(currentLocation);
      setStartSearchQuery("Current Location");
    } else if (!useCurrentLocation && selectedStart?.type === 'current') {
      setSelectedStart(null);
      setStartSearchQuery("");
    }
  }, [useCurrentLocation, currentLocation, selectedStart]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (startSearchQuery.length >= 3 && !useCurrentLocation) {
        searchStartLocations(startSearchQuery, 'start', true);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [startSearchQuery, searchStartLocations, useCurrentLocation]);

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
  
  const getRouteGradient = (routeId: string) => {
    switch (routeId) {
      case 'eco-route':
        return 'from-energy-low/80 to-energy-low';
      case 'fast-route':
        return 'from-energy-high/80 to-energy-high';
      case 'balanced-route':
        return 'from-tech-light/80 to-tech';
      default:
        return 'from-revo-light/80 to-revo';
    }
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

  // Navigate function for route options
  const handleNavigate = (route: RouteOption) => {
    onSelectRoute(route);
    toast({
      title: "Navigation Started",
      description: `Navigating via ${route.name}`,
      duration: 3000,
    });
  };

  const handleCardHover = (routeId: string) => {
    setActiveCard(routeId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden backdrop-blur-xl border border-white/20 shadow-xl bg-gradient-to-br from-white/5 to-white/10">
        <div className="h-1 w-full bg-gradient-to-r from-revo via-tech to-energy-low"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <div className="bg-gradient-to-r from-tech to-tech-light rounded-full p-1.5 mr-2">
              <Map className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-revo to-tech-light bg-clip-text text-transparent">
              Route Planning
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 relative">
            {/* Animated decorative element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-revo/20 to-tech-light/10 rounded-full blur-3xl animate-pulse-soft"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-energy-low/20 to-energy-medium/10 rounded-full blur-3xl animate-pulse-soft"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="start" className="text-sm flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-revo" />
                  Starting Point
                </Label>
                {useCurrentLocation ? (
                  <div className="flex items-center space-x-2 p-3 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md shadow-md">
                    <div className="bg-revo/20 p-1.5 rounded-full animate-pulse-soft">
                      <LocateFixed className="h-4 w-4 text-revo" />
                    </div>
                    <span className="text-sm font-medium">Using Current Location</span>
                  </div>
                ) : (
                  <Popover open={startOpen} onOpenChange={setStartOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={startOpen}
                        className="w-full justify-between border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
                      >
                        {selectedStart ? (
                          <span className="truncate">{selectedStart.name}</span>
                        ) : (
                          <span className="text-muted-foreground">Search for a location</span>
                        )}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 border border-white/20 bg-card/95 backdrop-blur-lg">
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
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end" className="text-sm flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-energy-high" />
                  Destination
                </Label>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={endOpen}
                      className="w-full justify-between border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
                    >
                      {selectedEnd ? (
                        <span className="truncate">{selectedEnd.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Search for a location</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 border border-white/20 bg-card/95 backdrop-blur-lg">
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
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <Switch
                  id="renewable"
                  checked={prioritizeRenewable}
                  onCheckedChange={setPrioritizeRenewable}
                />
                <Label htmlFor="renewable" className="text-sm flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-energy-medium" />
                  Prioritize Renewable Charging
                </Label>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="border border-white/10 bg-white/5 hover:bg-white/10"
              >
                {showAdvanced ? 'Hide' : 'Advanced'} Options
              </Button>
            </div>
            
            {showAdvanced && (
              <div className="pt-4 space-y-5 border-t border-white/10 animate-slide-in-bottom">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="eco-emphasis" className="text-sm flex items-center font-medium">
                      <Zap className="h-3.5 w-3.5 mr-1.5 text-revo" />
                      Eco-Efficiency Emphasis
                    </Label>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-revo/20 text-revo">
                      {ecoEmphasis}%
                    </span>
                  </div>
                  <Slider
                    id="eco-emphasis"
                    min={0}
                    max={100}
                    step={5}
                    value={[ecoEmphasis]}
                    onValueChange={(value) => setEcoEmphasis(value[0])}
                    className="py-3"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="bg-energy-high/20 text-energy-high px-2 py-0.5 rounded-md">Speed Priority</span>
                    <span className="bg-energy-low/20 text-energy-low px-2 py-0.5 rounded-md">Energy Priority</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <Label htmlFor="vehicle-type" className="text-xs text-muted-foreground">Vehicle Type</Label>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="bg-revo/20 p-1.5 rounded-full">
                        <Car className="h-4 w-4 text-revo" />
                      </div>
                      <span className="font-medium">{vehicle.name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                    <Label htmlFor="battery-level" className="text-xs text-muted-foreground">Battery Level</Label>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="bg-revo/20 p-1.5 rounded-full">
                        <Zap className="h-4 w-4 text-revo" />
                      </div>
                      <span className="font-medium">{vehicle.batteryLevel}%</span>
                      <Progress 
                        value={vehicle.batteryLevel} 
                        className="h-1.5 ml-auto w-16"
                        indicatorClassName={
                          vehicle.batteryLevel > 70 ? "bg-energy-low" :
                          vehicle.batteryLevel > 30 ? "bg-energy-medium" :
                          "bg-energy-high"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleFindRoute}
              className="w-full relative overflow-hidden group transition-all duration-300"
              disabled={isLoading || refreshing || !selectedEnd || (useCurrentLocation ? !currentLocation : !selectedStart)}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-energy-low via-revo to-energy-medium opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2 text-white font-medium">
                {isLoading || refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Calculating Routes...
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="h-4 w-4" />
                    Find Best Route
                  </>
                )}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {routes.length > 0 && (
        <Card className="overflow-hidden backdrop-blur-xl border border-white/20 shadow-xl bg-gradient-to-br from-white/5 to-white/10">
          <div className="h-1 w-full bg-gradient-to-r from-energy-low via-revo to-tech"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-revo to-tech rounded-full p-1.5 mr-2">
                  <CornerDownRight className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-revo to-tech bg-clip-text text-transparent">
                  Route Options
                </span>
              </div>
              <span className="text-xs bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                {routes.length} routes found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg backdrop-blur-md ${
                    selectedRoute?.id === route.id
                      ? 'border-revo/50 shadow-md shadow-revo/10 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  } ${activeCard === route.id ? 'transform scale-[1.02]' : ''}`}
                  onClick={() => handleRouteSelect(route)}
                  onMouseEnter={() => handleCardHover(route.id)}
                  onMouseLeave={handleCardLeave}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center">
                      <div className={`p-1.5 rounded-lg bg-${route.id === 'eco-route' ? 'energy-low' : route.id === 'fast-route' ? 'energy-high' : 'tech'}/20 mr-2`}>
                        {route.id === 'eco-route' ? (
                          <Sparkles className="h-4 w-4 text-energy-low" />
                        ) : route.id === 'fast-route' ? (
                          <ArrowUpRight className="h-4 w-4 text-energy-high" />
                        ) : (
                          <Navigation className="h-4 w-4 text-tech" />
                        )}
                      </div>
                      {route.name}
                    </h4>
                    <div className={`eco-score flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                      route.ecoScore >= 85 ? 'bg-energy-low/20 text-energy-low' :
                      route.ecoScore >= 70 ? 'bg-energy-medium/20 text-energy-medium' :
                      'bg-energy-high/20 text-energy-high'
                    }`}>
                      <span className="text-xs font-medium">Score</span>
                      <span className="font-bold">{route.ecoScore}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex flex-col items-center p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center justify-center mb-1 bg-energy-medium/20 p-1.5 rounded-full">
                        <Zap className="h-3.5 w-3.5 text-energy-medium" />
                      </div>
                      <span className="font-medium text-xs">{route.energyUsage} kWh</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center justify-center mb-1 bg-revo/20 p-1.5 rounded-full">
                        <Clock className="h-3.5 w-3.5 text-revo" />
                      </div>
                      <span className="font-medium text-xs">{route.duration} min</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center justify-center mb-1 bg-tech/20 p-1.5 rounded-full">
                        <Droplets className="h-3.5 w-3.5 text-tech" />
                      </div>
                      <span className="font-medium text-xs">{route.co2Saved} kg</span>
                    </div>
                  </div>
                  
                  {selectedRoute?.id === route.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs grid grid-cols-2 gap-x-4 gap-y-2 animate-fade-in bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Timer className="h-3 w-3 text-revo" />
                        <span>Traffic: <span className="font-medium">+{route.trafficDelay} min</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-3 w-3 text-energy-medium" />
                        <span>Distance: <span className="font-medium">{route.distance} km</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="h-3 w-3 rotate-90 text-tech" />
                        <span>Elevation: <span className="font-medium">{route.elevationGain} m</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-energy-low" />
                        <span>Charging Stops: <span className="font-medium">{route.chargingStops}</span></span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex">
                    <Button 
                      variant="outline"
                      className={`ml-auto px-4 group relative overflow-hidden`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(route);
                      }}
                    >
                      <div className={`absolute inset-0 w-full h-full bg-gradient-to-r ${getRouteGradient(route.id)} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <span className="relative flex items-center gap-1.5 group-hover:text-white transition-colors">
                        <Navigation className="h-3.5 w-3.5" />
                        Navigate
                      </span>
                    </Button>
                  </div>
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
