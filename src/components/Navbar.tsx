'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { User, LogOut, Menu, X, Sparkles, ChevronDown } from 'lucide-react';

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
                className={`absolute top-full left-0 pt-2 w-64 transition-all duration-200 z-50 ${
                  promptsDropdownOpen 
                    ? 'opacity-100 translate-y-0 pointer-events-auto visible' 
                    : 'opacity-0 translate-y-1 pointer-events-none invisible'
                }`}
              >
                <div className="rounded-2xl bg-[#09111e]/98 border border-white/10 shadow-2xl shadow-black/80 p-2 backdrop-blur-xl space-y-0.5">
                  <Link
                    href="/prompts"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    Prompt Generator
                  </Link>

                  <Link
                    href="/prompts/video"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    Prompt Video
                  </Link>

                  <Link
                    href="/prompts/drama"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    Prompt Video ละคร
                  </Link>

                  <Link
                    href="/prompts/vibe-design"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    Vibe Design
                  </Link>

                  <Link
                    href="/prompts/motion-claude"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    Motion Claude Prompt
                  </Link>

                  <a
                    href="https://kevin-character-lock-studio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    Character Lock Studio Prompt
                  </a>

                  <a
                    href="https://hongpak-voice-studio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setPromptsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 transition-all"
                  >
                    ห้องน้องพากย์
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
              <div className="pl-3 pr-2 py-1 space-y-0.5 border-l-2 border-amber-400/30 ml-4 my-1 bg-slate-900/40 rounded-r-xl">
                <Link
                  href="/prompts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  Prompt Generator
                </Link>
                <Link
                  href="/prompts/video"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  Prompt Video
                </Link>
                <Link
                  href="/prompts/drama"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  Prompt Video ละคร
                </Link>
                <Link
                  href="/prompts/vibe-design"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  Vibe Design
                </Link>
                <Link
                  href="/prompts/motion-claude"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  Motion Claude Prompt
                </Link>
                <a
                  href="https://kevin-character-lock-studio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  Character Lock Studio Prompt
                </a>
                <a
                  href="https://hongpak-voice-studio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                >
                  ห้องน้องพากย์
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
