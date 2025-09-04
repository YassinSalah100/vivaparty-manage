import { supabase } from '@/integrations/supabase/client';

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'admin' | 'user';
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export const AuthService = {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, fullName, phone, role = 'user' }: SignUpCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Update user password
   */
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
    return data;
  }
};
