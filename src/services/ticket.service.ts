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
    // First check if seats are available
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('available_seats, price')
      .eq('id', ticket.event_id)
      .single();

    if (eventError) throw eventError;
    
    if (eventData.available_seats <= 0) {
      throw new Error('No seats available for this event');
    }

    // Book the ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ...ticket,
          ticket_number: `TKT-${Date.now()}`, // This will be overridden by the trigger
          status: 'booked'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
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
