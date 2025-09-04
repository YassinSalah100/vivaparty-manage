-- Drop existing function and trigger
DROP TRIGGER IF EXISTS tickets_prevent_overbooking ON tickets;
DROP FUNCTION IF EXISTS prevent_overbooking();

-- Create the fixed function
CREATE OR REPLACE FUNCTION prevent_overbooking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are available seats
  IF (SELECT available_seats FROM events WHERE id = NEW.event_id) <= 0 THEN
    RAISE EXCEPTION 'No seats available for this event';
  END IF;
  
  -- Check if seat is already booked (fixed type mismatch with COALESCE)
  IF EXISTS (
    SELECT 1
    FROM tickets
    WHERE event_id = NEW.event_id
    AND seat_number = NEW.seat_number
    AND status NOT IN ('cancelled')
    AND (NEW.id IS NULL OR id != NEW.id)
  ) THEN
    RAISE EXCEPTION 'This seat is already booked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER tickets_prevent_overbooking
  BEFORE INSERT OR UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION prevent_overbooking();
