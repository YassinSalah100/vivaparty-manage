-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS tickets_prevent_overbooking ON tickets;
DROP TRIGGER IF EXISTS tickets_update_event_seats ON tickets;
DROP TRIGGER IF EXISTS tickets_sync_event_seats ON tickets;
DROP FUNCTION IF EXISTS prevent_overbooking();
DROP FUNCTION IF EXISTS update_event_seats();
DROP FUNCTION IF EXISTS sync_event_seats();

-- Create function to prevent overbooking
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
    AND (NEW.id IS NULL OR id != NEW.id)
  ) THEN
    RAISE EXCEPTION 'This seat is already booked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update available seats
CREATE OR REPLACE FUNCTION update_event_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- If a ticket is being inserted
  IF (TG_OP = 'INSERT') THEN
    -- Decrease available seats
    UPDATE events
    SET available_seats = available_seats - 1,
        updated_at = NOW()
    WHERE id = NEW.event_id AND available_seats > 0;
    
  -- If a ticket is being updated
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If status is changed to cancelled, increase available seats
    IF (OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
      UPDATE events
      SET available_seats = available_seats + 1,
          updated_at = NOW()
      WHERE id = NEW.event_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure available_seats stays in sync with booked tickets
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
  ),
  updated_at = NOW()
  WHERE id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent overbooking
CREATE TRIGGER tickets_prevent_overbooking
  BEFORE INSERT OR UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION prevent_overbooking();

-- Create trigger to update event seats
CREATE TRIGGER tickets_update_event_seats
  AFTER INSERT OR UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_event_seats();

-- Create trigger to sync event seats (runs after other triggers)
CREATE TRIGGER tickets_sync_event_seats
  AFTER INSERT OR UPDATE OR DELETE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION sync_event_seats();

-- Run a one-time synchronization to ensure all events have correct available_seats
UPDATE events
SET available_seats = e.total_seats - COALESCE(t.booked_count, 0),
    updated_at = NOW()
FROM events e
LEFT JOIN (
  SELECT event_id, COUNT(*) as booked_count
  FROM tickets
  WHERE status NOT IN ('cancelled')
  GROUP BY event_id
) t ON e.id = t.event_id;
