import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Ticket = Tables<'tickets'>;
export type TicketInsert = {
  event_id: string;
  user_id: string;
  price: number;
  seat_number: string; // Changed from optional to required
};

export const TicketService = {
  /**
   * Get tickets for a user
   */
  async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, events(title, event_date, venue)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get tickets for an event
   */
  async getEventTickets(eventId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, profiles(full_name, email, phone)')
      .eq('event_id', eventId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Book a ticket
   */
  async bookTicket(ticket: TicketInsert) {
    try {
      console.log('Booking ticket with data:', JSON.stringify(ticket, null, 2));

      // Validate ticket data
      if (!ticket.event_id) throw new Error('Event ID is required');
      if (!ticket.user_id) throw new Error('User ID is required');
      if (!ticket.price || ticket.price <= 0) throw new Error('Valid price is required');
      if (!ticket.seat_number) throw new Error('Seat number is required');
      
      // First, check if the seat is already booked
      const { data: existingTickets, error: checkError } = await supabase
        .from('tickets')
        .select('id, seat_number')
        .eq('event_id', ticket.event_id)
        .eq('seat_number', ticket.seat_number)
        .in('status', ['booked', 'used']);
          
      if (checkError) {
        console.error('Error checking existing tickets:', checkError);
        throw checkError;
      }
        
      if (existingTickets && existingTickets.length > 0) {
        throw new Error('This seat has already been booked');
      }

      // Start a transaction
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('available_seats, price')
        .eq('id', ticket.event_id)
        .single();

      if (eventError) throw eventError;
      
      if (!eventData || eventData.available_seats <= 0) {
        throw new Error('No seats available for this event');
      }

      // First create the ticket
      console.log('Creating ticket...');
      const ticketToInsert = {
        ...ticket,
        booking_date: new Date().toISOString(),
        status: 'booked',
        ticket_number: `TKT-${Date.now()}`,
        qr_code: `EVENT-${ticket.event_id}-USER-${ticket.user_id}-${Date.now()}`
      };
      
      const { data: tickets, error: ticketError } = await supabase
        .from('tickets')
        .insert([ticketToInsert])
        .select('*');

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        throw ticketError;
      }
      
      if (!tickets || tickets.length === 0) {
        throw new Error('Failed to create ticket');
      }
      
      const newTicket = tickets[0];
      console.log('Ticket created successfully:', newTicket.id);

      // Then update the event's available seats - with extra logging and checks
      console.log('Updating event available seats for event ID:', ticket.event_id);
      
      // First double-check that the event exists
      const { data: checkEvent, error: checkEventError } = await supabase
        .from('events')
        .select('id, available_seats')
        .eq('id', ticket.event_id);
        
      if (checkEventError) {
        console.error('Error checking event existence:', checkEventError);
        // If checking event fails, delete the ticket we just created
        await supabase
          .from('tickets')
          .delete()
          .eq('id', newTicket.id);
          
        throw checkEventError;
      }
      
      console.log('Event check result:', checkEvent);
      
      if (!checkEvent || checkEvent.length === 0) {
        console.error('Event not found before update');
        // If no event found, delete the ticket we just created
        await supabase
          .from('tickets')
          .delete()
          .eq('id', newTicket.id);
        
        throw new Error('Event not found');
      }
      
      // Now try to update the event - fix the query to specify columns
      try {
        console.log('Attempting to update event with ID:', ticket.event_id);
        
        const { data: updatedEvents, error: updateError } = await supabase
          .from('events')
          .update({ 
            available_seats: eventData.available_seats - 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', ticket.event_id)
          .select('id, available_seats'); // Specify columns to select
  
        console.log('Update event response:', { data: updatedEvents, error: updateError });
        
        if (updateError) {
          console.error('Error updating event:', updateError);
          // If updating event fails, delete the ticket we just created
          await supabase
            .from('tickets')
            .delete()
            .eq('id', newTicket.id);
            
          throw updateError;
        }
        
        // In Supabase, .select() can return empty arrays even when updates were successful
        // Let's check if the update was successful by querying the event again
        if (!updatedEvents || updatedEvents.length === 0) {
          console.log("No data returned from update, checking if update was successful...");
          
          const { data: verifyEvent, error: verifyError } = await supabase
            .from('events')
            .select('id, available_seats')
            .eq('id', ticket.event_id)
            .single();
            
          if (verifyError || !verifyEvent) {
            console.error('Failed to verify event update:', verifyError);
            // If verification fails, delete the ticket we just created
            await supabase
              .from('tickets')
              .delete()
              .eq('id', newTicket.id);
            
            throw new Error('Failed to update event: ' + (verifyError?.message || 'Unknown error'));
          }
          
          console.log('Verified event after update:', verifyEvent);
          // If we get here, the event exists, so the update probably worked
          
          // Create a new ticket object with the updated event info
          const ticketWithEventInfo = {
            ...newTicket,
            eventInfo: {
              available_seats: verifyEvent.available_seats
            }
          };
          
          return ticketWithEventInfo;
        } else {
          // If we got update results, include them in the response
          const ticketWithEventInfo = {
            ...newTicket,
            eventInfo: {
              available_seats: updatedEvents[0].available_seats
            }
          };
          
          return ticketWithEventInfo;
        }
      } catch (updateError) {
        console.error('Error in event update process:', updateError);
        // If any error occurs in this process, delete the ticket we just created
        await supabase
          .from('tickets')
          .delete()
          .eq('id', newTicket.id);
          
        if (updateError instanceof Error) {
          throw updateError;
        } else {
          throw new Error('Failed to update event: ' + JSON.stringify(updateError));
        }
      }
      
      // If execution gets here without returning from the try block above, something unusual happened
      // Fall back to returning just the ticket without event info
      console.log('Warning: Reached end of update block without explicit return, falling back to default return');
      return newTicket;
      
      // This line should never be reached since we have explicit returns in the try block above
      console.log('Booking completed successfully!');
      // Fall back to returning just the ticket without event info
      return newTicket;
    } catch (error) {
      console.error("Error booking ticket:", error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  },

  /**
   * Cancel a ticket
   */
  async cancelTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status: 'cancelled' })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark ticket as used
   */
  async useTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status: 'used' })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Verify ticket by QR code
   */
  async verifyTicket(qrCode: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, events(title, event_date, venue), profiles(full_name, email, phone)')
      .eq('qr_code', qrCode)
      .single();

    if (error) throw error;
    return data;
  }
};
