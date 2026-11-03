'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, CheckCircle2, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import { ClassItem } from '@/lib/types';

interface CalendarProps {
  selectedClass?: ClassItem | null;
  onSelectSlot: (date: string, timeSlot: string) => void;
  selectedDate?: string;
  selectedTimeSlot?: string;
}

const DEFAULT_CALENDAR_MONTH = new Date('2026-10-01T00:00:00Z');

export default function CalendarPicker({
  selectedClass,
  onSelectSlot,
  selectedDate,
  selectedTimeSlot,
}: CalendarProps) {
  const availableDatesList = selectedClass?.availableDates || [];
  const timeSlotsList = selectedClass?.timeSlots && selectedClass.timeSlots.length > 0
    ? selectedClass.timeSlots
    : ['10:00 - 12:00', '13:00 - 16:00', '19:00 - 21:00'];

  // Calculate initial active month based on selected date or first class date, fallback to stable default
  const getInitialMonth = () => {
    const targetStr = selectedDate || (selectedClass?.availableDates && selectedClass.availableDates[0]);
    if (targetStr) {
      try {
        const parsed = parseISO(targetStr);
        if (!isNaN(parsed.getTime())) return startOfMonth(parsed);
      } catch {}
    }
    return DEFAULT_CALENDAR_MONTH;
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(getInitialMonth());
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setTodayStr(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  }, []);

  // Automatically synchronize calendar view when class or selected date changes
  useEffect(() => {
    const targetStr = selectedDate || (selectedClass?.availableDates && selectedClass.availableDates[0]);
    if (targetStr) {
      try {
        const parsed = parseISO(targetStr);
        if (!isNaN(parsed.getTime())) {
          setCurrentMonth(startOfMonth(parsed));
        }
      } catch {}
    }
  }, [selectedClass?.id, selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading days padding
  const startDayOfWeek = monthStart.getDay(); // 0 is Sunday
  const emptyDays = Array.from({ length: startDayOfWeek });

  const isPastDate = (day: Date) => {
    if (!todayStr) return false;
    const formatted = format(day, 'yyyy-MM-dd');
    return formatted < todayStr;
  };

  const handleDateClick = (day: Date) => {
    if (isPastDate(day)) return;
    const formatted = format(day, 'yyyy-MM-dd');
    onSelectSlot(formatted, selectedTimeSlot || timeSlotsList[0]);
  };

  return (
    <div className="bg-[#101c2d] border border-white/10 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📅</span> เลือกวันและเวลาเรียนที่ต้องการ
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {selectedClass ? (
              <>คลาส: <span className="text-amber-400 font-semibold">{selectedClass.title}</span></>
            ) : (
              'สามารถคลิกเลือกวันที่สะดวกเรียนได้ทันที'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-200 min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: th })}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recommended Course Dates Quick Bar */}
      {availableDatesList.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-purple-200 font-semibold">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>รอบเปิดสอนแนะนำของคอร์สนี้:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableDatesList.map(d => {
              const isDateActive = selectedDate === d;
              let label = d;
              try {
                label = format(parseISO(d), 'd MMM yyyy', { locale: th });
              } catch {}

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onSelectSlot(d, selectedTimeSlot || timeSlotsList[0])}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                    isDateActive
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                  }`}
                >
                  📅 {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, idx) => (
          <div key={idx} className={idx === 0 || idx === 6 ? 'text-amber-400/80' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="h-12 rounded-xl bg-white/[0.02]" />
        ))}

        {daysInMonth.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isOfficial = availableDatesList.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isPast = isPastDate(day);
          const isCurrentDay = todayStr ? dateStr === todayStr : false;

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => handleDateClick(day)}
              className={`h-12 rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/30 scale-105 ring-2 ring-amber-300'
                  : isOfficial
                  ? 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-bold border border-purple-500/50 hover:border-purple-400 cursor-pointer shadow-sm shadow-purple-500/20'
                  : isPast
                  ? 'bg-white/[0.02] text-slate-600 cursor-not-allowed opacity-30'
                  : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-white/5 hover:border-white/20 cursor-pointer'
              }`}
            >
              <span className={`text-sm leading-none ${isCurrentDay && !isSelected ? 'text-amber-400 font-bold' : ''}`}>
                {format(day, 'd')}
              </span>
              {isOfficial && !isSelected && (
                <span className="flex items-center gap-0.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-[8px] font-bold text-purple-300 hidden sm:inline">เปิดสอน</span>
                </span>
              )}
              {!isOfficial && isCurrentDay && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-amber-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-3 mt-4 border-t border-white/5 text-[11px] text-slate-400">
        {availableDatesList.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-purple-300 font-semibold">รอบเปิดสอนของคอร์สนี้ ({availableDatesList.length} วัน)</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>วันที่เปิดรับจอง (เลือกเรียนได้ตามสะดวก)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>วันที่เลือกอยู่</span>
        </div>
      </div>

      {/* Time slots selection */}
      {selectedDate && (
        <div className="mt-6 pt-5 border-t border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>เลือกรอบเวลาสำหรับวันที่</span>
              <span className="text-amber-400 font-bold font-mono">
                {(() => {
                  try {
                    return format(parseISO(selectedDate), 'd MMMM yyyy', { locale: th });
                  } catch {
                    return selectedDate;
                  }
                })()}
              </span>
            </label>
            {availableDatesList.includes(selectedDate) && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ✓ รอบเปิดสอนทางการ
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {timeSlotsList.map((slot, index) => {
              const isSlotSelected = selectedTimeSlot === slot;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectSlot(selectedDate, slot)}
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                    isSlotSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                      : 'bg-slate-800/60 text-slate-200 border-white/10 hover:border-amber-400/40 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot}
                  </span>
                  {isSlotSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Location / Mode Notice */}
      {selectedClass && (
        <div className="mt-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3 text-xs text-slate-300">
          {selectedClass.type === 'online' ? (
            <>
              <Video className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-400">คลาสเรียนออนไลน์ (Online Class):</span>
                <p className="text-slate-400 mt-0.5">เรียนสดตัวต่อตัวผ่าน Google Meet / Zoom ได้รับลิงก์ทันทีเมื่อการจองได้รับการยืนยัน</p>
              </div>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-400">คลาสเรียน Onsite Workshop:</span>
                <p className="text-slate-400 mt-0.5">{selectedClass.location || 'kevinaiagent.tech Studio & Online'}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
