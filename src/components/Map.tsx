
  const handleCompareToggle = () => {
    setShowCompareRoutes(!showCompareRoutes);
    toast({
      title: showCompareRoutes ? "Single Route View" : "Compare Routes View",
      description: showCompareRoutes ? "Showing only selected route" : "Showing all available routes",
      duration: 2000,
    });
  };

  const handleStationsToggle = () => {
    setShowStations(!showStations);
    toast({
      title: showStations ? "Stations Hidden" : "Stations Visible",
      description: showStations ? "Hiding charging stations" : "Showing charging stations",
      duration: 2000,
    });
  };

  const resetMap = () => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(13);
    }
  };

  const startNavigation = () => {
    if (!selectedRoute) {
      toast({
        title: "No Route Selected",
        description: "Please select a route first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setActiveNavigation(true);
    setShowCompareRoutes(false);
    
    drawRoute(selectedRoute);
    
    toast({
      title: "Navigation Started",
      description: `Following ${getRouteLabel(selectedRoute.id)}. Estimated arrival in ${selectedRoute.duration} minutes.`,
      duration: 3000,
    });
  };

  const createComparisonLegend = (routes: RouteOption[]) => {
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    const legend = document.createElement('div');
    legend.id = 'route-legend';
    legend.className = 'absolute bottom-16 right-4 bg-white p-3 rounded-lg shadow-md z-10 border border-gray-200 animate-fade-in';
    legend.style.cssText = 'min-width: 200px; max-width: 300px;';
    
    const title = document.createElement('div');
    title.textContent = 'Route Comparison';
    title.className = 'font-semibold text-sm mb-2 flex items-center';
    
    legend.appendChild(title);
    
    routes.forEach(route => {
      const item = document.createElement('div');
      item.className = 'flex items-center text-xs mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer';
      item.onclick = () => {
        if (onRouteClick) onRouteClick(route);
      };
      
      const color = document.createElement('div');
      color.className = 'w-4 h-2 rounded-full mr-2';
      color.style.backgroundColor = getRouteColor(route.id);
      
      const label = document.createElement('span');
      label.textContent = getRouteLabel(route.id);
      
      const info = document.createElement('div');
      info.className = 'text-gray-500 ml-auto text-xs flex items-center';
      
      const distance = document.createElement('span');
      distance.textContent = `${route.distance} km`;
      distance.className = 'mr-2';
      
      const time = document.createElement('span');
      time.textContent = `${route.duration} min`;
      
      info.appendChild(distance);
      info.appendChild(time);
      
      item.appendChild(color);
      item.appendChild(label);
      item.appendChild(info);
      legend.appendChild(item);
    });
    
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };

  const createSingleRouteLegend = (route: RouteOption) => {
    const existingLegend = document.getElementById('route-legend');
    if (existingLegend && existingLegend.parentNode) {
      existingLegend.parentNode.removeChild(existingLegend);
    }
    
    const legend = document.createElement('div');
    legend.id = 'route-legend';
    legend.className = 'absolute bottom-16 right-4 bg-white p-3 rounded-lg shadow-md z-10 border border-gray-200 animate-fade-in';
    legend.style.cssText = 'min-width: 200px;';
    
    const title = document.createElement('div');
    title.textContent = getRouteLabel(route.id);
    title.className = 'font-semibold text-sm mb-2 flex items-center';
    title.style.color = getRouteColor(route.id);
    
    legend.appendChild(title);
    
    const details = document.createElement('div');
    details.className = 'text-xs space-y-1';
    
    const items = [
      { label: 'Distance', value: `${route.distance} km` },
      { label: 'Duration', value: `${route.duration} min` },
      { label: 'Energy Usage', value: `${route.energyUsage.toFixed(1)} kWh` },
      { label: 'Eco Score', value: `${route.ecoScore}/100` },
      { label: 'CO2 Saved', value: `${route.co2Saved.toFixed(1)} kg` },
      { label: 'Charging Stops', value: route.chargingStops.toString() }
    ];
    
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'flex justify-between';
      
      const label = document.createElement('span');
      label.textContent = item.label;
      label.className = 'text-gray-500';
      
      const value = document.createElement('span');
      value.textContent = item.value;
      value.className = 'font-medium';
      
      row.appendChild(label);
      row.appendChild(value);
      details.appendChild(row);
    });
    
    legend.appendChild(details);
    
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.appendChild(legend);
    }
  };
