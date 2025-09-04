import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, TrendingUp, Ticket, ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { StatsCard } from "@/components/StatsCard";
import heroImage from "@/assets/hero-events.jpg";

const Index = () => {
  const [userType, setUserType] = useState<"admin" | "user" | null>(null);

  const featuredEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "2024-03-15",
      time: "09:00 AM",
      venue: "Convention Center",
      price: 299,
      image: "/placeholder.svg",
      availableSeats: 450,
      totalSeats: 500,
      category: "Technology",
      rating: 4.8
    },
    {
      id: 2,
      title: "Digital Marketing Conference",
      date: "2024-03-20",
      time: "10:00 AM",
      venue: "Business Hub",
      price: 199,
      image: "/placeholder.svg",
      availableSeats: 280,
      totalSeats: 300,
      category: "Business",
      rating: 4.6
    },
    {
      id: 3,
      title: "Creative Arts Workshop",
      date: "2024-03-25",
      time: "02:00 PM",
      venue: "Art Gallery",
      price: 99,
      image: "/placeholder.svg",
      availableSeats: 80,
      totalSeats: 100,
      category: "Arts",
      rating: 4.9
    }
  ];

  const stats = [
    { label: "Events Hosted", value: "2,500+", icon: CalendarDays, trend: "+12%" },
    { label: "Happy Attendees", value: "50,000+", icon: Users, trend: "+25%" },
    { label: "Revenue Generated", value: "$2.5M", icon: TrendingUp, trend: "+18%" },
    { label: "Tickets Sold", value: "75,000+", icon: Ticket, trend: "+32%" }
  ];

  if (userType === "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType="admin" />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and analyze performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your latest event activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                      </div>
                      <Badge variant="secondary">{event.availableSeats} seats left</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your events efficiently</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gradient-primary text-white border-0">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Attendees
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (userType === "user") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType="user" />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Discover Amazing Events</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find and book tickets for conferences, workshops, concerts, and more. 
              Join thousands of attendees at memorable events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <Badge className="gradient-accent text-white border-0 mb-4">
                🎉 Trusted by 10,000+ Event Organizers
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your Events, 
                <span className="block text-accent-light">Simplified</span>
              </h1>
              <p className="text-xl text-white/90 max-w-xl">
                Create, manage, and grow your events with EventX Studio. 
                From small workshops to large conferences - we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 shadow-primary"
                  onClick={() => setUserType("admin")}
                >
                  Start as Organizer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => setUserType("user")}
                >
                  Browse Events
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Event Management Platform" 
                className="rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
              />
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Event Professionals</h2>
            <p className="text-muted-foreground">Join thousands of successful event organizers worldwide</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full gradient-primary">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
                <div className="text-success text-sm font-medium">{stat.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Events</h2>
            <p className="text-muted-foreground">Discover upcoming events in your area</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="text-center">
            <Button 
              size="lg" 
              className="gradient-primary text-white border-0"
              onClick={() => setUserType("user")}
            >
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;