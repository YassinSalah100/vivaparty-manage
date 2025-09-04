-- Create a function to update event's available_seats
CREATE OR REPLACE FUNCTION update_event_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- If a ticket is being inserted
  IF (TG_OP = 'INSERT') THEN
    -- Decrease available seats
    UPDATE events
    SET available_seats = available_seats - 1
    WHERE id = NEW.event_id AND available_seats > 0;
    
  -- If a ticket is being updated
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If status is changed to cancelled, increase available seats
    IF (OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
      UPDATE events
      SET available_seats = available_seats + 1
      WHERE id = NEW.event_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS tickets_update_event_seats ON tickets;

-- Create trigger
CREATE TRIGGER tickets_update_event_seats
  AFTER INSERT OR UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_event_seats();

-- Function to ensure available_seats stays in sync
CREATE OR REPLACE FUNCTION sync_event_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate actual available seats
  UPDATE events
  SET available_seats = total_seats - (
    SELECT COUNT(*)
    FROM tickets
    WHERE event_id = NEW.event_id
    AND status NOT IN ('cancelled')
  )
  WHERE id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS tickets_sync_event_seats ON tickets;

-- Create trigger
CREATE TRIGGER tickets_sync_event_seats
  AFTER INSERT OR UPDATE OR DELETE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION sync_event_seats();

-- Function to prevent overbooking
CREATE OR REPLACE FUNCTION prevent_overbooking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are available seats
  IF (SELECT available_seats FROM events WHERE id = NEW.event_id) <= 0 THEN
    RAISE EXCEPTION 'No seats available for this event';
  END IF;
  
  -- Check if seat is already booked
  IF EXISTS (
    SELECT 1
    FROM tickets
    WHERE event_id = NEW.event_id
    AND seat_number = NEW.seat_number
    AND status NOT IN ('cancelled')
    AND id != COALESCE(NEW.id, -1)
  ) THEN
    RAISE EXCEPTION 'This seat is already booked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS tickets_prevent_overbooking ON tickets;

-- Create trigger
CREATE TRIGGER tickets_prevent_overbooking
  BEFORE INSERT OR UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION prevent_overbooking();
