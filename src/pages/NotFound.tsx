import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4">
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="text-9xl font-bold text-primary/10">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-primary">Page Not Found</h1>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                className="gradient-primary text-white border-0"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
