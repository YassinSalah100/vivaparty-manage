import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, EyeOff, UserCheck, Building } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "@/services/auth.service";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"organizer" | "attendee">("attendee");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    organization: "",
  });
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  
  const handleSignupFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSignupForm({ ...signupForm, [id]: value });
  };
  
  const handleLoginFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id === 'email' ? 'email' : id === 'password' ? 'password' : id;
    setLoginForm({ ...loginForm, [fieldName]: value });
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupForm.fullName || !signupForm.email || !signupForm.password) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await AuthService.signUp({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
        role: userType === "organizer" ? "admin" : "user"
      });
      
      toast({
        title: "Account created",
        description: "Please check your email for verification link",
      });
      
      // Auto-switch to login tab
      const loginTab = document.getElementById("login") as HTMLButtonElement;
      if (loginTab) loginTab.click();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { session } = await AuthService.signIn({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (session) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in"
        });
        
        navigate("/dashboard");
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  <form onSubmit={handleSignup}>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        className="transition-smooth focus:ring-primary"
                        value={signupForm.fullName}
                        onChange={handleSignupFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="transition-smooth focus:ring-primary"
                        value={signupForm.email}
                        onChange={handleSignupFormChange}
                        required
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
                          value={signupForm.password}
                          onChange={handleSignupFormChange}
                          required
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
                          value={signupForm.organization}
                          onChange={handleSignupFormChange}
                        />
                      </div>
                    )}

                    <Button 
                      type="submit"
                      className="w-full gradient-primary text-white border-0 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : `Create ${userType === "organizer" ? "Organizer" : "Attendee"} Account`}
                    </Button>
                  </form>

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
                  <form onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="transition-smooth focus:ring-primary"
                        value={loginForm.email}
                        onChange={handleLoginFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="transition-smooth focus:ring-primary pr-10"
                          value={loginForm.password}
                          onChange={handleLoginFormChange}
                          required
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
                      <Button 
                        type="button"
                        variant="link" 
                        className="text-sm text-primary p-0"
                        onClick={() => {
                          const email = prompt("Enter your email address");
                          if (email) {
                            AuthService.resetPassword(email)
                              .then(() => {
                                toast({
                                  title: "Password reset email sent",
                                  description: "Check your email for a reset link"
                                });
                              })
                              .catch((error) => {
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to send reset email",
                                  variant: "destructive"
                                });
                              });
                          }
                        }}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full gradient-primary text-white border-0 mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>

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