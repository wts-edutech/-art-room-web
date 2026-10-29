"use client";

import React from "react";

/**
 * SiteBackgroundCanvas
 * 
 * Guarantees that the Art Room mascots, paint brushes, and artistic elements
 * are 100% VISIBLE across all devices (Desktop, Tablet, Mobile) without being
 * cropped out by aspect ratio or covered by page card backgrounds.
 */
export default function SiteBackgroundCanvas() {
  return (
    <>
      {/* 1. Base Wallpaper Canvas (Behind everything: z-0) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat opacity-35"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        />
      </div>

      {/* 2. Floating Art Mascot Stickers (Foreground Overlay: z-20, pointer-events-none) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
      >
        {/* Top-Left: Palette & Pink Pencil */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/art-palette-pencil.png"
          alt=""
          width={220}
          height={290}
          className="absolute top-20 sm:top-24 left-1 sm:left-4 w-16 sm:w-28 md:w-36 lg:w-44 h-auto opacity-75 sm:opacity-90 drop-shadow-md transition-transform duration-700 animate-pulse-gentle"
        />

        {/* Top-Right: Mascot Painting with Pink Splash */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mascot-top-right.png"
          alt=""
          width={256}
          height={283}
          className="absolute top-18 sm:top-24 right-1 sm:right-4 w-20 sm:w-32 md:w-44 lg:w-52 h-auto opacity-95 sm:opacity-100 drop-shadow-xl transition-transform duration-700 animate-float-delayed"
        />

        {/* Bottom-Left: Mascot Painting with Brush and Shoes */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mascot-bottom-left.png"
          alt=""
          width={268}
          height={279}
          className="absolute bottom-20 sm:bottom-6 left-1 sm:left-4 w-20 sm:w-32 md:w-44 lg:w-52 h-auto opacity-95 sm:opacity-100 drop-shadow-xl transition-transform duration-700 animate-float-slow"
        />

        {/* Bottom-Right: Green Pencil & Confetti */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/art-green-pencil.png"
          alt=""
          width={192}
          height={275}
          className="absolute bottom-20 sm:bottom-6 right-1 sm:right-4 w-16 sm:w-28 md:w-36 lg:w-44 h-auto opacity-75 sm:opacity-90 drop-shadow-md transition-transform duration-700 animate-pulse-gentle"
        />
      </div>
    </>
  );
}
