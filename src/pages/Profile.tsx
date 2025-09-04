import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Phone, Mail, Ticket as TicketIcon, Clock, MapPin, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { AuthService } from "@/services/auth.service";
import { TicketService } from "@/services/ticket.service";
import { ProfileService } from "@/services/profile.service";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeCanvas } from 'qrcode.react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  event_id: string;
  qr_code: string;
  booking_date: string;
  status: string;
  price: number;
  events: {
    title: string;
    event_date: string;
    venue: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    full_name: "",
    phone: ""
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in
        const user = await AuthService.getCurrentUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }
        
        // Get user profile
        const userData = await ProfileService.getProfile(user.id);
        setProfile(userData);
        setUpdatedProfile({
          full_name: userData.full_name || "",
          phone: userData.phone || ""
        });
        
        // Get user tickets
        const ticketsData = await TicketService.getUserTickets(user.id);
        setTickets(ticketsData);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      
      // Update profile
      const updatedData = await ProfileService.updateProfile(profile.id, {
        full_name: updatedProfile.full_name,
        phone: updatedProfile.phone
      });
      
      // Update local state
      setProfile({
        ...profile,
        full_name: updatedData.full_name,
        phone: updatedData.phone
      });
      
      setEditMode(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={profile?.role === 'admin' ? "admin" : "user"} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground mb-8">Manage your account and view your tickets</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {profile?.full_name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {!editMode ? (
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{profile?.full_name}</h3>
                      <Badge className="mt-1">
                        {profile?.role === 'admin' ? 'Organizer' : 'Attendee'}
                      </Badge>
                    </div>
                  ) : (
                    <div className="w-full space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={updatedProfile.full_name}
                          onChange={(e) => setUpdatedProfile({...updatedProfile, full_name: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={updatedProfile.phone}
                          onChange={(e) => setUpdatedProfile({...updatedProfile, phone: e.target.value})}
                        />
                      </div>
                      
                      <Button 
                        className="w-full gradient-primary text-white border-0"
                        onClick={handleUpdateProfile}
                        disabled={isLoading}
                      >
                        {isLoading ? "Updating..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
                
                {!editMode && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{profile?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{profile?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile?.phone || "Not set"}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 text-destructive border-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="tickets">
              <TabsList className="mb-6">
                <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                {profile?.role === 'admin' && (
                  <TabsTrigger value="events">My Events</TabsTrigger>
                )}
                <TabsTrigger value="settings">Account Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tickets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                    <CardDescription>View all your booked event tickets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tickets.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <TicketIcon className="h-8 w-8 text-muted-foreground opacity-70" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          You haven't booked any tickets yet. Browse upcoming events and book your first ticket!
                        </p>
                        <Button 
                          className="mt-4 gradient-primary text-white border-0"
                          onClick={() => navigate("/")}
                        >
                          Explore Events
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <div 
                            key={ticket.id} 
                            className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowQRCode(true);
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">{ticket.events.title}</h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                                  {formatDate(ticket.events.event_date)}
                                </div>
                              </div>
                              <Badge 
                                variant={
                                  ticket.status === 'booked'
                                    ? 'default'
                                    : ticket.status === 'used'
                                      ? 'outline'
                                      : 'destructive'
                                }
                              >
                                {ticket.status === 'booked'
                                  ? 'Active'
                                  : ticket.status === 'used'
                                    ? 'Used'
                                    : 'Cancelled'
                                }
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-primary" />
                                {formatTime(ticket.events.event_date)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-primary" />
                                {ticket.events.venue}
                              </div>
                              <div>
                                <span className="font-medium">${Number(ticket.price).toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-sm text-muted-foreground">
                              <span>Ticket #: {ticket.ticket_number}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {profile?.role === 'admin' && (
                <TabsContent value="events" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Events</CardTitle>
                      <CardDescription>Events you have created and manage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Button 
                          className="gradient-primary text-white border-0"
                          onClick={() => navigate("/dashboard")}
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Email Preferences</h3>
                        <div className="space-y-2">
                          {/* Email preferences options would go here */}
                          <p className="text-muted-foreground">Email preference settings coming soon.</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Password</h3>
                        <Button variant="outline">Change Password</Button>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Delete Account</h3>
                        <Button 
                          variant="destructive"
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                              try {
                                setIsLoading(true);
                                const user = await AuthService.getCurrentUser();
                                if (!user) {
                                  throw new Error("No user found");
                                }
                                
                                // Delete the user's profile first
                                // First mark the profile as deleted
                                await ProfileService.deleteProfile(user.id);
                                
                                // Then delete the auth user from their session
                                await supabase.auth.signOut();
                                
                                toast({
                                  title: "Account Deleted",
                                  description: "Your account has been successfully deleted. You can register again if you wish.",
                                });
                                
                                // Redirect to home page
                                navigate("/");
                              } catch (error) {
                                console.error("Failed to delete account:", error);
                                toast({
                                  title: "Error",
                                  description: "Failed to delete your account. Please try again.",
                                  variant: "destructive"
                                });
                              } finally {
                                setIsLoading(false);
                              }
                            }
                          }}
                        >
                          Delete My Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Ticket QR Code Dialog */}
      {selectedTicket && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity ${showQRCode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-background rounded-lg p-6 max-w-md w-full m-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">{selectedTicket.events.title}</h2>
              <p className="text-muted-foreground mb-4">
                {formatDate(selectedTicket.events.event_date)} at {formatTime(selectedTicket.events.event_date)}
              </p>
              
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCodeCanvas 
                  value={selectedTicket.qr_code} 
                  size={200}
                  level="H"
                />
              </div>
              
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Ticket Number</div>
                <div className="text-xl font-bold">{selectedTicket.ticket_number}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <div className="text-muted-foreground">Venue</div>
                  <div>{selectedTicket.events.venue}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <Badge variant={selectedTicket.status === 'booked' ? 'default' : 'outline'}>
                    {selectedTicket.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowQRCode(false);
                    setTimeout(() => setSelectedTicket(null), 300);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
