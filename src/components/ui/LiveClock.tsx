"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { usePathname } from "next/navigation";

export default function LiveClock() {
  const pathname = usePathname();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initial set
    setTime(new Date());
    
    // Update every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) return null; // Avoid hydration mismatch

  // Format date and time in Thai with Buddhist Era (Asia/Bangkok timezone)
  const formatThaiDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatThaiTime = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  let formattedDate = formatThaiDate(time);
  // Inject "พ.ศ." before the year if it's missing (Intl usually outputs 'วันพฤหัสบดีที่ 3 กันยายน 2569')
  if (!formattedDate.includes("พ.ศ.")) {
    const parts = formattedDate.split(" ");
    if (parts.length > 0) {
      const year = parts.pop();
      formattedDate = `${parts.join(" ")} พ.ศ. ${year}`;
    }
  }
  
  const isAdmin = pathname.startsWith("/admin");
  
  return (
    <div className={`fixed top-0 left-0 right-0 w-full h-8 z-[60] transition-colors ${isAdmin ? "bg-white text-gray-800 border-b border-gray-200" : "bg-gradient-to-r from-orange-500 to-pink-500 text-white"}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-center md:justify-end gap-3 text-[10px] sm:text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <Calendar className={`w-3.5 h-3.5 ${isAdmin ? "text-gray-500" : "text-white/90"}`} />
          <span>{formattedDate}</span>
        </div>
        
        <div className={`w-px h-3 ${isAdmin ? "bg-gray-300" : "bg-white/30"}`}></div>
        
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${isAdmin ? "text-gray-500" : "text-white/90"}`} />
          <span className="font-bold tracking-wider">
            {formatThaiTime(time)} น.
          </span>
        </div>
      </div>
    </div>
  );
}
