import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Event = Tables<'events'>;
export type EventInsert = {
  title: string;
  description?: string;
  venue: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  price: number;
  total_seats: number;
  available_seats?: number;
  image_url?: string;
  created_by: string;
  status?: 'upcoming' | 'active' | 'closed';
};

export const EventService = {
  /**
   * Get all events with optional filtering
   */
  async getEvents(filter?: {
    status?: 'upcoming' | 'active' | 'closed';
    limit?: number;
    orderBy?: string;
  }) {
    let query = supabase
      .from('events')
      .select('*, profiles(full_name)');

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.orderBy) {
      query = query.order(filter.orderBy);
    } else {
      query = query.order('event_date', { ascending: true });
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get a single event by ID
   */
  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(full_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get booked seats for an event
   */
  async getBookedSeats(eventId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('seat_number')
      .eq('event_id', eventId)
      .in('status', ['booked', 'used'])
      .not('seat_number', 'is', null);

    if (error) throw error;
    // Filter out any null values and return unique seat numbers
    const seatNumbers = data
      .filter(ticket => ticket.seat_number !== null)
      .map(ticket => ticket.seat_number);
      
    return seatNumbers as string[];
  },

  /**
   * Create a new event
   */
  async createEvent(event: EventInsert) {
    try {
      // Check if user has permission to create events
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', event.created_by)
        .single();

      if (!userProfile || userProfile.role !== 'admin') {
        throw new Error('You do not have permission to create events');
      }

      // Add default values and sanitize data
      const eventData = {
        ...event,
        available_seats: event.total_seats,
        status: event.status || 'upcoming',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('An event with this title already exists');
        }
        if (error.code === '23503') {
          throw new Error('Invalid user ID');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Event creation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create event');
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, event: Partial<EventInsert>) {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Upload event image
   */
  async uploadEventImage(file: File, eventId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('event-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
