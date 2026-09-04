import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Phone, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12 md:py-20 flex-1 flex flex-col items-center justify-center">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-gray-900 mb-4">ติดต่อเรา</h1>
            <p className="text-gray-500 max-w-lg mx-auto">สอบถามข้อมูลเพิ่มเติม แลกเปลี่ยนความคิดเห็น หรือปรึกษาเกี่ยวกับการเรียนศิลปะได้ที่นี่</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-md relative overflow-hidden text-center group flex flex-col mx-auto">
            {/* Top Light Green Background */}
            <div className="absolute top-0 left-0 w-full h-[45%] bg-[#f2fbf5]"></div>
            
            <div className="relative z-10 flex flex-col items-center p-8 md:p-10 w-full h-full">
              {/* LINE OFFICIAL Pill */}
              <div className="inline-flex items-center justify-center gap-2 bg-[#d7f4e3] text-[#06C755] px-5 py-1.5 rounded-full text-sm font-extrabold tracking-wider mb-8">
                <MessageCircle className="w-4 h-4" /> LINE OFFICIAL
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-[2rem] shadow-lg shadow-gray-200/50 border-[6px] border-white mb-8 transform transition-transform group-hover:scale-105 duration-500 w-64 h-64 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://line.me/R/ti/p/@137odaxl" 
                  alt="LINE QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Add LINE Button */}
              <div className="flex flex-col gap-4 w-full mt-auto">
                <a 
                  href="https://line.me/R/ti/p/@137odaxl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#06C755]/30 transform hover:-translate-y-1 text-lg"
                >
                  <MessageCircle className="w-6 h-6" /> แอด LINE
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
