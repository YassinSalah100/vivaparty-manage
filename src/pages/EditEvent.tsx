import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { EventService, type Event } from "@/services/event.service";
import { AuthService } from "@/services/auth.service";
import { ArrowLeft, Save, Calendar, Clock, MapPin, Upload, Users } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [updatedEvent, setUpdatedEvent] = useState({
    title: "",
    description: "",
    venue: "",
    eventDate: "",
    eventTime: "",
    price: 0,
    total_seats: 0,
    image_url: ""
  });

  useEffect(() => {
    const loadEventData = async (eventId: string) => {
      try {
        setIsLoading(true);
        const eventData = await EventService.getEventById(eventId);
        setEvent(eventData);
        
        // Format date and time
        const eventDate = new Date(eventData.event_date);
        const formattedDate = eventDate.toISOString().split('T')[0];
        const formattedTime = eventDate.toTimeString().slice(0, 5);
        
        setUpdatedEvent({
          title: eventData.title,
          description: eventData.description || "",
          venue: eventData.venue,
          eventDate: formattedDate,
          eventTime: formattedTime,
          price: Number(eventData.price),
          total_seats: eventData.total_seats,
          image_url: eventData.image_url || ""
        });
        
      } catch (error) {
        console.error("Failed to load event:", error);
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive"
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const user = await AuthService.getCurrentUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        
        // Check if user is admin
        const session = await AuthService.getSession();
        const role = session?.user?.user_metadata?.role;
        if (role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit events",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        setIsAdmin(true);
        
        // Load event data
        if (id) {
          await loadEventData(id);
        } else {
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error("Failed to check auth:", error);
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [id, navigate, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };
  
  const handleSave = async () => {
    if (!id || !event) return;
    
    try {
      setIsLoading(true);
      
      // Combine date and time
      const dateTime = new Date(`${updatedEvent.eventDate}T${updatedEvent.eventTime}`);
      
      // Get coordinates for the venue
      const coordinates = await geocodeAddress(updatedEvent.venue);
      
      await EventService.updateEvent(id, {
        title: updatedEvent.title,
        description: updatedEvent.description,
        venue: updatedEvent.venue,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        event_date: dateTime.toISOString(),
        price: updatedEvent.price,
        total_seats: updatedEvent.total_seats,
        image_url: updatedEvent.image_url || undefined,
        created_by: event.created_by
      });
      
      toast({
        title: "Success",
        description: "Event updated successfully"
      });
      
      navigate(`/event/${id}`);
      
    } catch (error) {
      console.error("Failed to update event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
      <Navbar userType={isAdmin ? "admin" : undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
            <p className="text-muted-foreground">Update your event details and settings</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Basic details about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={updatedEvent.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={updatedEvent.description}
                  onChange={handleChange}
                  placeholder="Enter event description"
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Input
                    id="venue"
                    name="venue"
                    value={updatedEvent.venue}
                    onChange={handleChange}
                    placeholder="Enter event venue"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={updatedEvent.eventDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Time</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <Input
                      id="eventTime"
                      name="eventTime"
                      type="time"
                      value={updatedEvent.eventTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={updatedEvent.price}
                    onChange={handleChange}
                    min={0}
                    step={0.01}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_seats">Total Seats</Label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <Input
                      id="total_seats"
                      name="total_seats"
                      type="number"
                      value={updatedEvent.total_seats}
                      onChange={handleChange}
                      min={1}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image_url"
                    name="image_url"
                    value={updatedEvent.image_url}
                    onChange={handleChange}
                    placeholder="Enter image URL or upload an image"
                  />
                  <Button variant="outline" className="flex-shrink-0">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-6 space-x-4">
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              className="gradient-primary text-white border-0"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
