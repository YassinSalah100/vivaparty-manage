import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, X, User, Settings, LogOut, Calendar, BarChart3 } from "lucide-react";

interface NavbarProps {
  userType?: "admin" | "user";
}

export const Navbar = ({ userType }: NavbarProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (userType === "admin") {
    return (
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">EventX Studio</span>
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/dashboard")}
              >
                Events
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Attendees
              </Button>
            </div>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs gradient-primary text-white border-0">
                  3
                </Badge>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/auth")}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs gradient-primary text-white border-0">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                >
                  Events
                </Button>
                <Button variant="ghost" className="justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="justify-start">
                  Attendees
                </Button>
                <hr className="border-border my-2" />
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start mt-2"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  if (userType === "user") {
    return (
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">EventX Studio</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
              >
                Discover
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/profile")}
              >
                My Events
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/profile")}
              >
                My Tickets
              </Button>
            </div>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs gradient-primary text-white border-0">
                  2
                </Badge>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/auth")}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs gradient-primary text-white border-0">
                  2
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/");
                    setIsMenuOpen(false);
                  }}
                >
                  Discover
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  My Events
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  My Tickets
                </Button>
                <hr className="border-border my-2" />
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start mt-2"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Landing page navbar
  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">EventX Studio</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Features
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              About
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Contact
            </Button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
            <Button 
              className="gradient-primary text-white border-0"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start">Features</Button>
              <Button variant="ghost" className="justify-start">Pricing</Button>
              <Button variant="ghost" className="justify-start">About</Button>
              <Button variant="ghost" className="justify-start">Contact</Button>
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button 
                  className="flex-1 gradient-primary text-white border-0"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};