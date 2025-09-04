import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, EyeOff, UserCheck, Building } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"organizer" | "attendee">("attendee");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Join EventX Studio</h1>
            <p className="text-muted-foreground">
              Create your account and start managing amazing events
            </p>
          </div>

          <Card className="gradient-card border-0 shadow-lg">
            <CardHeader className="space-y-4">
              <div className="flex justify-center gap-2">
                <Button
                  variant={userType === "attendee" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUserType("attendee")}
                  className={userType === "attendee" ? "gradient-primary text-white border-0" : ""}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Attendee
                </Button>
                <Button
                  variant={userType === "organizer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUserType("organizer")}
                  className={userType === "organizer" ? "gradient-primary text-white border-0" : ""}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Organizer
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="transition-smooth focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="transition-smooth focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="transition-smooth focus:ring-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {userType === "organizer" && (
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        placeholder="Your company or organization"
                        className="transition-smooth focus:ring-primary"
                      />
                    </div>
                  )}

                  <Button className="w-full gradient-primary text-white border-0 mt-6">
                    Create {userType === "organizer" ? "Organizer" : "Attendee"} Account
                  </Button>

                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {userType === "organizer" 
                        ? "🎯 Manage unlimited events" 
                        : "🎟️ Book tickets with ease"
                      }
                    </Badge>
                  </div>
                </TabsContent>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email address"
                      className="transition-smooth focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="transition-smooth focus:ring-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button variant="link" className="text-sm text-primary p-0">
                      Forgot password?
                    </Button>
                  </div>

                  <Button className="w-full gradient-primary text-white border-0 mt-6">
                    Sign In
                  </Button>

                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      Welcome back! 👋
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <Button variant="link" className="text-primary p-0 h-auto font-normal">
                  Terms of Service
                </Button>{" "}
                and{" "}
                <Button variant="link" className="text-primary p-0 h-auto font-normal">
                  Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>

          {userType === "organizer" && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center text-lg">
                  <Building className="h-5 w-5 mr-2" />
                  Organizer Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✨ Create unlimited events</li>
                  <li>📊 Advanced analytics dashboard</li>
                  <li>💳 Integrated payment processing</li>
                  <li>📱 QR code ticket generation</li>
                  <li>👥 Attendee management tools</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;