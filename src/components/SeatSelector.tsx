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
          "w-8 h-8 p-0 m-1",
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
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full bg-muted p-2 rounded-md flex items-center justify-center mb-4">
        <div className="w-1/2 h-2 bg-primary rounded-md"></div>
      </div>
      <div className="text-center text-sm text-muted-foreground mb-4">Screen</div>
      
      <div className="grid gap-y-2">
        {rows.map(row => (
          <div key={row} className="flex items-center">
            <span className="w-6 text-center font-medium">{row}</span>
            <div className="flex flex-wrap">
              {Array.from({ length: seatsPerRow }, (_, i) => renderSeat(row, i + 1))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-8 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-muted mr-2"></div>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm border border-input mr-2"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-sm bg-primary mr-2"></div>
          <span className="text-sm">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
