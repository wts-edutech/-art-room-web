"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/image-utils";

interface LiteYouTubeProps {
  videoId: string;
  title?: string;
  customThumbnail?: string;
  className?: string;
  aspectRatio?: string;
}

export default function LiteYouTube({
  videoId,
  title = "วิดีโอประกอบการเรียนรู้",
  customThumbnail,
  className = "",
  aspectRatio = "aspect-video",
}: LiteYouTubeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = customThumbnail || getYouTubeThumbnail(videoId, "hq");

  if (isPlaying) {
    return (
      <div className={`relative w-full ${aspectRatio} bg-black overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsPlaying(true)}
      role="button"
      tabIndex={0}
      aria-label={`เล่นวิดีโอ: ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsPlaying(true);
        }
      }}
      className={`group relative w-full ${aspectRatio} bg-gray-900 cursor-pointer overflow-hidden select-none ${className}`}
    >
      {/* Optimized Lazy-loaded Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt={title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        onError={(e) => {
          // Fallback if hqdefault fails
          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }}
      />

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-colors duration-300" />

      {/* Red YouTube-style Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 transform group-hover:scale-110 transition-all duration-300 backdrop-blur-xs">
          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
        </div>
      </div>

      {/* Subtitle pill at bottom */}
      <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between text-xs text-white/90">
        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg truncate max-w-[80%] font-medium">
          {title}
        </span>
        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          YouTube
        </span>
      </div>
    </div>
  );
}
