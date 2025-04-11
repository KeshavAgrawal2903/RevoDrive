
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, MapPin, Navigation, LocateFixed, ListFilter } from 'lucide-react';
import { Location, RouteOption, ChargingStation } from '@/hooks/useMapData';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface MapProps {
  locations: Location[];
  selectedRoute: RouteOption | null;
  chargingStations: ChargingStation[];
}

const Map: React.FC<MapProps> = ({ 
  locations, 
  selectedRoute, 
  chargingStations 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [showMapKeyInput, setShowMapKeyInput] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [region, setRegion] = useState<string>('india');
  const { toast } = useToast();

  useEffect(() => {
    // Check for map API key in local storage
    const savedApiKey = localStorage.getItem('mapApiKey');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
      setShowMapKeyInput(false);
    }
  }, []);

  const handleMapKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (mapApiKey) {
      // Simulate API key validation
      setTimeout(() => {
        localStorage.setItem('mapApiKey', mapApiKey);
        setShowMapKeyInput(false);
        setIsLoading(false);
        toast({
          title: "API Key Saved",
          description: "Your map API key has been saved successfully.",
          duration: 3000,
        });
      }, 1000);
    }
  };

  const renderPlaceholderMap = () => {
    // India-focused map rendering
    return (
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Mock Map UI elements */}
          <div className="w-full h-full relative overflow-hidden">
            {/* India map styling */}
            <div className="absolute inset-0 bg-tech-light/10 dark:bg-tech-dark/20"></div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Mockup India outline */}
            <div className="absolute w-[60%] h-[70%] top-[15%] left-[20%] border-2 border-dashed border-eco/40 rounded-lg">
              {/* Stylized India outline */}
              <div className="absolute top-[30%] left-[40%] w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute text-xs font-medium top-[35%] left-[42%]">Delhi</div>
              
              <div className="absolute top-[65%] left-[60%] w-3 h-3 bg-eco rounded-full animate-pulse"></div>
              <div className="absolute text-xs font-medium top-[70%] left-[60%]">Chennai</div>
              
              <div className="absolute top-[60%] left-[40%] w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute text-xs font-medium top-[65%] left-[38%]">Mumbai</div>
              
              <div className="absolute top-[50%] left-[55%] w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute text-xs font-medium top-[55%] left-[53%]">Hyderabad</div>
              
              <div className="absolute top-[45%] left-[65%] w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div className="absolute text-xs font-medium top-[50%] left-[65%]">Kolkata</div>
              
              <div className="absolute top-[42%] left-[33%] w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute text-xs font-medium top-[47%] left-[31%]">Ahmedabad</div>
            </div>
            
            {/* Origin point */}
            <div className="absolute w-4 h-4 bg-eco rounded-full top-[60%] left-[40%] transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg z-10"></div>
            
            {/* Destination point */}
            <div className="absolute w-4 h-4 bg-tech rounded-full top-[30%] left-[40%] transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg z-10"></div>
            
            {/* Path visualization */}
            <div className="absolute h-1 bg-eco-light transform -translate-y-1/2 z-[5]" style={{
              width: '30%',
              top: '45%',
              left: '40%',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              transform: 'rotate(-60deg) translateY(40px)',
            }}></div>
            
            {/* Charging stations */}
            {chargingStations.map((station, index) => {
              // Calculate positions based on index for demo visualization
              const positions = [
                { top: 35, left: 35 },
                { top: 45, left: 45 },
                { top: 55, left: 35 },
                { top: 50, left: 50 }
              ];
              const pos = positions[index % positions.length];
              
              return (
                <div 
                  key={station.id}
                  className={`absolute w-3 h-3 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2 ${
                    station.available ? 'bg-energy-low' : 'bg-destructive'
                  }`}
                  style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                >
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-white/30 animate-ping opacity-75"></div>
                </div>
              );
            })}
          </div>
          
          {showMapKeyInput ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Enter Map API Key</h3>
                <form onSubmit={handleMapKeySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="apiKey" className="text-sm font-medium">
                      Mapbox API Key
                    </label>
                    <Input
                      id="apiKey"
                      type="text"
                      value={mapApiKey}
                      onChange={(e) => setMapApiKey(e.target.value)}
                      placeholder="Enter your Mapbox API key"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can get a Mapbox API key from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-eco hover:underline">mapbox.com</a>
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-eco hover:bg-eco-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Validating...' : 'Set API Key'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    This key will be stored locally on your device.
                  </p>
                </form>
              </Card>
            </div>
          ) : (
            <div className="absolute bottom-4 left-4 max-w-xs">
              <Alert className="bg-background/80 backdrop-blur-sm">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Interactive map for Indian regions with real-time charging station updates.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Region selection and filters */}
          {!showMapKeyInput && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span>India Region Active</span>
              </div>
            </div>
          )}
          
          {/* Map controls for Indian regions */}
          {!showMapKeyInput && (
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <Navigation className="h-4 w-4 mr-1" />
                <span className="text-xs">Navigate</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <LocateFixed className="h-4 w-4 mr-1" />
                <span className="text-xs">Current Location</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <ListFilter className="h-4 w-4 mr-1" />
                <span className="text-xs">Filter Stations</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[60vh] lg:h-[70vh] relative map-container">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <Alert className="max-w-md">
            <Info className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div ref={mapContainerRef} className="w-full h-full">
        {renderPlaceholderMap()}
      </div>
    </div>
  );
};

export default Map;
