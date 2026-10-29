import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FileText, CheckCircle2, XCircle, AlertTriangle, BookOpen, Shield, Scale, Phone, Clock, Gavel } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน — Art Room",
  description: "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ Art Room กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
};

const terms = [
  {
    icon: BookOpen,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "1. ข้อมูลทั่วไป",
    items: [
      "เว็บไซต์ **Art Room** เป็นสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ จัดทำขึ้นโดยกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
      "เว็บไซต์นี้มีวัตถุประสงค์เพื่อใช้ในการ**เรียนการสอน การส่งงาน การตรวจงาน** และเป็นแหล่งเรียนรู้ศิลปะสำหรับนักเรียนและบุคคลทั่วไป",
      "การเข้าใช้งานเว็บไซต์ถือว่าท่าน**ยอมรับข้อกำหนดและเงื่อนไข**ทั้งหมดที่ระบุไว้ในหน้านี้",
    ],
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "2. สิ่งที่อนุญาตให้ทำ",
    items: [
      "เข้าศึกษาเรียนรู้เนื้อหาสื่อการสอน วิดีโอ และบทเรียนศิลปะ**ได้อย่างเสรี**",
      "นักเรียนสามารถ**ส่งงาน ดูคะแนน** และติดตามสถานะการส่งงานได้ผ่านระบบ",
      "แชร์ไอเดียสร้างสรรค์และ**แสดงความคิดเห็น**อย่างสร้างสรรค์ในพื้นที่ที่จัดไว้",
      "ดาวน์โหลดสื่อใบงาน แบบฝึกหัด และเอกสาร PDF ที่จัดเตรียมไว้**เพื่อการเรียนรู้**",
      "แชร์ลิงก์เว็บไซต์ให้ผู้อื่นได้**เพื่อวัตถุประสงค์ทางการศึกษา**",
    ],
  },
  {
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    title: "3. สิ่งที่ห้ามกระทำ",
    items: [
      "**ห้ามแอบอ้าง**เป็นนักเรียนหรือบุคคลอื่นในการเข้าสู่ระบบ ระบบมีบันทึกประวัติการเข้าใช้งานทั้งหมด",
      "**ห้ามส่งงานที่ลอกเลียนแบบ** (Plagiarism) ผลงานของผู้อื่นโดยไม่ได้รับอนุญาต",
      "**ห้ามโพสต์เนื้อหา**ที่ไม่เหมาะสม หยาบคาย ลามก อนาจาร หรือเนื้อหาที่ส่งเสริมความรุนแรง",
      "**ห้ามพยายามเจาะระบบ** (Hacking) หรือใช้เครื่องมือโจมตีเว็บไซต์ในทุกรูปแบบ",
      "**ห้ามนำเนื้อหา**ของเว็บไซต์ไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตจากเจ้าของเว็บไซต์",
      "**ห้ามสร้างบัญชีปลอม** หรือใช้ข้อมูลเท็จในการลงทะเบียนเข้าใช้งาน",
    ],
  },
  {
    icon: Shield,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "4. ความปลอดภัยของบัญชีผู้ใช้",
    items: [
      "นักเรียนเป็น**ผู้รับผิดชอบ**ในการรักษาความลับของรหัสผ่านและบัญชีของตนเอง",
      "หากพบการเข้าใช้งานที่ผิดปกติ กรุณา**แจ้งครูผู้สอนทันที**ผ่าน LINE Official",
      "ครูผู้สอนมีสิทธิ์**ระงับหรือเพิกถอน**สิทธิ์การเข้าใช้งานหากพบการกระทำที่ฝ่าฝืนข้อกำหนด",
      "ระบบจะ**ล็อกบัญชีชั่วคราว**หากตรวจพบการพยายามเข้าสู่ระบบที่ผิดปกติ เช่น กรอกรหัสผ่านผิดเกิน 5 ครั้ง",
    ],
  },
  {
    icon: Gavel,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    title: "5. ทรัพย์สินทางปัญญา",
    items: [
      "เนื้อหา สื่อการสอน และผลงานบนเว็บไซต์นี้เป็น**ทรัพย์สินทางปัญญา**ของกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
      "**ผลงานศิลปะของนักเรียน**ที่อัปโหลดในระบบยังคงเป็นทรัพย์สินของนักเรียนเจ้าของผลงาน โรงเรียนอาจนำมาแสดงเพื่อวัตถุประสงค์ทางการศึกษา",
      "ไอเดียที่แชร์บนเว็บไซต์ถือเป็น**การเผยแพร่เพื่อสาธารณประโยชน์** ผู้อื่นสามารถนำไปเป็นแรงบันดาลใจได้แต่ไม่ควรลอกเลียนแบบทั้งหมด",
    ],
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "6. ข้อจำกัดความรับผิดชอบ",
    items: [
      "เว็บไซต์นี้**ไม่มีการเก็บค่าใช้จ่าย**ใดๆ ทั้งสิ้น ทั้งค่าสมาชิก ค่าดาวน์โหลด หรือค่าบริการ",
      "โรงเรียน**ไม่รับผิดชอบ**ต่อความเสียหายที่เกิดจากการใช้งานเว็บไซต์ภายนอกที่มีลิงก์เชื่อมโยงจากเว็บไซต์นี้",
      "เว็บไซต์อาจ**หยุดให้บริการชั่วคราว**เพื่อการปรับปรุงหรือบำรุงรักษาระบบ โดยไม่ต้องแจ้งให้ทราบล่วงหน้า",
      "เนื้อหาและฟีเจอร์ต่างๆ อาจมีการ**เปลี่ยนแปลง ปรับปรุง หรือยกเลิก**ได้ตลอดเวลา",
    ],
  },
  {
    icon: Scale,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    title: "7. การเปลี่ยนแปลงข้อกำหนด",
    items: [
      "โรงเรียนสงวนสิทธิ์ในการ**แก้ไข เปลี่ยนแปลง เพิ่มเติม** ข้อกำหนดการใช้งานได้ตลอดเวลา",
      "การเปลี่ยนแปลงจะ**มีผลบังคับใช้ทันที**เมื่อประกาศบนเว็บไซต์",
      "ท่านควร**ตรวจสอบข้อกำหนด**เป็นระยะๆ เพื่อรับทราบการเปลี่ยนแปลงที่อาจเกิดขึ้น",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-transparent">
        {/* Hero Header */}
        <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 -right-20 w-64 h-64 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs sm:text-sm font-bold mb-5 border border-orange-200 shadow-xs">
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight mb-4 leading-tight">
              ข้อกำหนดและเงื่อนไข
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-rose-600">
                การใช้งานเว็บไซต์
              </span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
              กรุณาอ่านข้อกำหนดเหล่านี้อย่างละเอียดก่อนเข้าใช้งานเว็บไซต์ Art Room
              กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-xs text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>ปรับปรุงล่าสุด: ตุลาคม 2567</span>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="container mx-auto px-4 sm:px-6 max-w-4xl pb-20">
          <div className="space-y-6 sm:space-y-8">
            {terms.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  <div className="flex items-center gap-3.5 p-5 sm:p-6 border-b border-gray-50">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${section.iconBg} ${section.iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">{section.title}</h2>
                  </div>

                  <div className="px-5 sm:px-6 py-4 sm:py-5">
                    <ul className="space-y-3">
                      {section.items.map((item, i) => (
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

            {/* Contact for Questions */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl sm:rounded-3xl border border-orange-100 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">มีคำถามเกี่ยวกับข้อกำหนด?</h2>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    หากท่านมีข้อสงสัยเกี่ยวกับข้อกำหนดการใช้งาน สามารถสอบถามเพิ่มเติมได้ที่:
                  </p>
                  <div className="bg-white/80 rounded-xl border border-orange-100/50 p-4 space-y-2 text-sm text-gray-700">
                    <p><strong className="text-gray-900">กลุ่มสาระการเรียนรู้ศิลปะ</strong></p>
                    <p>โรงเรียนวชิรธรรมสาธิต เขตสวนหลวง กรุงเทพมหานคร</p>
                    <p>
                      LINE Official:{" "}
                      <a
                        href="https://line.me/R/ti/p/@137odaxl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 font-semibold hover:underline"
                      >
                        @137odaxl
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
