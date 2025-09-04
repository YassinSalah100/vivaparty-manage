import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Ticket = Tables<'tickets'>;
export type TicketInsert = {
  event_id: string;
  user_id: string;
  price: number;
  seat_number?: string;
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
      // First, check if the seat is already booked
      if (ticket.seat_number) {
        const { data: existingTickets, error: checkError } = await supabase
          .from('tickets')
          .select('id, seat_number')
          .eq('event_id', ticket.event_id)
          .eq('seat_number', ticket.seat_number)
          .in('status', ['booked', 'used']);
          
        if (checkError) throw checkError;
        
        if (existingTickets && existingTickets.length > 0) {
          throw new Error('This seat has already been booked');
        }
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
      const { data: newTicket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          ...ticket,
          booking_date: new Date().toISOString(),
          status: 'booked',
          ticket_number: `TKT-${Date.now()}`,
          qr_code: `EVENT-${ticket.event_id}-USER-${ticket.user_id}-${Date.now()}`
        }])
        .select('*')
        .single();

      if (ticketError) throw ticketError;

      // Then update the event's available seats
      const { data: updatedEvent, error: updateError } = await supabase
        .from('events')
        .update({ 
          available_seats: eventData.available_seats - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.event_id)
        .select()
        .single();

      if (updateError) {
        // If updating event fails, delete the ticket we just created
        await supabase
          .from('tickets')
          .delete()
          .eq('id', newTicket.id);
          
        throw updateError;
      }

      return newTicket;

      // Then book the ticket
      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            ...ticket,
            ticket_number: `TKT-${Date.now()}`, // This will be overridden by the trigger
            status: 'booked',
            qr_code: `EVENT-${ticket.event_id}-USER-${ticket.user_id}-${Date.now()}`
          }
        ])
        .select()
        .single();

      if (error) {
        // If there was an error creating the ticket, revert the seat count
        await supabase
          .from('events')
          .update({ available_seats: eventData.available_seats })
          .eq('id', ticket.event_id);
          
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error booking ticket:", error);
      throw error;
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
