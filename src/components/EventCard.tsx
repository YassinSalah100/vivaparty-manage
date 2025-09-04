import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Event {
  id: number | string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  image: string;
  availableSeats: number;
  totalSeats: number;
  category: string;
  rating: number;
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSeatStatus = () => {
    const percentage = (event.availableSeats / event.totalSeats) * 100;
    if (percentage > 50) return { color: "success", text: "Available" };
    if (percentage > 20) return { color: "warning", text: "Limited" };
    return { color: "destructive", text: "Few Left" };
  };

  const seatStatus = getSeatStatus();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            {event.image && event.image !== '/placeholder.svg' ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <Calendar className="h-12 w-12 text-primary/30" />
            )}
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="gradient-primary text-white border-0">
              {event.category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {event.rating}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-lg font-bold text-primary">${event.price}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              {event.time}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {event.venue}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1 text-primary" />
              {event.availableSeats} / {event.totalSeats} seats
            </div>
            <Badge 
              variant="outline" 
              className={`border-${seatStatus.color} text-${seatStatus.color}`}
            >
              {seatStatus.text}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/event/${event.id}`)}
          >
            View Details
          </Button>
          <Button 
            className="flex-1 gradient-primary text-white border-0"
            onClick={() => navigate(`/event/${event.id}`)}
          >
            Book Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};