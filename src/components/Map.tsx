
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, MapPin, Navigation } from 'lucide-react';
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
    // Mock map rendering with HTML/CSS when no API key is available
    return (
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Mock Map UI elements */}
          <div className="w-full h-full relative overflow-hidden">
            {/* Stylistic background for the map */}
            <div className="absolute inset-0 bg-tech-light/10 dark:bg-tech-dark/20"></div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Mockup roads */}
            <div className="absolute w-[80%] h-2 bg-white dark:bg-gray-600 top-1/2 left-[10%] transform -translate-y-1/2 rounded-full"></div>
            <div className="absolute w-2 h-[60%] bg-white dark:bg-gray-600 top-[20%] left-1/4 rounded-full"></div>
            <div className="absolute w-2 h-[40%] bg-white dark:bg-gray-600 top-[30%] left-2/3 rounded-full"></div>
            
            {/* Origin point */}
            <div className="absolute w-4 h-4 bg-eco rounded-full top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg"></div>
            
            {/* Destination point */}
            <div className="absolute w-4 h-4 bg-tech rounded-full top-1/2 left-3/4 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg"></div>
            
            {/* Path visualization */}
            <div className="absolute h-1 bg-eco-light top-1/2 transform -translate-y-1/2 left-1/4 right-1/4" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            }}></div>
            
            {/* Charging stations */}
            {chargingStations.map((station, index) => {
              // Calculate random positions for demo
              const top = 30 + (index * 15) % 60;
              const left = 25 + (index * 20) % 60;
              return (
                <div 
                  key={station.id}
                  className={`absolute w-3 h-3 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2 ${
                    station.available ? 'bg-energy-low' : 'bg-destructive'
                  }`}
                  style={{ top: `${top}%`, left: `${left}%` }}
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
                  Interactive map simulation with real-time charging station updates.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Real-time indicators */}
          {!showMapKeyInput && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span>Real-time updates active</span>
              </div>
            </div>
          )}
          
          {/* Navigation controls */}
          {!showMapKeyInput && (
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <Navigation className="h-4 w-4 mr-1" />
                <span className="text-xs">Navigate</span>
              </Button>
              <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-xs">Add Stop</span>
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
