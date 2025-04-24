
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, User, Key, Lock, PhoneCall, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AuthProps {
  onLogin: (userData: { email: string; name: string }) => void;
}

const Authentication: React.FC<AuthProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        toast({
          title: "Welcome to RevoDrive! 🚀",
          description: "Your journey to smarter EV routing begins here.",
          duration: 3000,
        });
        onLogin({ email, name: name || email.split('@')[0] });
      } else {
        toast({
          title: "Oops! Something's missing",
          description: "Please check your credentials and try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (email && password && name) {
        toast({
          title: "Welcome aboard! 🎉",
          description: "Your RevoDrive account is ready to roll.",
          duration: 3000,
        });
        onLogin({ email, name });
      } else {
        toast({
          title: "Hold up!",
          description: "We need all the details to get you started.",
          variant: "destructive",
          duration: 3000,
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-revo-dark via-revo to-revo-light p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-lg animate-float">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            RevoDrive
          </CardTitle>
          <CardDescription className="text-white/60">
            Smart EV Route Planning for the Future
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 mx-6 bg-white/10">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-white/20 text-white"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-white/20 text-white"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="animate-slide-in-bottom">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-white/70">Password</Label>
                    <a href="#" className="text-xs text-revo-light hover:text-white transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10 bg-white/10 border-white/20 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-white/90 text-revo-dark font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-revo-dark border-t-transparent rounded-full"></div>
                      Logging in...
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="animate-slide-in-bottom">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white/70">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input 
                      id="signup-name" 
                      placeholder="Your Name" 
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white/70">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-mobile" className="text-white/70">Mobile Number</Label>
                  <div className="relative">
                    <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input 
                      id="signup-mobile" 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX" 
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white/70">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input 
                      id="signup-password" 
                      type="password" 
                      className="pl-10 bg-white/10 border-white/20 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-white/90 text-revo-dark font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-revo-dark border-t-transparent rounded-full"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>

        <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-lg"></div>
      </Card>
    </div>
  );
};

export default Authentication;
