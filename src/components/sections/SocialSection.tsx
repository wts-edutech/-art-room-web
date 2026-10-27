import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaLine, FaFacebookMessenger } from "react-icons/fa";
import { Share2 } from "lucide-react";

export default function SocialSection() {
  const socials = [
    {
      name: "Facebook",
      handle: "เพจศิลปะ ว.ธ.",
      url: "https://www.facebook.com/share/1EsbVuyZpm/?mibextid=wwXIfr",
      icon: <FaFacebook className="w-5 h-5" />,
      color: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-blue-500/20",
    },
    {
      name: "LINE",
      handle: "@137odaxl",
      url: "https://line.me/R/ti/p/@137odaxl",
      icon: <FaLine className="w-5 h-5" />,
      color: "bg-[#00B900] text-white hover:bg-[#00a000] shadow-emerald-500/20",
    },
    {
      name: "Messenger",
      handle: "แชทติดต่อสอบถาม",
      url: "https://m.me/334064356461582",
      icon: <FaFacebookMessenger className="w-5 h-5" />,
      color: "bg-[#0084FF] text-white hover:bg-[#0073e6] shadow-sky-500/20",
    },
    {
      name: "Instagram",
      handle: "@w.t.artroom",
      url: "https://www.instagram.com/w.t.artroom",
      icon: <FaInstagram className="w-5 h-5" />,
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90 shadow-pink-500/20",
    },
    {
      name: "TikTok",
      handle: "@artroom253",
      url: "https://www.tiktok.com/@artroom253",
      icon: <FaTiktok className="w-5 h-5" />,
      color: "bg-gray-900 text-white hover:bg-black shadow-gray-900/20",
    },
    {
      name: "YouTube",
      handle: "@artroom-u4l",
      url: "https://youtube.com/@artroom-u4l",
      icon: <FaYoutube className="w-5 h-5" />,
      color: "bg-[#FF0000] text-white hover:bg-[#e60000] shadow-red-500/20",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-transparent">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-gray-100 p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-3">
            <Share2 className="w-3.5 h-3.5" />
            <span>ช่องทางติดต่อ & ติดตามผลงาน</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 mb-2">
            เชื่อมต่อกับ Art Room บนทุกแพลตฟอร์ม
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-light mb-8 max-w-md mx-auto">
            ติดตามคลิปเทคนิคการสอน อัปเดตนิทรรศการ และผลงานศิลปะใหม่ๆ ได้ทุกวัน
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={`${social.name} - ${social.handle}`}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${social.color}`}
              >
                <span className="shrink-0">{social.icon}</span>
                <span className="text-xs font-bold tracking-wide">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
