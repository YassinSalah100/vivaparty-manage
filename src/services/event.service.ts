import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Event = Tables<'events'>;
export type EventInsert = {
  title: string;
  description?: string;
  venue: string;
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
   * Create a new event
   */
  async createEvent(event: EventInsert) {
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          ...event,
          available_seats: event.total_seats
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
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
