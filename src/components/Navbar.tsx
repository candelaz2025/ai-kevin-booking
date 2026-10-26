'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bell, User, LogOut, Menu, X, Shield, Sparkles, ChevronDown, ExternalLink, Video, Film, Mic, UserCheck, Palette } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promptsDropdownOpen, setPromptsDropdownOpen] = useState(false);
  const [mobilePromptsOpen, setMobilePromptsOpen] = useState(true);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09111e]/90 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-amber-400/25 border border-amber-400/40 group-hover:scale-105 group-hover:border-amber-400/80 transition-all shrink-0 bg-amber-400/10">
              <img
                src="/assets/logo.png"
                alt="Kevin AI Academy Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <span className="block text-base sm:text-lg font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Kevin AI Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/#classes" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors">
              Courses
            </Link>
            <Link href="/articles" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors">
              Blog
            </Link>

            {/* Prompts Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={() => setPromptsDropdownOpen(true)}
              onMouseLeave={() => setPromptsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPromptsDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors py-2 focus:outline-none"
              >
                <span>Prompts</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${promptsDropdownOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
              </button>

              <div 
                className={`absolute top-full left-0 pt-2 w-80 transition-all duration-200 z-50 ${
                  promptsDropdownOpen 
                    ? 'opacity-100 translate-y-0 pointer-events-auto visible' 
                    : 'opacity-0 translate-y-1 pointer-events-none invisible'
                }`}
              >
                <div className="rounded-2xl bg-[#09111e]/98 border border-white/10 shadow-2xl shadow-black/80 p-2 backdrop-blur-xl">
                  <Link
                    href="/prompts"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-amber-400 group-hover/item:text-slate-950 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white group-hover/item:text-amber-400 transition-colors">
                        Prompt Generator
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Master Prompt สำหรับ AI Text & Code
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/prompts/video"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item mt-1 border-t border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-pink-500 group-hover/item:text-white transition-colors">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white group-hover/item:text-amber-400 flex items-center justify-between transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span>Prompt Video</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                            100 Styles
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover/item:text-amber-400 font-mono">Native</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        คลัง Prompt วิดีโอ 100 สไตล์ พร้อมคลิปตัวอย่าง
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/prompts/drama"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item mt-1 border-t border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-amber-400 group-hover/item:text-slate-950 transition-colors">
                      <Film className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white group-hover/item:text-amber-400 flex items-center justify-between transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span>Prompt Video ละคร</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                            AI Drama
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover/item:text-amber-400 font-mono">77 สไตล์</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        ตัวอย่างละครสั้น AI ท่ากล้อง แสง และบทพูดภาษาไทย
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/prompts/vibe-design"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item mt-1 border-t border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-colors">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white group-hover/item:text-amber-400 flex items-center justify-between transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span>Vibe Design</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                            97 Styles
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover/item:text-amber-400 font-mono">Oil UI</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        UI Design Skill สำหรับ AI คลัง 97 สไตล์พร้อม Playbook & Prompts
                      </p>
                    </div>
                  </Link>

                  <a
                    href="https://kevin-character-lock-studio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item mt-1 border-t border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-cyan-500 group-hover/item:text-slate-950 transition-colors">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white group-hover/item:text-amber-400 flex items-center justify-between transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span>Character Lock Studio Prompt</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-amber-400 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        สร้าง Character Sheet & Storyboard คุมตัวละครหน้าเดิมทุกซีน
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://hongpak-voice-studio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item mt-1 border-t border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500 group-hover/item:text-slate-950 transition-colors">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white group-hover/item:text-amber-400 flex items-center justify-between transition-colors">
                        <span className="flex items-center gap-1.5">
                          <span>ห้องน้องพากย์</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Voice AI
                          </span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-amber-400" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        สตูดิโอเสียงพากย์ภาษาไทย อัดเสียง AI โคลนเสียง
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* ห้องน้องพากย์ Top Nav Item */}
            <a
              href="https://hongpak-voice-studio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
            >
              ห้องน้องพากย์
            </a>

            <Link href="/#schedule" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors">
              Calendar
            </Link>
            <Link href="/#about" className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors">
              About Me
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-all"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Auth & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3.5 py-2 rounded-xl transition-all"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Dashboard ({user.name.split(' ')[0]})</span>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {user.rewards?.points || 0} pts
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 px-4 py-2 rounded-xl shadow-md shadow-amber-400/20 hover:shadow-amber-400/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#09111e]/95 border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/#classes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Courses
          </Link>
          <Link
            href="/articles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Blog
          </Link>
          {/* Mobile Prompts Submenu */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setMobilePromptsOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span>Prompts</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePromptsOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
            </button>

            {mobilePromptsOpen && (
              <div className="pl-3 pr-2 py-1 space-y-1 border-l-2 border-amber-400/30 ml-4 my-1 bg-slate-900/40 rounded-r-xl">
                <Link
                  href="/prompts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  <span className="font-semibold text-white block">Prompt Generator</span>
                  <span className="text-xs text-slate-400 font-normal">Master Prompt สำหรับ AI Text & Code</span>
                </Link>
                <Link
                  href="/prompts/video"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-pink-300 flex items-center gap-1.5">
                      Prompt Video
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                        100 Styles
                      </span>
                    </span>
                    <Video className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-normal">คลัง Prompt วิดีโอ 100 สไตล์ พร้อมคลิป</span>
                </Link>
                <Link
                  href="/prompts/drama"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      Prompt Video ละคร
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                        AI Drama
                      </span>
                    </span>
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-normal">ตัวอย่างละครสั้น AI ท่ากล้องและบทพูด</span>
                </Link>
                <Link
                  href="/prompts/vibe-design"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      Vibe Design
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        97 Styles
                      </span>
                    </span>
                    <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-normal">UI Design Skill สำหรับ AI คลัง 97 สไตล์ & Playbooks</span>
                </Link>
                <a
                  href="https://kevin-character-lock-studio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      Character Lock Studio Prompt
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-normal">สร้าง Character Sheet & Storyboard คุมตัวละครหน้าเดิมทุกซีน</span>
                </a>
                <a
                  href="https://hongpak-voice-studio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      ห้องน้องพากย์
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Voice AI
                      </span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-normal">สตูดิโอเสียงพากย์ภาษาไทย อัดเสียง AI</span>
                </a>
              </div>
            )}
          </div>
          <a
            href="https://hongpak-voice-studio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            ห้องน้องพากย์
          </a>
          <Link
            href="/#schedule"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Calendar
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            About Me
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20"
            >
              Admin
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-amber-400 bg-slate-800"
                >
                  <span>Dashboard ({user.name})</span>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {user.rewards?.points || 0} pts
                  </span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-xl text-base font-medium text-slate-200 bg-slate-800"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/login?tab=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-xl text-base font-semibold text-slate-950 bg-amber-400"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
