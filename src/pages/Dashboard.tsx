import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationService } from "@/services/validation.service";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, TrendingUp, Ticket, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCard";
import { useToast } from "@/components/ui/use-toast";
import { EventService, Event } from "@/services/event.service";
import { AuthService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statsData, setStatsData] = useState([
    { label: "Events Created", value: "0", icon: CalendarDays, trend: "+0%" },
    { label: "Total Attendees", value: "0", icon: Users, trend: "+0%" },
    { label: "Revenue Generated", value: "$0", icon: TrendingUp, trend: "+0%" },
    { label: "Tickets Sold", value: "0", icon: Ticket, trend: "+0%" }
  ]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    venue: "",
    event_date: "",
    time: "12:00",
    price: 0,
    total_seats: 100,
    image_url: ""
  });

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await EventService.getEvents({ 
        status: activeTab as 'upcoming' | 'active' | 'closed' 
      });
      setEvents(data || []);
      
      // Update stats
      if (isAdmin && data) {
        const totalTickets = data.reduce((acc, event) => acc + (event.total_seats - event.available_seats), 0);
        const totalRevenue = data.reduce((acc, event) => acc + ((event.total_seats - event.available_seats) * Number(event.price)), 0);
        
        // Use functional update to avoid dependency on statsData
        setStatsData(currentStats => {
          const updatedStats = [...currentStats];
          updatedStats[0].value = `${data.length}`;
          updatedStats[1].value = `${totalTickets}+`;
          updatedStats[2].value = `$${totalRevenue.toFixed(2)}`;
          updatedStats[3].value = `${totalTickets}+`;
          return updatedStats;
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isAdmin, toast]);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);
        
        // Check if user is admin
        const session = await AuthService.getSession();
        const role = session?.user?.user_metadata?.role;
        setIsAdmin(role === 'admin');
        
        // Load events
        loadEvents();
      } catch (error) {
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate, loadEvents]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    loadEvents();
  };
  
  const handleCreateEvent = async () => {
    try {
      setIsCreating(true);
      
      if (!user?.id) {
        throw new Error("Please log in to create events");
      }
      
      // Combine date and time
      const dateTime = new Date(`${newEvent.event_date}T${newEvent.time}`);
      
      // Prepare event data
      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description?.trim(),
        venue: newEvent.venue.trim(),
        event_date: dateTime.toISOString(),
        price: Number(newEvent.price),
        total_seats: Number(newEvent.total_seats),
        created_by: user.id,
        image_url: newEvent.image_url?.trim() || undefined,
        status: 'upcoming' as const
      };

      // Validate event data
      const validationErrors = ValidationService.validateEvent(eventData);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: (
            <ul className="list-disc pl-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          ),
          variant: "destructive"
        });
        return;
      }
      
      // Create the event
      await EventService.createEvent(eventData);
      
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      // Reset form and close dialog
      setNewEvent({
        title: "",
        description: "",
        venue: "",
        event_date: "",
        time: "12:00",
        price: 0,
        total_seats: 100,
        image_url: ""
      });
      setIsCreateDialogOpen(false);
      
      // Reload events
      await loadEvents();
    } catch (error) {
      console.error('Event creation error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create event. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        setIsLoading(true);
        await EventService.deleteEvent(eventId);
        
        toast({
          title: "Success",
          description: "Event deleted successfully"
        });
        
        // Reload events
        loadEvents();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete event";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={isAdmin ? "admin" : "user"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isAdmin ? "Admin Dashboard" : "My Events Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage your events and analyze performance" : "View your booked events and tickets"}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white border-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new event
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input 
                      id="venue" 
                      placeholder="Enter venue"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input 
                        id="time" 
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        type="number"
                        min="0"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({...newEvent, price: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="seats">Total Seats</Label>
                      <Input 
                        id="seats" 
                        type="number"
                        min="1"
                        value={newEvent.total_seats}
                        onChange={(e) => setNewEvent({...newEvent, total_seats: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL (optional)</Label>
                    <Input 
                      id="image" 
                      placeholder="Enter image URL"
                      value={newEvent.image_url}
                      onChange={(e) => setNewEvent({...newEvent, image_url: e.target.value})}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="gradient-primary text-white border-0" 
                    onClick={handleCreateEvent}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Event"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        )}
        
        <Tabs defaultValue="upcoming" onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-6">
            {isLoading ? (
              <div className="text-center p-12">Loading events...</div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <div className="p-3 rounded-full bg-muted mb-4">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {isAdmin 
                      ? "Create your first event by clicking the 'Create New Event' button above."
                      : "There are no upcoming events available at the moment. Check back later!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${event.available_seats > 0 ? 'text-success border-success' : 'text-destructive border-destructive'}
                          `}
                        >
                          {event.available_seats} / {event.total_seats} seats
                        </Badge>
                      </div>
                      <CardDescription>{formatDate(event.event_date)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">{event.venue}</div>
                        <div className="font-semibold">${event.price}</div>
                      </div>
                      
              {isAdmin && (
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
              
              {!isAdmin && (
                <Button 
                  className="w-full gradient-primary text-white border-0"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  View Details
                </Button>
              )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-6">
            {/* Similar content as above, will load when tab changes */}
          </TabsContent>
          
          <TabsContent value="closed" className="space-y-6">
            {/* Similar content as above, will load when tab changes */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
