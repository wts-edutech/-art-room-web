import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaLine, FaFacebookMessenger } from "react-icons/fa";
import Link from "next/link";

export default function SocialSection() {
  const socials = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1EsbVuyZpm/?mibextid=wwXIfr",
      icon: <FaFacebook className="w-5 h-5" />,
      color: "bg-[#1877F2] text-white hover:bg-[#166fe5]",
    },
    {
      name: "LINE",
      url: "https://line.me/R/ti/p/@137odaxl",
      icon: <FaLine className="w-5 h-5" />,
      color: "bg-[#00B900] text-white hover:bg-[#00a000]",
    },
    {
      name: "Messenger",
      url: "https://m.me/334064356461582",
      icon: <FaFacebookMessenger className="w-5 h-5" />,
      color: "bg-[#0084FF] text-white hover:bg-[#0073e6]",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/w.t.artroom",
      icon: <FaInstagram className="w-5 h-5" />,
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@artroom253",
      icon: <FaTiktok className="w-5 h-5" />,
      color: "bg-black text-white hover:bg-gray-800",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@artroom-u4l",
      icon: <FaYoutube className="w-5 h-5" />,
      color: "bg-[#FF0000] text-white hover:bg-[#e60000]",
    },
  ];

  return (
    <section className="py-6 md:py-10 bg-transparent">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h3 className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          ติดตามผลงานและติดต่อเราผ่านโซเชียลมีเดีย
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {socials.map((social, index) => (
            <Link
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              title={social.name}
              className={`flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full shadow-xs hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${social.color}`}
            >
              {social.icon}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
