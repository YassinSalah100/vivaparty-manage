import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Share2, ArrowLeft, BarChart, ChevronRight, Download as DownloadIcon, QrCode } from "lucide-react";
import { Ticket as TicketIcon } from "lucide-react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { AuthService } from "@/services/auth.service";
import { EventService } from "@/services/event.service";
import { TicketService } from "@/services/ticket.service";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeCanvas } from 'qrcode.react';
import SeatSelector from "@/components/SeatSelector";
import { supabase } from "@/integrations/supabase/client";

interface EventWithProfiles {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  event_date: string;
  price: number;
  total_seats: number;
  available_seats: number;
  status: string;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  latitude: number | null;
  longitude: number | null;
  profiles?: {
    full_name?: string;
  };
}

interface TicketDetails {
  id: string;
  ticket_number: string;
  qr_code: string;
  status: string;
  event_id: string;
  user_id: string;
  seat_number: string;
  profiles?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventWithProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{id: string} | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Check auth
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          // Redirect to auth with return URL
          console.log(`User not logged in, redirecting to auth with return URL: /event/${id}`);
          navigate("/auth", { 
            state: { 
              returnTo: `/event/${id}`,
              message: "Please log in to view event details" 
            },
            replace: false // Don't replace history entry so back button still works
          });
          return;
        }
        
        console.log('User is authenticated:', currentUser.id);
        
        setUser(currentUser);
        
        // Check if admin
        const session = await AuthService.getSession();
        const isUserAdmin = session?.user?.user_metadata?.role === 'admin';
        setIsAdmin(isUserAdmin);

        // Load initial data
        await refreshEventData();
      } catch (error) {
        console.error("Failed to load event details:", error);
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Function to refresh all event data
    const refreshEventData = async () => {
      if (!id) return;
      
      try {
        // Load event details
        const eventData = await EventService.getEventById(id);
        setEvent(eventData);
        
        // Load booked seats
        const bookedSeatsData = await EventService.getBookedSeats(id);
        setBookedSeats(bookedSeatsData);

        // Load tickets if admin
        if (isAdmin) {
          const ticketData = await TicketService.getEventTickets(id);
          setTickets(ticketData);
        }
      } catch (error) {
        console.error("Failed to refresh event data:", error);
      }
    };
    
    init();

    // Set up real-time subscription for tickets
    const ticketsSubscription = supabase
      .channel('tickets-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `event_id=eq.${id}`
        },
        () => {
          refreshEventData();
        }
      )
      .subscribe();

    // Set up real-time subscription for event updates
    const eventsSubscription = supabase
      .channel('events-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${id}`
        },
        () => {
          refreshEventData();
        }
      )
      .subscribe();

    // Also set up polling as a fallback
    const refreshInterval = setInterval(refreshEventData, 10000); // 10 seconds
    
    return () => {
      clearInterval(refreshInterval);
      ticketsSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
    };
  }, [id, navigate, toast, isAdmin]);

  const handleBookTicket = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book tickets",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    if (!event) return;
    
    if (!selectedSeat || selectedSeat === "") {
      toast({
        title: "Seat Required",
        description: "Please select a seat before booking",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get latest event data
      const latestEvent = await EventService.getEventById(id!);
      if (!latestEvent || latestEvent.available_seats <= 0) {
        toast({
          title: "Sold Out",
          description: "Sorry, this event is sold out",
          variant: "destructive"
        });
        setEvent(latestEvent);
        return;
      }
      
      // Get latest booked seats
      const latestBookedSeats = await EventService.getBookedSeats(id!);
      if (latestBookedSeats.includes(selectedSeat)) {
        toast({
          title: "Seat Unavailable",
          description: "This seat was just taken by another user. Please select a different seat.",
          variant: "destructive"
        });
        setBookedSeats(latestBookedSeats);
        return;
      }
      
      // Book ticket
      console.log('Attempting to book ticket with data:', {
        event_id: event.id,
        user_id: user.id,
        price: Number(event.price),
        seat_number: selectedSeat
      });
      
      const ticketResponse = await TicketService.bookTicket({
        event_id: event.id,
        user_id: user.id,
        price: Number(event.price),
        seat_number: selectedSeat
      });
      
      if (!ticketResponse) {
        throw new Error('Failed to book ticket - no ticket returned');
      }
      
      console.log('Ticket booked successfully:', ticketResponse);
      
      // Extract the ticket details without the eventInfo property
      const { eventInfo, ...ticketDetails } = ticketResponse;
      setTicketDetails(ticketDetails as TicketDetails);
      setBookingConfirmed(true);
      
      // Add the newly booked seat to the booked seats array
      setBookedSeats([...latestBookedSeats, selectedSeat]);
      
      // Update local event state with the latest seat count from the response, if available
      if (eventInfo && typeof eventInfo.available_seats === 'number') {
        console.log('Updating available seats from response:', eventInfo.available_seats);
        setEvent({
          ...latestEvent,
          available_seats: eventInfo.available_seats
        });
      } else {
        // Fall back to decrementing by 1
        console.log('No seat info in response, using default decrement');
        setEvent({
          ...latestEvent,
          available_seats: latestEvent.available_seats - 1
        });
      }
      
      toast({
        title: "Success",
        description: "Ticket booked successfully"
      });
    } catch (error) {
      console.error("Failed to book ticket:", error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book ticket. Please try again.",
        variant: "destructive"
      });
      
      // Refresh event details and booked seats in case of error
      try {
        const eventData = await EventService.getEventById(id!);
        setEvent(eventData);
        const bookedSeatsData = await EventService.getBookedSeats(id!);
        setBookedSeats(bookedSeatsData);
      } catch (refreshError) {
        console.error("Failed to refresh data after booking error:", refreshError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
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
  
  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)} className="gradient-primary text-white border-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={isAdmin ? "admin" : user ? "user" : undefined} />
      
      {/* Event Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-2">
              <Badge className="mb-3 gradient-primary text-white border-0">
                {event.status === 'upcoming' ? 'Upcoming' : event.status === 'active' ? 'Active' : 'Closed'}
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              
              <div className="flex flex-wrap gap-3 sm:gap-6 mb-6 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">{formatTime(event.event_date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{event.venue}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
                <Button 
                  className="gradient-primary text-white border-0 text-sm sm:text-base"
                  onClick={() => {
                    setSelectedSeat(undefined);
                    setIsBookingDialogOpen(true);
                  }}
                  disabled={event.available_seats <= 0 || isAdmin}
                >
                  <TicketIcon className="mr-1 sm:mr-2 h-4 w-4" />
                  {event.available_seats > 0 ? 'Book Ticket' : 'Sold Out'}
                </Button>
                
                <Button variant="outline" className="text-sm sm:text-base">
                  <Share2 className="mr-1 sm:mr-2 h-4 w-4" />
                  Share
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                    className="text-sm sm:text-base"
                  >
                    <BarChart className="mr-1 sm:mr-2 h-4 w-4" />
                    Manage
                  </Button>
                )}
              </div>
            </div>
            
            <Card className="lg:mt-0 mt-2">
              <CardHeader className="pb-2">
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Important information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">${Number(event.price).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Available Seats</span>
                    <Badge variant={event.available_seats > 0 ? "outline" : "destructive"}>
                      {event.available_seats} / {event.total_seats}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant="outline" 
                      className={
                        event.status === 'upcoming' 
                          ? 'text-blue-500 border-blue-500' 
                          : event.status === 'active' 
                            ? 'text-green-500 border-green-500' 
                            : 'text-red-500 border-red-500'
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Organizer</span>
                    <span className="truncate max-w-[150px] text-right">{event.profiles?.full_name || 'Event Organizer'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Event Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="details">
          <TabsList className="mb-8">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            {isAdmin && <TabsTrigger value="attendees">Attendees</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="details" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {event.description ? (
                    <p>{event.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description provided for this event.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Event Check-in</h3>
                      <p className="text-muted-foreground">Doors open 30 minutes before the event starts. Please bring your ticket for seamless entry.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Amenities</h3>
                      <p className="text-muted-foreground">Refreshments will be available for purchase at the venue.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Cancellation Policy</h3>
                      <p className="text-muted-foreground">Tickets can be refunded up to 24 hours before the event start time.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Event Location</CardTitle>
                <CardDescription>{event.venue}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && 
                   import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' ? (
                    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                      <Map
                        defaultZoom={15}
                        defaultCenter={{ lat: event.latitude || 0, lng: event.longitude || 0 }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Marker
                          position={{ lat: event.latitude || 0, lng: event.longitude || 0 }}
                          title={event.venue}
                        />
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-center">
                        Map view unavailable. Please configure your Google Maps API key.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-muted-foreground">{event.venue}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Getting There</h3>
                    <p className="text-muted-foreground">
                      You can use the interactive map above to get directions to the venue.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`, '_blank');
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="attendees">
              <Card>
                <CardHeader>
                  <CardTitle>Attendees</CardTitle>
                  <CardDescription>People who have booked tickets for this event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4">
                      <h3 className="text-lg font-medium">
                        {event.total_seats - event.available_seats} / {event.total_seats} Tickets Booked
                      </h3>
                      <Button variant="outline" size="sm">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Export List
                      </Button>
                    </div>
                    
                    {tickets?.length > 0 ? (
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {ticket.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{ticket.profiles?.full_name || 'Anonymous'}</h4>
                                <p className="text-sm text-muted-foreground">{ticket.profiles?.email || 'No email provided'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge variant={ticket.status === 'booked' ? 'default' : 'secondary'}>
                                {ticket.status}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {ticket.seat_number || 'No seat'}
                              </Badge>
                              <Button variant="ghost" size="sm" title="View QR Code">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No tickets booked yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {!bookingConfirmed ? (
            <>
              <DialogHeader>
                <DialogTitle>Book Event Ticket</DialogTitle>
                <DialogDescription>
                  Review the details before confirming your booking
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Event</h3>
                    <p className="font-medium">{event.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                    <p>{formatDate(event.event_date)}</p>
                    <p>{formatTime(event.event_date)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Venue</h3>
                    <p>{event.venue}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                    <p className="font-medium">${Number(event.price).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Select Your Seat</h3>
                  <SeatSelector 
                    totalRows={4}
                    seatsPerRow={8}
                    bookedSeats={bookedSeats}
                    onSelectSeat={setSelectedSeat}
                    selectedSeat={selectedSeat}
                  />
                  {selectedSeat ? (
                    <p className="text-center mt-2 text-sm font-medium">Selected Seat: {selectedSeat}</p>
                  ) : (
                    <p className="text-center mt-2 text-sm text-muted-foreground">Please select a seat</p>
                  )}
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Important Notes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Tickets are non-transferable</li>
                    <li>• Please bring ID for verification</li>
                    <li>• Arrive 15 minutes before event starts</li>
                  </ul>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="gradient-primary text-white border-0" 
                  onClick={handleBookTicket}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Booking Confirmed!</DialogTitle>
                <DialogDescription>
                  Your ticket has been successfully booked
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="bg-white p-2 rounded-md mb-4">
                  <QRCodeCanvas 
                    value={ticketDetails?.qr_code || 'invalid'} 
                    size={200} 
                    level="H"
                  />
                </div>
                
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl">{ticketDetails?.ticket_number}</h3>
                  <p className="text-muted-foreground">Ticket ID</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Event</h3>
                    <p className="font-medium">{event.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                    <p>{formatDate(event.event_date)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Seat</h3>
                    <p className="font-medium">{ticketDetails?.seat_number}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                    <p className="font-medium">${Number(event.price).toFixed(2)}</p>
                  </div>
                </div>
                
                <Badge className="gradient-primary text-white border-0">
                  Ticket Confirmed
                </Badge>
              </div>
              
              <DialogFooter>
                <Button 
                  className="w-full gradient-primary text-white border-0" 
                  onClick={() => {
                    setIsBookingDialogOpen(false);
                    setBookingConfirmed(false);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetails;
