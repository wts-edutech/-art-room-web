import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaLine, FaFacebookMessenger } from "react-icons/fa";
import Link from "next/link";

export default function SocialSection() {
  const socials = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1EsbVuyZpm/?mibextid=wwXIfr",
      icon: <FaFacebook className="w-10 h-10 mb-3" />,
      color: "bg-[#1877F2] hover:bg-[#166fe5]",
    },
    {
      name: "LINE",
      url: "https://line.me/R/ti/p/@137odaxl",
      icon: <FaLine className="w-10 h-10 mb-3" />,
      color: "bg-[#00B900] hover:bg-[#00a000]",
    },
    {
      name: "Messenger",
      url: "https://m.me/334064356461582",
      icon: <FaFacebookMessenger className="w-10 h-10 mb-3" />,
      color: "bg-[#0084FF] hover:bg-[#0073e6]",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/w.t.artroom",
      icon: <FaInstagram className="w-10 h-10 mb-3" />,
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@artroom253",
      icon: <FaTiktok className="w-10 h-10 mb-3" />,
      color: "bg-black hover:bg-gray-800",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@artroom-u4l",
      icon: <FaYoutube className="w-10 h-10 mb-3" />,
      color: "bg-[#FF0000] hover:bg-[#e60000]",
    },
  ];

  return (
    <section className="py-24 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
            ติดตามผลงานของเรา
          </h2>
          <p className="text-gray-600 text-lg md:text-xl font-light">
            อัปเดตผลงาน กิจกรรม และเทคนิคใหม่ๆ ได้ตามช่องทางต่างๆ ด้านล่างนี้
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
          {(Array.isArray(socials) ? socials : []).map((social, index) => (
            <Link
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-6 rounded-3xl text-white shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl group ${social.color}`}
              aria-label={social.name}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {social.icon}
              </div>
              <span className="font-medium text-sm md:text-base opacity-90 group-hover:opacity-100">{social.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
