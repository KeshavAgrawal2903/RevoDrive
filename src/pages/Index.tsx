
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
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, IndianRupee, Star, Battery } from 'lucide-react';

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
  const [activePage, setActivePage] = useState('main');
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
          setActiveTab('charging');
        }
        break;
      case 'settings':
        toast({
          title: "Settings",
          description: "Vehicle and app settings panel opened",
          duration: 3000,
        });
        // In a real app, this would open a settings panel
        break;
      case 'analytics':
        setActivePage('analytics');
        toast({
          title: "Analytics",
          description: "Energy analytics dashboard opened",
          duration: 3000,
        });
        break;
      case 'saved':
        setActivePage('saved');
        toast({
          title: "Saved Routes",
          description: "Your saved routes are displayed",
          duration: 3000,
        });
        break;
      case 'savings':
        setActivePage('savings');
        toast({
          title: "Cost Savings",
          description: "Your EV cost savings overview",
          duration: 3000,
        });
        break;
      case 'compare':
        toast({
          title: "Compare Routes",
          description: "Now showing all available routes on the map",
          duration: 3000,
        });
        // The Map component will handle this through its props
        break;
      default:
        break;
    }
  };

  // Function to handle navbar menu clicks
  const handleNavTabChange = (tab: string) => {
    switch (tab) {
      case 'Map':
        setActivePage('main');
        setActiveTab('routes');
        break;
      case 'Stations':
        setActivePage('main');
        setActiveTab('charging');
        break;
      case 'Analytics':
        setActivePage('analytics');
        break;
      case 'Saved':
        setActivePage('saved');
        break;
      case 'Savings':
        setActivePage('savings');
        break;
      case 'Profile':
        toast({
          title: "Profile",
          description: "User profile view",
          duration: 3000,
        });
        break;
      case 'Settings':
        toast({
          title: "Settings",
          description: "App settings view",
          duration: 3000,
        });
        break;
      default:
        setActivePage('main');
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

  // Render analytics page
  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-tech" />
            Energy Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Your detailed energy usage and efficiency analytics will be displayed here.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-eco/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Average Efficiency</p>
                <p className="text-2xl font-bold">4.8 km/kWh</p>
              </div>
              
              <div className="p-4 bg-tech/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">428 km</p>
              </div>
              
              <div className="p-4 bg-energy-medium/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Energy Used</p>
                <p className="text-2xl font-bold">89.2 kWh</p>
              </div>
            </div>
            
            {/* Placeholder for charts */}
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Energy usage charts will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <EnergyPrediction 
        selectedRoute={selectedRoute}
        vehicle={vehicle}
        weather={weather}
      />
    </div>
  );

  // Render savings page
  const renderSavings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IndianRupee className="mr-2 h-5 w-5 text-eco" />
            Cost Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Your EV cost savings compared to conventional vehicles.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-eco/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
                <p className="text-2xl font-bold">₹4,200</p>
              </div>
              
              <div className="p-4 bg-tech/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">CO₂ Reduction</p>
                <p className="text-2xl font-bold">245 kg</p>
              </div>
              
              <div className="p-4 bg-energy-medium/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Fuel Saved</p>
                <p className="text-2xl font-bold">102 L</p>
              </div>
            </div>
            
            {/* Placeholder for savings chart */}
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Savings comparison charts will be displayed here</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Cost Comparison (per 100 km)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Petrol Cost</p>
                  <p className="font-bold">₹950</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Electricity Cost</p>
                  <p className="font-bold">₹250</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onTabChange={handleNavTabChange}
        />
        <main className="flex-1">
          <div className="container py-4 space-y-6">
            <Dashboard 
              selectedRoute={selectedRoute} 
              vehicle={vehicle}
              weather={weather}
              onAction={handleDashboardAction}
            />
            
            {activePage === 'main' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-8">
                  <Map 
                    locations={locations} 
                    selectedRoute={selectedRoute}
                    allRoutes={routes}
                    chargingStations={chargingStations}
                    onLocationUpdate={handleLocationUpdate}
                    onRouteClick={handleRouteSelect}
                  />
                </div>
                
                {/* Controls Section */}
                <div className="lg:col-span-4">
                  {isMobile ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="routes">Routes</TabsTrigger>
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
            )}
            
            {activePage === 'analytics' && renderAnalytics()}
            
            {activePage === 'saved' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5 text-orange-400" />
                      Saved Routes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* This will be replaced with actual saved routes */}
                      <p className="text-sm text-muted-foreground">
                        Save your frequently used routes for quick access. Your saved routes will appear here.
                      </p>
                      <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">No saved routes yet</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activePage === 'savings' && renderSavings()}
          </div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

export default Index;
