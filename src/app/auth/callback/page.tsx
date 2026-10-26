'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { User } from '@/lib/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    async function handleAuth() {
      try {
        if (!supabase) {
          router.replace('/dashboard');
          return;
        }

        // 1. Check if PKCE code parameter exists in search
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          if (code) {
            try {
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (!exchangeError && exchangeData.session?.user) {
                const u = exchangeData.session.user;
                const isAdmin = u.email?.toLowerCase().includes('admin') || u.email?.toLowerCase().includes('kevin');
                const mappedUser: User = {
                  id: u.id,
                  name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
                  email: u.email || '',
                  image: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
                  role: isAdmin ? 'admin' : 'user',
                  provider: 'google',
                  createdAt: u.created_at
                };
                localStorage.setItem('ai_kevin_user', JSON.stringify(mappedUser));
                setStatus('success');
                setTimeout(() => {
                  router.replace(isAdmin ? '/admin' : '/dashboard');
                }, 600);
                return;
              }
            } catch (exchangeErr) {
              console.warn('PKCE exchange error, trying getSession fallback:', exchangeErr);
            }
          }
        }

        // 2. Check getSession() for hash tokens or active session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Callback error:', error);
          setStatus('error');
          setTimeout(() => router.replace('/login'), 2000);
          return;
        }

        if (data.session?.user) {
          const u = data.session.user;
          const isAdmin = u.email?.toLowerCase().includes('admin') || u.email?.toLowerCase().includes('kevin');
          const mappedUser: User = {
            id: u.id,
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
            email: u.email || '',
            image: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
            role: isAdmin ? 'admin' : 'user',
            provider: 'google',
            createdAt: u.created_at
          };
          localStorage.setItem('ai_kevin_user', JSON.stringify(mappedUser));
          setStatus('success');
          setTimeout(() => {
            router.replace(isAdmin ? '/admin' : '/dashboard');
          }, 600);
        } else {
          // Listen to state change
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
              const u = session.user;
              const isAdmin = u.email?.toLowerCase().includes('admin') || u.email?.toLowerCase().includes('kevin');
              const mappedUser: User = {
                id: u.id,
                name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
                email: u.email || '',
                image: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
                role: isAdmin ? 'admin' : 'user',
                provider: 'google',
                createdAt: u.created_at
              };
              localStorage.setItem('ai_kevin_user', JSON.stringify(mappedUser));
              setStatus('success');
              setTimeout(() => {
                router.replace(isAdmin ? '/admin' : '/dashboard');
              }, 600);
            }
          });

          // Timeout fallback
          setTimeout(() => {
            authListener.subscription.unsubscribe();
            router.replace('/dashboard');
          }, 3000);
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        router.replace('/dashboard');
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center p-0.5 mb-6 shadow-xl shadow-[#D4AF37]/20">
        <div className="w-full h-full bg-[#0E131F] rounded-[14px] flex items-center justify-center">
          {status === 'success' ? (
            <CheckCircle2 className="w-8 h-8 text-[#D4AF37] animate-bounce" />
          ) : (
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          )}
        </div>
      </div>
      <h2 className="text-xl font-bold font-heading mb-2 text-white">
        {status === 'success' ? 'เข้าสู่ระบบสำเร็จ กำลังพาไปที่แดชบอร์ด...' : 'กำลังยืนยันตัวตนกับ Google...'}
      </h2>
      <p className="text-sm text-gray-400">
        ระบบกำลังประมวลผลข้อมูลบัญชีผู้เรียนของคุณ กรุณารอสักครู่
      </p>
    </div>
  );
}
