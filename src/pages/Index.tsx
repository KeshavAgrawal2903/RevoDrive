
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import RouteOptimizer from '@/components/RouteOptimizer';
import EnergyPrediction from '@/components/EnergyPrediction';
import ChargingStations from '@/components/ChargingStations';
import Dashboard from '@/components/Dashboard';
import Authentication from '@/components/Authentication';
import SavedRoutes from '@/components/SavedRoutes';
import useMapData, { Location } from '@/hooks/useMapData';
import { ThemeProvider } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

interface User {
  email: string;
  name: string;
}

const Index = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    selectedRoute,
    setSelectedRoute,
    routes,
    locations,
    addLocation,
    chargingStations,
    vehicle,
    weather,
    isLoading,
    getRoutes,
    findNearbyChargingStations,
    updateVehicleData
  } = useMapData();
  
  const [activeTab, setActiveTab] = useState('routes');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for saved user session in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('ecoRouteUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user', error);
      }
    }
  }, []);
  
  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('ecoRouteUser', JSON.stringify(userData));
    
    toast({
      title: "Welcome",
      description: `Logged in as ${userData.name}`,
      duration: 3000,
    });
  };
  
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ecoRouteUser');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
  };
  
  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route);
    toast({
      title: "Route Selected",
      description: `${route.name} with eco-score of ${route.ecoScore} selected.`,
      duration: 3000,
    });
  };
  
  const handleSavedRouteSelect = (startLoc: Location, endLoc: Location) => {
    // Use the getRoutes function to find routes between these locations
    if (startLoc && endLoc) {
      getRoutes(startLoc, endLoc);
      toast({
        title: "Route Loaded",
        description: `Finding routes from ${startLoc.name} to ${endLoc.name}`,
        duration: 3000,
      });
    }
  };
  
  const handleLocationUpdate = (location: Location) => {
    addLocation(location);
    // If it's a current location, find charging stations nearby
    if (location.type === 'current') {
      findNearbyChargingStations(location);
    }
  };

  // Function to handle dashboard button actions
  const handleDashboardAction = (action: string) => {
    switch (action) {
      case 'navigate':
        if (selectedRoute) {
          toast({
            title: "Navigation Started",
            description: "Turn-by-turn navigation has been activated",
            duration: 3000,
          });
          // In a real app, this would start navigation
        } else {
          toast({
            title: "No Route Selected",
            description: "Please select a route first",
            variant: "destructive",
            duration: 3000,
          });
        }
        break;
      case 'recharge':
        updateVehicleData({
          ...vehicle,
          batteryLevel: Math.min(100, vehicle.batteryLevel + 20),
          isCharging: true
        });
        toast({
          title: "Charging Started",
          description: "Vehicle is now charging",
          duration: 3000,
        });
        break;
      case 'findCharging':
        if (locations.length > 0) {
          const currentLocation = locations.find(loc => loc.type === 'current') || locations[0];
          findNearbyChargingStations(currentLocation, 10);
          toast({
            title: "Searching Stations",
            description: "Finding charging stations nearby",
            duration: 3000,
          });
        }
        break;
      default:
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Authentication onLogin={handleLogin} />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1">
          <div className="container py-4 space-y-6">
            <Dashboard 
              selectedRoute={selectedRoute} 
              vehicle={vehicle}
              weather={weather}
              onAction={handleDashboardAction}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-8">
                <Map 
                  locations={locations} 
                  selectedRoute={selectedRoute}
                  chargingStations={chargingStations}
                  onLocationUpdate={handleLocationUpdate}
                />
              </div>
              
              {/* Controls Section */}
              <div className="lg:col-span-4">
                {isMobile ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="routes">Routes</TabsTrigger>
                      <TabsTrigger value="saved">Saved</TabsTrigger>
                      <TabsTrigger value="energy">Energy</TabsTrigger>
                      <TabsTrigger value="charging">Charging</TabsTrigger>
                    </TabsList>
                    <TabsContent value="routes">
                      <RouteOptimizer 
                        routes={routes}
                        selectedRoute={selectedRoute}
                        onSelectRoute={handleRouteSelect}
                        vehicle={vehicle}
                        isLoading={isLoading}
                        onFindRoutes={getRoutes}
                        onAddLocation={addLocation}
                      />
                    </TabsContent>
                    <TabsContent value="saved">
                      <SavedRoutes 
                        onSelectRoute={handleSavedRouteSelect}
                        locations={locations}
                      />
                    </TabsContent>
                    <TabsContent value="energy">
                      <EnergyPrediction 
                        selectedRoute={selectedRoute}
                        vehicle={vehicle}
                        weather={weather}
                      />
                    </TabsContent>
                    <TabsContent value="charging">
                      <ChargingStations 
                        chargingStations={chargingStations}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-6">
                    <RouteOptimizer 
                      routes={routes}
                      selectedRoute={selectedRoute}
                      onSelectRoute={handleRouteSelect}
                      vehicle={vehicle}
                      isLoading={isLoading}
                      onFindRoutes={getRoutes}
                      onAddLocation={addLocation}
                    />
                    
                    <SavedRoutes 
                      onSelectRoute={handleSavedRouteSelect}
                      locations={locations}
                    />
                    
                    <EnergyPrediction 
                      selectedRoute={selectedRoute}
                      vehicle={vehicle}
                      weather={weather}
                    />
                    
                    <ChargingStations 
                      chargingStations={chargingStations}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

export default Index;
