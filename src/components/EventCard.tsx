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
  available_seats: number;
  total_seats: number;
  category: string;
  rating: number;
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  
  const handleEventClick = () => {
    // Always navigate to event details, the booking will be handled in the event details page
    navigate(`/event/${event.id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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

          <div className="flex items-center justify-between flex-wrap gap-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
              <span className="truncate">{event.available_seats} / {event.total_seats} seats</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${
                event.available_seats > event.total_seats * 0.5 
                  ? 'border-green-500 text-green-600' 
                  : event.available_seats > event.total_seats * 0.2 
                    ? 'border-yellow-500 text-yellow-600' 
                    : 'border-red-500 text-red-600'
              } whitespace-nowrap`}
            >
              {event.available_seats > 0 ? `${event.available_seats} seats left` : 'Sold out'}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleEventClick}
          >
            View Details
          </Button>
          <Button 
            className="flex-1 gradient-primary text-white border-0"
            onClick={handleEventClick}
          >
            Book Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};