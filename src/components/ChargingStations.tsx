import React, { useState } from 'react';
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
  ShoppingBag 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChargingStationsProps {
  chargingStations: ChargingStation[];
  isLoading: boolean;
}

const ChargingStations: React.FC<ChargingStationsProps> = ({
  chargingStations,
  isLoading
}) => {
  const [showAllStations, setShowAllStations] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'renewable'>('available');
  
  const filteredStations = chargingStations.filter(station => {
    if (filter === 'available') return station.available;
    if (filter === 'renewable') return station.renewable;
    return true;
  });
  
  const displayStations = showAllStations 
    ? filteredStations 
    : filteredStations.slice(0, 2);
  
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Fuel className="mr-2 h-5 w-5 text-eco" />
          Charging Stations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-eco hover:bg-eco-dark' : ''}
            onClick={() => handleFilterChange('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'available' ? 'default' : 'outline'}
            className={filter === 'available' ? 'bg-eco hover:bg-eco-dark' : ''}
            onClick={() => handleFilterChange('available')}
          >
            Available
          </Button>
          <Button
            size="sm"
            variant={filter === 'renewable' ? 'default' : 'outline'}
            className={filter === 'renewable' ? 'bg-eco hover:bg-eco-dark' : ''}
            onClick={() => handleFilterChange('renewable')}
          >
            <Leaf className="mr-1 h-3.5 w-3.5" />
            Renewable
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse flex flex-col items-center">
                <Zap className="h-8 w-8 text-eco animate-pulse-green" />
                <p className="mt-2 text-sm text-muted-foreground">Finding charging stations...</p>
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
                  className="mt-1"
                >
                  Show all stations
                </Button>
              )}
            </div>
          ) : (
            displayStations.map((station) => (
              <div
                key={station.id}
                className="border rounded-lg p-3 transition-all hover:border-eco/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{station.name}</h4>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {station.plugTypes.join(', ')} • {station.powerKw} kW
                    </div>
                  </div>
                  <div className="flex items-center">
                    {station.available ? (
                      <Badge variant="outline" className="bg-energy-low/10 text-energy-low border-energy-low/30">
                        <Check className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        <X className="h-3 w-3 mr-1" />
                        In Use
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-xs mb-1">Power Source:</div>
                    {station.renewable ? (
                      <Badge className="bg-eco/90 hover:bg-eco">
                        <Leaf className="h-3 w-3 mr-1" />
                        Renewable
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Standard Grid
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs mb-1">Price:</div>
                    <div className="font-medium">{station.pricing}</div>
                  </div>
                </div>
                
                {station.amenities.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Amenities:</div>
                    <div className="flex flex-wrap gap-1">
                      {station.amenities.map((amenity) => (
                        <Badge 
                          key={amenity} 
                          variant="outline"
                          className="text-xs bg-secondary/50"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {filteredStations.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setShowAllStations(!showAllStations)}
            >
              {showAllStations ? 'Show Less' : `Show ${filteredStations.length - 2} More`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChargingStations;
