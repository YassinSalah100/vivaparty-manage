import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileUpdate = {
  full_name?: string;
  phone?: string;
  email?: string;
};

export const ProfileService = {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profile: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Get admin users
   */
  async getAdminUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (error) throw error;
    return data;
  },

  /**
   * Delete user profile and associated data
   */
  async deleteProfile(userId: string) {
    try {
      // Get user's email before deletion for verification
      const { data: user } = await supabase.auth.getUser();
      const userEmail = user?.user?.email;

      if (!userEmail) {
        throw new Error('User email not found');
      }

      // Delete tickets first
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('user_id', userId);

      if (ticketsError) throw ticketsError;

      // Update events to closed
      const { error: eventsError } = await supabase
        .from('events')
        .update({ status: 'closed' })
        .eq('created_by', userId);

      if (eventsError) throw eventsError;

      // Mark profile as deleted
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          email: null
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Sign out the user
      await supabase.auth.signOut();

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
};
