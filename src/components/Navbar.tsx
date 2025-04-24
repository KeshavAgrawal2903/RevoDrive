import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Zap,
  Map,
  BarChart2,
  Settings,
  Sun,
  Moon,
  Info,
  LogOut,
  User,
  ChevronDown,
  Battery,
  Star
} from "lucide-react";
import { useTheme } from "next-themes";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface User {
  name: string;
  email: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onTabChange }) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleMenuClick = (tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
    }
    
    toast({
      title: `${tabName} View`,
      description: `Switched to ${tabName} view`,
      duration: 3000,
    });
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container flex justify-between items-center py-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary animate-pulse-soft" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              RevoDrive
            </h1>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hidden sm:inline-block">
            Beta
          </span>
        </div>
        
        <TooltipProvider>
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="nav-link"
              onClick={() => onTabChange?.('Map')}
            >
              <Map className="h-4 w-4" />
              <span>Navigation</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="nav-link"
              onClick={() => onTabChange?.('Stations')}
            >
              <Battery className="h-4 w-4" />
              <span>Charging</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="nav-link"
              onClick={() => onTabChange?.('Analytics')}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="nav-link"
              onClick={() => onTabChange?.('Saved')}
            >
              <Star className="h-4 w-4" />
              <span>Saved</span>
            </Button>
          </nav>
        </TooltipProvider>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => toast({
              title: "About RevoDrive",
              description: "Next-generation route planning for electric vehicles. Optimizing your journey with AI.",
              duration: 5000,
            })}
          >
            <Info className="h-5 w-5" />
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange?.('Profile')}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange?.('Settings')}>
                  <Settings className="h-4 w-4 mr-2" /> Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
