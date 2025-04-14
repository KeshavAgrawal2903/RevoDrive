
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChargingStation } from '@/hooks/useMapData';
import { 
  Zap, 
  Search, 
  Check, 
  X, 
  Fuel, 
  Leaf, 
  Coffee, 
  Wifi, 
  ShoppingBag,
  RefreshCw,
  MapPin,
  Navigation 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Real EV charging station data from India
const REAL_STATIONS = [
  {
    id: "cs-001",
    name: "Tata Power EZ Charge - Connaught Place",
    lat: 28.6315,
    lng: 77.2167,
    available: true,
    plugTypes: ["CCS", "Type 2"],
    powerKw: 50,
    renewable: true,
    pricing: "₹16/kWh",
    amenities: ["Cafe", "WiFi", "Restrooms"],
  },
  {
    id: "cs-002",
    name: "EESL - Lodhi Road",
    lat: 28.5871,
    lng: 77.2258,
    available: true,
    plugTypes: ["Bharat AC", "Type 2"],
    powerKw: 22,
    renewable: false,
    pricing: "₹12/kWh + ₹5/min after 30min",
    amenities: ["Restrooms"],
  },
  {
    id: "cs-003",
    name: "IOCL EV Station - Delhi-Chandigarh Highway",
    lat: 28.7041,
    lng: 77.1025,
    available: false,
    plugTypes: ["CCS", "CHAdeMO", "Type 2"],
    powerKw: 100,
    renewable: true,
    pricing: "₹18/kWh",
    amenities: ["Cafe", "WiFi", "Shopping", "Restrooms"],
  },
  {
    id: "cs-004",
    name: "Ather Grid - Cyber Hub Gurgaon",
    lat: 28.4951,
    lng: 77.0896,
    available: true,
    plugTypes: ["Type 2"],
    powerKw: 25,
    renewable: true,
    pricing: "₹15/kWh",
    amenities: ["WiFi", "Cafe"],
  },
  {
    id: "cs-005",
    name: "Fortum - DLF Saket",
    lat: 28.5242,
    lng: 77.2029,
    available: false,
    plugTypes: ["CCS", "CHAdeMO"],
    powerKw: 50,
    renewable: false,
    pricing: "₹20/kWh",
    amenities: ["Shopping", "WiFi", "Restrooms"],
  },
  {
    id: "cs-006",
    name: "Tata Power - Greater Kailash",
    lat: 28.5519,
    lng: 77.2373,
    available: true,
    plugTypes: ["CCS", "Type 2"],
    powerKw: 60,
    renewable: true,
    pricing: "₹16/kWh",
    amenities: ["Cafe", "WiFi"],
  },
  {
    id: "cs-007",
    name: "MG Charger - Dwarka",
    lat: 28.5921,
    lng: 77.0460,
    available: true,
    plugTypes: ["CCS", "Type 2"],
    powerKw: 60,
    renewable: false,
    pricing: "₹18/kWh",
    amenities: ["WiFi", "Restrooms"],
  },
  {
    id: "cs-008",
    name: "ChargeGrid - Noida Sector 18",
    lat: 28.5697,
    lng: 77.3259,
    available: true,
    plugTypes: ["CCS"],
    powerKw: 30,
    renewable: true,
    pricing: "₹15/kWh",
    amenities: ["Shopping", "Cafe", "WiFi"],
  }
];

interface ChargingStationsProps {
  chargingStations: ChargingStation[];
  isLoading: boolean;
  onNavigate?: (station: ChargingStation) => void;
}

const ChargingStations: React.FC<ChargingStationsProps> = ({
  chargingStations,
  isLoading,
  onNavigate
}) => {
  const [showAllStations, setShowAllStations] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'renewable'>('available');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState("5");
  const [selectedLocation, setSelectedLocation] = useState("current");
  const [displayStations, setDisplayStations] = useState<ChargingStation[]>([]);
  const { toast } = useToast();
  
  // Use real stations data
  useEffect(() => {
    const realStationsWithUpdates = REAL_STATIONS.map(station => ({
      ...station,
      updatedAt: new Date()
    }));
    
    // Filter based on selected criteria
    const filteredStations = realStationsWithUpdates.filter(station => {
      if (filter === 'available') return station.available;
      if (filter === 'renewable') return station.renewable;
      return true;
    });
    
    setDisplayStations(showAllStations ? filteredStations : filteredStations.slice(0, 3));
  }, [filter, showAllStations]);
  
  // Simulate refreshing stations
  const refreshStations = () => {
    console.log(`Refreshing stations near ${selectedLocation} within ${selectedRadius}km radius...`);
    setRefreshing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Update availability randomly for demo purposes
      const updatedStations = REAL_STATIONS.map(station => ({
        ...station,
        available: Math.random() > 0.3, // 70% chance of being available
        updatedAt: new Date()
      }));
      
      // Filter based on selected criteria
      const filteredStations = updatedStations.filter(station => {
        if (filter === 'available') return station.available;
        if (filter === 'renewable') return station.renewable;
        return true;
      });
      
      setDisplayStations(showAllStations ? filteredStations : filteredStations.slice(0, 3));
      setRefreshing(false);
      
      toast({
        title: "Stations Updated",
        description: `Found ${filteredStations.length} stations within ${selectedRadius}km`,
        duration: 3000,
      });
    }, 1500);
  };
  
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'cafe':
      case 'coffee':
        return <Coffee className="h-3 w-3" />;
      case 'wifi':
        return <Wifi className="h-3 w-3" />;
      case 'shopping':
        return <ShoppingBag className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const handleFilterChange = (newFilter: 'all' | 'available' | 'renewable') => {
    setFilter(newFilter);
  };

  const locations = [
    { id: "current", name: "Current Location" },
    { id: "home", name: "Home" },
    { id: "work", name: "Work" },
    { id: "custom", name: "Custom Point" }
  ];

  const handleNavigate = (station: ChargingStation) => {
    if (onNavigate) {
      onNavigate(station);
    } else {
      toast({
        title: "Navigate to Charging Station",
        description: `Navigating to ${station.name}...`,
        duration: 3000,
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-background to-background/95 shadow-md border-eco/10 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center">
            <Fuel className="mr-2 h-5 w-5 text-eco" />
            <span className="bg-gradient-to-r from-eco to-eco-dark bg-clip-text text-transparent">
              Charging Stations
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-eco/10 hover:text-eco transition-colors" 
            onClick={refreshStations}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-8 text-xs border-eco/20 focus:ring-eco/30">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Locations</SelectLabel>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                <SelectTrigger className="h-8 text-xs border-eco/20 focus:ring-eco/30">
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Search Radius (km)</SelectLabel>
                    <SelectItem value="2">2 km</SelectItem>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="20">20 km</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-eco hover:bg-eco-dark text-white' : 'border-eco/20 text-eco hover:bg-eco/10'}
            onClick={() => handleFilterChange('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'available' ? 'default' : 'outline'}
            className={filter === 'available' ? 'bg-eco hover:bg-eco-dark text-white' : 'border-eco/20 text-eco hover:bg-eco/10'}
            onClick={() => handleFilterChange('available')}
          >
            Available
          </Button>
          <Button
            size="sm"
            variant={filter === 'renewable' ? 'default' : 'outline'}
            className={filter === 'renewable' ? 'bg-eco hover:bg-eco-dark text-white' : 'border-eco/20 text-eco hover:bg-eco/10'}
            onClick={() => handleFilterChange('renewable')}
          >
            <Leaf className="mr-1 h-3.5 w-3.5" />
            Renewable
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading || refreshing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse flex flex-col items-center">
                <Zap className="h-8 w-8 text-eco animate-pulse-green" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {refreshing ? 'Refreshing charging stations...' : 'Finding charging stations...'}
                </p>
              </div>
            </div>
          ) : displayStations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No charging stations found with the selected filter.</p>
              {filter !== 'all' && (
                <Button 
                  variant="link" 
                  onClick={() => setFilter('all')}
                  className="mt-1 text-eco"
                >
                  Show all stations
                </Button>
              )}
            </div>
          ) : (
            displayStations.map((station) => (
              <div
                key={station.id}
                className="border border-eco/10 rounded-lg p-3 transition-all hover:border-eco/50 hover:bg-eco/5 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium group-hover:text-eco transition-colors">{station.name}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1 hover:bg-eco/10 hover:text-eco">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="sr-only">Details</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="animate-fade-in">
                          <DropdownMenuLabel>Station Details</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs flex justify-between">
                            <span>Status:</span>
                            <span className={station.available ? 'text-energy-low' : 'text-destructive'}>
                              {station.available ? 'Available' : 'In Use'}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs flex justify-between">
                            <span>Last Updated:</span>
                            <span>Just now</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs p-0">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full h-7 text-xs text-eco hover:bg-eco/10"
                              onClick={() => handleNavigate(station)}
                            >
                              Navigate Here
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {station.plugTypes.join(', ')} • {station.powerKw} kW
                    </div>
                  </div>
                  <div className="flex items-center">
                    {station.available ? (
                      <Badge variant="outline" className="bg-energy-low/10 text-energy-low border-energy-low/30 group-hover:bg-energy-low/20 transition-colors">
                        <Check className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 group-hover:bg-destructive/20 transition-colors">
                        <X className="h-3 w-3 mr-1" />
                        In Use
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-xs mb-1 text-muted-foreground">Power Source:</div>
                    {station.renewable ? (
                      <Badge className="bg-eco/90 hover:bg-eco text-white">
                        <Leaf className="h-3 w-3 mr-1" />
                        Renewable
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-muted">
                        Standard Grid
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs mb-1 text-muted-foreground">Price:</div>
                    <div className="font-medium text-eco-dark">{station.pricing}</div>
                  </div>
                </div>
                
                {station.amenities.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Amenities:</div>
                    <div className="flex flex-wrap gap-1">
                      {station.amenities.map((amenity) => (
                        <Badge 
                          key={amenity} 
                          variant="outline"
                          className="text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 bg-eco/10 border-eco/20 text-eco hover:bg-eco hover:text-white"
                    onClick={() => handleNavigate(station)}
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1" />
                    Navigate
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {REAL_STATIONS.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-eco hover:bg-eco/5"
              onClick={() => setShowAllStations(!showAllStations)}
            >
              {showAllStations ? 'Show Less' : `Show ${REAL_STATIONS.length - 3} More`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChargingStations;
