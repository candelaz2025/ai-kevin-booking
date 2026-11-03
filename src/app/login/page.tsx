'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { checkSpamEmail } from '@/lib/anti-spam';
import { Sparkles, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Forgot Password state
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await loginWithGoogle();
      // Google OAuth will redirect automatically
    } catch (err: any) {
      console.error('Google login error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Client-side anti-spam check
    const spamCheck = checkSpamEmail(email);
    if (spamCheck.isBlocked) {
      setStatusMessage({ type: 'error', text: spamCheck.reason || 'อีเมลนี้ถูกระงับการใช้งานเพื่อป้องกัน Spam กรุณาใช้อีเมลจริง' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
        if (email.includes('admin') || email.includes('kevin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else if (tab === 'register') {
        // Client-side instant validations
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^\d{9,10}$/.test(cleanPhone)) {
          throw new Error('เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น (9-10 หลัก เช่น 0812345678)');
        }

        if (password.length < 8) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
          throw new Error('รหัสผ่านต้องประกอบด้วยตัวอักษรและตัวเลขผสมกันอย่างน้อย 8 ตัวอักษร');
        }

        await registerWithEmail(email, password, name, phone);

        // Link referral if referred by a friend
        try {
          const storedRef = localStorage.getItem('kevin_ai_referrer') || searchParams.get('ref');
          if (storedRef) {
            await fetch('/api/user/rewards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                action: 'apply_referral',
                refCode: storedRef
              })
            });
          }
        } catch (e) {
          console.warn('Referral sync error:', e);
        }

        if (email.includes('admin') || email.includes('kevin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการทำรายการ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const spamCheck = checkSpamEmail(email);
    if (spamCheck.isBlocked) {
      setStatusMessage({ type: 'error', text: spamCheck.reason || 'อีเมลนี้ถูกระงับการใช้งานเพื่อป้องกัน Spam กรุณาใช้อีเมลจริง' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (forgotStep === 'request') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'request', email })
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage({ 
            type: 'success', 
            text: `รหัสยืนยัน 6 หลักถูกส่งไปยัง ${email} แล้ว ${data.devToken ? `(รหัส: ${data.devToken})` : ''}` 
          });
          if (data.devToken) setResetToken(data.devToken);
          setForgotStep('reset');
        } else {
          setStatusMessage({ type: 'error', text: data.error || 'ส่งคำขอไม่สำเร็จ' });
        }
      } else {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset', email, token: resetToken, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage({ type: 'success', text: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบ' });
          setTab('login');
          setForgotStep('request');
          setPassword('');
        } else {
          setStatusMessage({ type: 'error', text: data.error || 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ' });
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#101c2d] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow orb */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-amber-400/25 border border-amber-400/40 group-hover:scale-105 group-hover:border-amber-400/80 transition-all shrink-0 bg-amber-400/10">
              <img
                src="/assets/logo.png"
                alt="kevinaiagent.tech Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight group-hover:text-amber-400 transition-colors">
              kevinaiagent.tech
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {tab === 'login' && 'ยินดีต้อนรับสู่ระบบเรียน'}
            {tab === 'register' && 'สมัครสมาชิกใหม่'}
            {tab === 'forgot' && 'ลืมรหัสผ่าน / ตั้งรหัสใหม่'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'forgot' 
              ? 'กรอกอีเมลเพื่อรับรหัสยืนยันและตั้งรหัสผ่านใหม่'
              : 'เข้าสู่ระบบเพื่อดูประวัติการจองและลิงก์เข้าห้องเรียนออนไลน์'}
          </p>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className={`p-3.5 rounded-xl text-xs mb-4 flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab switch */}
        {tab !== 'forgot' && (
          <div className="flex bg-slate-900/60 p-1 rounded-xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setTab('login'); setStatusMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setStatusMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Google / Gmail Instant Login Button */}
        {tab !== 'forgot' && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:scale-[1.01] mb-6 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              เข้าสู่ระบบด้วย Gmail / Google
            </button>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase tracking-wider">หรือใช้อีเมล & รหัสผ่าน</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
          </>
        )}

        {/* Main Login / Register form */}
        {tab !== 'forgot' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="สมชาย ใจดี"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    เบอร์โทรศัพท์ * <span className="text-[10px] text-slate-500 font-normal">(กรอกเฉพาะตัวเลข 10 หลัก)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => {
                        // Allow only digits and dashes
                        const val = e.target.value.replace(/[^\d-]/g, '');
                        setPhone(val);
                      }}
                      maxLength={12}
                      placeholder="0812345678"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10 font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">อีเมล *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  รหัสผ่าน * {tab === 'register' && <span className="text-[10px] text-amber-400 font-normal">(ผสมตัวอักษรและตัวเลข 8 ตัวขึ้นไป)</span>}
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setStatusMessage(null); }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? '•••••••• (ตัวอักษรผสมตัวเลขอย่างน้อย 8 ตัว)' : '••••••••'}
                  minLength={tab === 'register' ? 8 : 1}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 text-xs"
            >
              <span>{tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Forgot password form */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">อีเมลของคุณ *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {forgotStep === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">รหัสยืนยัน 6 หลัก *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      placeholder="เช่น 123456"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10 font-mono tracking-widest"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">รหัสผ่านใหม่ *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="รหัสผ่านใหม่ อย่างน้อย 6 ตัวอักษร"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 pl-10"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>{forgotStep === 'request' ? 'ส่งรหัสยืนยันไปยังอีเมล' : 'ยืนยันและเปลี่ยนรหัสผ่าน'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setForgotStep('request'); setStatusMessage(null); }}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition"
            >
              ← กลับสู่หน้าเข้าสู่ระบบ
            </button>
          </form>
        )}



        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>เชื่อมต่อ Supabase Database & SSL 256-bit</span>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" /></div>}>
      <LoginContent />
    </React.Suspense>
  );
}
