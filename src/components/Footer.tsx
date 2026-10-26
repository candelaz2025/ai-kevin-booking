'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/lib/types';

import { Phone, Mail, MessageCircle } from 'lucide-react';

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const phone = settings?.footerContactPhone || '091-746-2444';
  const email = settings?.footerContactEmail || 'sorachetkevin@gmail.com';
  const lineId = settings?.footerLineId || 'Candelaz';
  const facebook = settings?.footerFacebookUrl || 'candelaz kengza';
  const facebookLink = facebook.startsWith('http') ? facebook : `https://facebook.com/search/top?q=${encodeURIComponent(facebook)}`;
  const lineLink = lineId.startsWith('http') ? lineId : `https://line.me/ti/p/~${lineId.replace(/^@/, '')}`;

  return (
    <footer className="border-t border-white/10 bg-[#060b14] text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-amber-400/25 border border-amber-400/40 shrink-0 bg-amber-400/10">
                <img
                  src="/assets/logo.png"
                  alt="Kevin AI Academy Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                {settings?.brandName || 'Kevin AI Academy'}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md whitespace-pre-line">
              {settings?.footerDescription || 'ที่ปรึกษา AI แบบส่วนตัวและกลุ่ม ทั้งออนไลน์และออนไซต์'}
            </p>


            {/* Flat Design Duotone Contact Cards / Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-lg">
              {/* Phone */}
              <a 
                href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/15 transition-all text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Phone Call</span>
                  <span className="font-bold text-white group-hover:text-emerald-300 transition-colors font-mono">{phone}</span>
                </div>
              </a>

              {/* Email */}
              <a 
                href={`mailto:${email}`}
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-sky-500/10 to-transparent border border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-500/15 transition-all text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Email Support</span>
                  <span className="font-bold text-white group-hover:text-sky-300 transition-colors truncate block">{email}</span>
                </div>
              </a>

              {/* Line */}
              <a 
                href={lineLink}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/15 transition-all text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 border border-green-500/30 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-green-400 uppercase tracking-wider">LINE ID</span>
                  <span className="font-bold text-white group-hover:text-green-300 transition-colors">{lineId}</span>
                </div>
              </a>

              {/* Facebook */}
              <a 
                href={facebookLink}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/15 transition-all text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <FacebookIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Facebook</span>
                  <span className="font-bold text-white group-hover:text-blue-300 transition-colors truncate block">{facebook}</span>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">บริการและหลักสูตร</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#classes" className="hover:text-amber-400 transition-colors">AI Content Workshop Onsite</Link></li>
              <li><Link href="/#classes" className="hover:text-amber-400 transition-colors">Private 1-on-1 AI Masterclass</Link></li>
              <li><Link href="/articles" className="hover:text-amber-400 transition-colors">บทความ AI (Blog)</Link></li>
              <li><Link href="/prompts" className="hover:text-emerald-400 transition-colors">คลัง Prompt & Generator</Link></li>
              <li>
                <Link 
                  href="/prompts/video" 
                  className="hover:text-pink-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Prompt Video (100 สไตล์)</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 font-semibold">100 Styles</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/prompts/drama" 
                  className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 text-amber-300/90 font-medium"
                >
                  <span>Prompt Video ละคร (AI Drama)</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-semibold">77 Styles</span>
                </Link>
              </li>
              <li><Link href="/#schedule" className="hover:text-amber-400 transition-colors">ปฏิทินตารางเวลาว่าง</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">เมนูสมาชิก</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-amber-400 transition-colors">เข้าสู่ระบบ / สมัครสมาชิก</Link></li>
              <li><Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard ของผู้เรียน</Link></li>
              <li><Link href="/admin" className="hover:text-amber-400 transition-colors">สำหรับผู้สอน (Admin)</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{settings?.footerCopyrightText || '© 2026 Kevin AI Academy. All rights reserved.'}</p>
          <div className="flex items-center gap-6">
            <span>รองรับชำระผ่าน PromptPay QR และ Stripe</span>
            <span>ระบบแจ้งเตือนทาง Email อัตโนมัติ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
