'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password?: string, name?: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; phone?: string; bio?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  updateUserProfile: async () => {},
  logout: async () => {},
  isAdmin: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync Supabase Auth listener
  useEffect(() => {
    // If landed on localhost or non-callback path with OAuth code or hash tokens, redirect to production callback
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hasAuthCode = window.location.search.includes('code=');
      const hasAuthHash = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');

      if (isLocal && (hasAuthCode || hasAuthHash)) {
        const prodUrl = 'https://ai-kevin-booking.vercel.app';
        window.location.replace(`${prodUrl}/auth/callback${window.location.search}${window.location.hash}`);
        return;
      }

      if (!isLocal && (hasAuthCode || hasAuthHash) && window.location.pathname !== '/auth/callback') {
        window.location.replace(`/auth/callback${window.location.search}${window.location.hash}`);
        return;
      }
    }

    // 1. If Supabase is active, listen to auth state changes
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const isAdminUser = u.email?.toLowerCase().includes('admin') || u.email?.toLowerCase().includes('kevin');
          const mappedUser: User = {
            id: u.id,
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
            email: u.email || '',
            image: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
            role: isAdminUser ? 'admin' : 'user',
            provider: u.app_metadata?.provider === 'google' ? 'google' : 'credentials',
            createdAt: u.created_at
          };
          setUser(mappedUser);
          localStorage.setItem('ai_kevin_user', JSON.stringify(mappedUser));
        } else {
          checkLocalSession();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const u = session.user;
          const isAdminUser = u.email?.toLowerCase().includes('admin') || u.email?.toLowerCase().includes('kevin');
          const mappedUser: User = {
            id: u.id,
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
            email: u.email || '',
            image: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
            role: isAdminUser ? 'admin' : 'user',
            provider: u.app_metadata?.provider === 'google' ? 'google' : 'credentials',
            createdAt: u.created_at
          };
          setUser(mappedUser);
          localStorage.setItem('ai_kevin_user', JSON.stringify(mappedUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('ai_kevin_user');
        } else {
          // If no session from Supabase (e.g. credentials admin login), check local session instead of wiping
          checkLocalSession();
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      checkLocalSession();
      setLoading(false);
    }
  }, []);

  const checkLocalSession = () => {
    const saved = localStorage.getItem('ai_kevin_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('ai_kevin_user');
      }
    }
  };

  /**
   * Real Google OAuth via Supabase
   */
  const loginWithGoogle = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      let redirectOrigin = 'https://ai-kevin-booking.vercel.app';
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
          redirectOrigin = origin;
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) {
        console.error('Supabase Google OAuth Error:', error);
        throw error;
      }
    } else {
      // Direct prompt fallback if Supabase keys not set yet
      const email = prompt('กรุณากรอกบัญชี Gmail / Google ของคุณ เพื่อจำลองการ Login ด้วยข้อมูลจริง:');
      if (email && email.includes('@')) {
        const name = prompt('กรุณากรอกชื่อของคุณ:') || email.split('@')[0];
        const googleUser: User = {
          id: `google-${Date.now()}`,
          name,
          email,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          role: email.includes('admin') || email.includes('kevin') ? 'admin' : 'user',
          provider: 'google',
          createdAt: new Date().toISOString()
        };
        setUser(googleUser);
        localStorage.setItem('ai_kevin_user', JSON.stringify(googleUser));
      }
      setLoading(false);
    }
  };

  /**
   * Real Email / Password Sign In & Registration
   */
  const loginWithEmail = async (email: string, password?: string, name?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password, name })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      setUser(data.user);
      localStorage.setItem('ai_kevin_user', JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, name, phone })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');
      }

      setUser(data.user);
      localStorage.setItem('ai_kevin_user', JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; bio?: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...data })
      });
      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.error || 'อัปเดตโปรไฟล์ไม่สำเร็จ');
      }

      setUser(resData.user);
      localStorage.setItem('ai_kevin_user', JSON.stringify(resData.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('ai_kevin_user');
  };

  const isAdmin = user?.role === 'admin' || user?.email.includes('admin') || user?.email.includes('kevin') || false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle, 
      loginWithEmail, 
      registerWithEmail, 
      updateUserProfile, 
      logout, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
