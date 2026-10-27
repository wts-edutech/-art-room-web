export default function RootLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 select-none">
      {/* Decorative ambient glow */}
      <div className="relative flex flex-col items-center">
        {/* Pulsing art icon container */}
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-500 to-pink-500 flex items-center justify-center shadow-xl shadow-red-500/20 animate-pulse">
          <svg
            className="w-10 h-10 text-white animate-bounce"
            style={{ animationDuration: "1.8s" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>

          {/* Shimmer sweep */}
          <span className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent ai-shimmer-beam" />
        </div>

        {/* Text indicator */}
        <div className="mt-6 text-center">
          <p className="text-base font-bold font-heading text-gray-800 tracking-tight">
            กำลังโหลดข้อมูล...
          </p>
          <p className="text-xs text-gray-400 mt-1 font-light">
            Art Room • โรงเรียนวชิรธรรมสาธิต
          </p>
        </div>

        {/* Progress bar shimmer */}
        <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-5 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Background skeleton cards placeholder for smooth visual continuity */}
      <div className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-gray-100 animate-pulse border border-gray-200/50 p-6 flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="space-y-2">
              <div className="w-3/4 h-4 rounded bg-gray-200" />
              <div className="w-1/2 h-3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
