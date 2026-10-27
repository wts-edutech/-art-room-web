import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, FileText, Eye, Database, Lock, UserCheck, AlertTriangle, Phone, Scale, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) — Art Room",
  description: "นโยบายคุ้มครองข้อมูลส่วนบุคคลของเว็บไซต์ Art Room กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
};

const sections = [
  {
    icon: Eye,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "1. ข้อมูลที่เราเก็บรวบรวม",
    content: [
      "**ข้อมูลนักเรียน**: รหัสประจำตัวนักเรียน 5 หลัก, ชื่อ-นามสกุล, ระดับชั้น/ห้อง, รูปโปรไฟล์ (ถ้ามี), ประวัติการเข้าสู่ระบบ",
      "**ข้อมูลบุคคลทั่วไป / ผู้ปกครอง**: ชื่อ-นามสกุล, อีเมล, เบอร์โทร (ถ้าให้), สถานะ/บทบาท, ช่องทางการเข้าใช้งาน (Google, Facebook, LINE ฯลฯ)",
      "**ข้อมูลอุปกรณ์**: หมายเลข IP Address, ประเภทเบราว์เซอร์ (User-Agent), ระบบปฏิบัติการ, ประเภทอุปกรณ์",
      "**ข้อมูลการใช้งาน**: จำนวนครั้งการเข้าชม, ผลงานศิลปะที่ส่ง, คะแนนที่ได้รับ, ความคิดเห็นที่โพสต์",
    ],
  },
  {
    icon: Database,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล",
    content: [
      "เพื่อ**ยืนยันตัวตน**ของผู้ใช้งานในระบบส่งงานและตรวจคะแนนศิลปะ",
      "เพื่อ**บริหารจัดการการเรียนการสอน**ศิลปะ ได้แก่ การส่งงาน การตรวจงาน และการให้คะแนน",
      "เพื่อ**ปรับปรุงคุณภาพ**เว็บไซต์และสื่อการสอนให้ตอบโจทย์ผู้ใช้งาน",
      "เพื่อ**รักษาความปลอดภัย**ของระบบ ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต",
      "เพื่อ**จัดทำสถิติ**การเข้าใช้งานสำหรับรายงานวิชาการภายในโรงเรียน",
    ],
  },
  {
    icon: Lock,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "3. มาตรการรักษาความปลอดภัย",
    content: [
      "รหัสผ่านนักเรียนถูก**เข้ารหัสด้วย HMAC-SHA256** ก่อนจัดเก็บในฐานข้อมูล ไม่มีการเก็บรหัสผ่านในรูปแบบข้อความธรรมดา",
      "Token การเข้าสู่ระบบมี**อายุจำกัด (Expiry)** และตรวจสอบลายเซ็นดิจิทัลทุกครั้ง",
      "ใช้**ระบบ Middleware** ตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บและ API ที่สำคัญ",
      "ระบบ**ป้องกันการโจมตี Brute-force** ด้วยการล็อกบัญชีชั่วคราวหลังจากกรอกรหัสผ่านผิดเกินกำหนด",
      "ใช้**ฐานข้อมูล Cloudflare D1** ที่มีมาตรฐานความปลอดภัยระดับสากล",
    ],
  },
  {
    icon: UserCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "4. สิทธิ์ของเจ้าของข้อมูล",
    content: [
      "**สิทธิ์ในการเข้าถึง**: ท่านสามารถขอดูข้อมูลส่วนบุคคลที่เราเก็บรวบรวมเกี่ยวกับท่านได้",
      "**สิทธิ์ในการแก้ไข**: ท่านสามารถขอแก้ไขข้อมูลส่วนบุคคลให้ถูกต้องและเป็นปัจจุบัน",
      "**สิทธิ์ในการลบ**: ท่านสามารถขอลบข้อมูลส่วนบุคคลได้ ภายใต้เงื่อนไขที่กฎหมายกำหนด",
      "**สิทธิ์ในการคัดค้าน**: ท่านสามารถคัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลได้",
      "**สิทธิ์ในการถอนความยินยอม**: ท่านสามารถถอนความยินยอมที่เคยให้ไว้ได้ทุกเมื่อ",
    ],
  },
  {
    icon: Shield,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    title: "5. การเปิดเผยข้อมูลแก่บุคคลภายนอก",
    content: [
      "เราจะ**ไม่เปิดเผย ไม่ขาย ไม่แลกเปลี่ยน** ข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอกเพื่อวัตถุประสงค์ทางการค้า",
      "ข้อมูลอาจถูกเปิดเผยเฉพาะกรณี: (1) ตามที่กฎหมายกำหนด (2) เพื่อปฏิบัติตามคำสั่งศาลหรือหน่วยงานรัฐ",
      "ข้อมูลผลการเรียนอาจแบ่งปันกับ**ครูผู้สอนและฝ่ายวิชาการ**ของโรงเรียนวชิรธรรมสาธิตเท่านั้น",
    ],
  },
  {
    icon: Clock,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    title: "6. ระยะเวลาในการจัดเก็บข้อมูล",
    content: [
      "ข้อมูลนักเรียนจะถูกจัดเก็บตลอดช่วงปีการศึกษา และอาจเก็บรักษาต่อ**ไม่เกิน 3 ปีการศึกษา**หลังจากจบการศึกษา เพื่อการอ้างอิงทางวิชาการ",
      "ข้อมูลบุคคลทั่วไป/ผู้เยี่ยมชมจะถูกจัดเก็บ**ไม่เกิน 1 ปี**นับจากวันที่เข้าใช้งานครั้งสุดท้าย",
      "ข้อมูลที่ไม่จำเป็นจะถูก**ลบหรือทำให้ไม่สามารถระบุตัวตน**ได้เมื่อหมดความจำเป็น",
    ],
  },
  {
    icon: Scale,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    title: "7. กฎหมายที่ใช้บังคับ",
    content: [
      "นโยบายนี้จัดทำตาม**พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)**",
      "เว็บไซต์นี้เป็นสื่อการเรียนการสอนที่จัดทำภายใต้**โรงเรียนวชิรธรรมสาธิต** สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Header */}
        <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 -left-20 w-64 h-64 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold mb-5 border border-blue-200 shadow-xs">
              <Shield className="w-4 h-4" />
              <span>Privacy Policy — PDPA Compliant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight mb-4 leading-tight">
              นโยบายคุ้มครอง
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                ข้อมูลส่วนบุคคล
              </span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
              เว็บไซต์ Art Room ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน
              ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (Personal Data Protection Act — PDPA)
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-xs text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>ปรับปรุงล่าสุด: ตุลาคม 2567</span>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="container mx-auto px-4 sm:px-6 max-w-4xl pb-20">
          <div className="space-y-6 sm:space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3.5 p-5 sm:p-6 border-b border-gray-50">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${section.iconBg} ${section.iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">{section.title}</h2>
                  </div>

                  {/* Section Body */}
                  <div className="px-5 sm:px-6 py-4 sm:py-5">
                    <ul className="space-y-3">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                          <span dangerouslySetInnerHTML={{ 
                            __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>') 
                          }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl sm:rounded-3xl border border-blue-100 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">8. ช่องทางติดต่อ</h2>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    หากท่านมีข้อสงสัยหรือต้องการใช้สิทธิ์เกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อได้ที่:
                  </p>
                  <div className="bg-white/80 rounded-xl border border-blue-100/50 p-4 space-y-2 text-sm text-gray-700">
                    <p><strong className="text-gray-900">กลุ่มสาระการเรียนรู้ศิลปะ</strong></p>
                    <p>โรงเรียนวชิรธรรมสาธิต เขตสวนหลวง กรุงเทพมหานคร</p>
                    <p>
                      LINE Official:{" "}
                      <a
                        href="https://line.me/R/ti/p/@137odaxl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        @137odaxl
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200/60 p-5 sm:p-6 flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                <p className="font-semibold mb-1">ข้อสงวนสิทธิ์</p>
                <p className="text-amber-800 font-light">
                  เว็บไซต์ Art Room สงวนสิทธิ์ในการแก้ไขเปลี่ยนแปลงนโยบายนี้ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า 
                  ทั้งนี้ การเปลี่ยนแปลงจะมีผลทันทีเมื่อประกาศบนเว็บไซต์ การใช้งานเว็บไซต์ต่อหลังจากมีการเปลี่ยนแปลงถือว่าท่านยอมรับนโยบายฉบับปรับปรุงแล้ว
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
