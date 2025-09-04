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
  }
};
