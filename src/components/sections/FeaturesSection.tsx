import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Lightbulb, Smile, BookOpen } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "เรียนสนุก",
      description: "คลาสเรียนที่ออกแบบมาให้ผู้เรียนได้สนุกกับการปลดปล่อยจินตนาการ ค้นพบตัวเองผ่านศิลปะ",
      icon: <Smile className="w-6 h-6 sm:w-10 sm:h-10 text-(--color-primary-500) transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-red-50 group-hover:bg-red-100",
      borderColor: "group-hover:border-red-200",
    },
    {
      title: "เข้าใจง่าย",
      description: "อธิบายเทคนิคและขั้นตอนต่างๆ อย่างละเอียดและเป็นกันเอง เริ่มต้นจากศูนย์ก็เรียนได้",
      icon: <Lightbulb className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-500 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-yellow-50 group-hover:bg-yellow-100",
      borderColor: "group-hover:border-yellow-200",
    },
    {
      title: "หลากหลายเทคนิค",
      description: "ครอบคลุมทั้งสีน้ำ สีไม้ สีโปสเตอร์ และวาดเส้น EE ให้คุณเลือกเรียนตามสไตล์ที่ชอบ",
      icon: <Palette className="w-6 h-6 sm:w-10 sm:h-10 text-(--color-accent-blue) transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-blue-50 group-hover:bg-blue-100",
      borderColor: "group-hover:border-blue-200",
    },
    {
      title: "สื่อการสอนครบครัน",
      description: "รวบรวมไอเดีย กิจกรรม และใบงานต่างๆ ให้ฝึกฝน พัฒนาฝีมือได้อย่างต่อเนื่อง",
      icon: <BookOpen className="w-6 h-6 sm:w-10 sm:h-10 text-green-500 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-green-50 group-hover:bg-green-100",
      borderColor: "group-hover:border-green-200",
    }
  ];

  return (
    <section id="features" className="py-10 sm:py-16 md:py-24 bg-transparent">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-2 sm:mb-4 tracking-tight">
            ทำไมต้องเรียนกับ <span className="text-(--color-primary-500)">Art Room</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-base md:text-xl font-light leading-relaxed">
            โรงเรียนคุณภาพ บริการด้วยหัวใจ ไม่ทิ้งใครคนใดไว้ข้างหลัง <br className="hidden md:block" />
            เราตั้งใจสร้างสรรค์สื่อการสอนที่ตอบโจทย์ทุกคน
          </p>
        </div>

        {/* 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {(Array.isArray(features) ? features : []).map((feature, index) => (
            <Card key={index} className={`group border border-gray-100 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl sm:rounded-3xl overflow-hidden ${feature.borderColor}`}>
              <CardHeader className="text-center p-3 sm:p-6 pb-2 sm:pb-3 pt-5 sm:pt-8">
                <div className={`mx-auto w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-5 transition-colors duration-500 ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xs sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 px-2 sm:px-5 pb-4 sm:pb-8 pt-0 leading-relaxed font-light text-[11px] sm:text-sm line-clamp-3 sm:line-clamp-none">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
