
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Map from '@/components/Map';
import RouteOptimizer from '@/components/RouteOptimizer';
import EnergyPrediction from '@/components/EnergyPrediction';
import ChargingStations from '@/components/ChargingStations';
import Dashboard from '@/components/Dashboard';
import useMapData, { RouteOption } from '@/hooks/useMapData';
import { ThemeProvider } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    selectedRoute,
    setSelectedRoute,
    routes,
    locations,
    chargingStations,
    vehicle,
    weather,
    isLoading
  } = useMapData();
  
  const [activeTab, setActiveTab] = useState('routes');
  
  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    toast({
      title: "Route Selected",
      description: `${route.name} with eco-score of ${route.ecoScore} selected.`,
      duration: 3000,
    });
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container py-4 space-y-6">
            <Dashboard 
              selectedRoute={selectedRoute} 
              vehicle={vehicle}
              weather={weather}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-8">
                <Map 
                  locations={locations} 
                  selectedRoute={selectedRoute}
                  chargingStations={chargingStations}
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
