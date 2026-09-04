"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Image as ImageIcon } from "lucide-react";

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string; // Format: YYYY-MM-DD
  imageUrl?: string;
}

interface CalendarViewProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onDateClick?: (dateStr: string) => void;
}

export default function CalendarView({ activities, onActivityClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  // Generate blank spaces for the first week
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  // Generate days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group activities by date
  const activitiesByDate: Record<string, Activity[]> = {};
  activities.forEach(act => {
    if (!activitiesByDate[act.date]) {
      activitiesByDate[act.date] = [];
    }
    activitiesByDate[act.date].push(act);
  });

  const todayStr = formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-heading text-gray-800">
            {monthNames[currentMonth]} {currentYear + 543}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-blue-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 h-10 rounded-full font-medium text-sm hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-blue-600"
          >
            วันนี้
          </button>
          <button 
            onClick={nextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-blue-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
          {(Array.isArray(dayNames) ? dayNames : []).map((day, i) => (
            <div key={day} className={`text-center text-sm font-bold uppercase tracking-wider ${i === 0 || i === 6 ? 'text-red-400' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="aspect-square rounded-2xl bg-gray-50/50 border border-transparent"></div>
          ))}
          
          {days.map(day => {
            const dateStr = formatDateStr(currentYear, currentMonth, day);
            const dayActivities = activitiesByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const hasActivity = dayActivities.length > 0;
            
            return (
              <div 
                key={day} 
                onClick={() => onDateClick?.(dateStr)}
                className={`relative group flex flex-col aspect-square rounded-2xl p-1 sm:p-2 transition-all ${
                  isToday 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : hasActivity 
                      ? "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer" 
                      : "bg-white border-gray-100 hover:bg-gray-50 cursor-pointer"
                } border`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                    isToday ? "bg-blue-600 text-white shadow-sm" : hasActivity ? "text-gray-900" : "text-gray-500"
                  }`}>
                    {day}
                  </span>
                  
                  {hasActivity && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse mt-1"></span>
                  )}
                </div>

                {/* Desktop Activities List - Hidden in compact mode, relying on dots */}
                <div className="hidden">
                  {dayActivities.map(act => (
                    <div 
                      key={act.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivityClick?.(act);
                      }}
                      className="text-xs bg-gradient-to-r from-blue-500 to-blue-400 text-white px-2 py-1.5 rounded-lg truncate shadow-sm hover:shadow hover:scale-[1.02] transform transition-all cursor-pointer font-medium"
                    >
                      {act.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
