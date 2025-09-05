import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SeatSelectorProps {
  totalRows: number;
  seatsPerRow: number;
  bookedSeats: string[];
  onSelectSeat: (seat: string) => void;
  selectedSeat?: string;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  totalRows,
  seatsPerRow,
  bookedSeats,
  onSelectSeat,
  selectedSeat
}) => {
  // Add internal state to track if the selected seat became booked while we were selecting
  const [internalBookedSeats, setInternalBookedSeats] = useState<string[]>(bookedSeats);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Update internal booked seats when props change
  useEffect(() => {
    setInternalBookedSeats(bookedSeats);
    
    // If our selected seat is now booked by someone else, clear the selection
    if (selectedSeat && bookedSeats.includes(selectedSeat)) {
      onSelectSeat('');
    }
  }, [bookedSeats, selectedSeat, onSelectSeat]);
  
  const rows = Array.from({ length: totalRows }, (_, i) => String.fromCharCode(65 + i)); // A, B, C, ...
  
  const renderSeat = (row: string, seatNum: number) => {
    const seatId = `${row}${seatNum}`;
    const isBooked = internalBookedSeats.includes(seatId);
    const isSelected = selectedSeat === seatId;
    
    return (
      <Button
        key={seatId}
        variant="outline"
        size="sm"
        className={cn(
          "w-6 h-6 sm:w-8 sm:h-8 p-0 m-0.5 sm:m-1 text-xs sm:text-sm",
          isBooked ? "bg-muted text-muted-foreground cursor-not-allowed" : "hover:bg-primary/20",
          isSelected ? "bg-primary text-primary-foreground" : ""
        )}
        disabled={isBooked}
        onClick={() => onSelectSeat(seatId)}
      >
        {seatId}
      </Button>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 max-w-full overflow-x-auto relative pb-16 sm:pb-0">
      <div className="w-full bg-muted p-1 sm:p-2 rounded-md flex items-center justify-center mb-2 sm:mb-4">
        <div className="w-1/2 h-1 sm:h-2 bg-primary rounded-md"></div>
      </div>
      <div className="text-center text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">Screen</div>
      
      <div className="grid gap-y-1 sm:gap-y-2 overflow-x-auto pb-2 w-full max-w-full">
        <div className="flex justify-center min-w-max">
          {rows.map(row => (
            <div key={row} className="flex flex-col items-center mr-1">
              <span className="w-6 h-6 text-center font-medium text-xs sm:text-sm">{row}</span>
              <div className="flex flex-col">
                {Array.from({ length: seatsPerRow }, (_, i) => renderSeat(row, i + 1))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-8 mt-2 sm:mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-muted mr-1 sm:mr-2"></div>
          <span className="text-xs sm:text-sm">Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border border-input mr-1 sm:mr-2"></div>
          <span className="text-xs sm:text-sm">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-primary mr-1 sm:mr-2"></div>
          <span className="text-xs sm:text-sm">Selected</span>
        </div>
      </div>
      
      {/* Mobile-only sticky booking confirmation button */}
      {isMobile && selectedSeat && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-background border-t border-border shadow-lg z-50">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Seat: {selectedSeat}</div>
          </div>
          <Button 
            className="w-full gradient-primary text-white border-0" 
            onClick={() => {
              // Close the modal on mobile by clicking outside
              const dialogBackdrop = document.querySelector('[data-state="open"][role="dialog"]');
              if (dialogBackdrop) {
                const closeButton = dialogBackdrop.querySelector('[data-state="open"] button[aria-label="Close"]');
                if (closeButton instanceof HTMLElement) {
                  closeButton.click();
                }
              }
            }}
          >
            Proceed to Booking
          </Button>
        </div>
      )}
    </div>
  );
};

export default SeatSelector;
