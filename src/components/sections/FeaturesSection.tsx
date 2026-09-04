import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Lightbulb, Smile, BookOpen } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "เรียนสนุก",
      description: "คลาสเรียนที่ออกแบบมาให้ผู้เรียนได้สนุกกับการปลดปล่อยจินตนาการ ค้นพบตัวเองผ่านศิลปะ",
      icon: <Smile className="w-10 h-10 text-(--color-primary-500) transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-red-50 group-hover:bg-red-100",
      borderColor: "group-hover:border-red-200",
    },
    {
      title: "เข้าใจง่าย",
      description: "อธิบายเทคนิคและขั้นตอนต่างๆ อย่างละเอียดและเป็นกันเอง เริ่มต้นจากศูนย์ก็เรียนได้",
      icon: <Lightbulb className="w-10 h-10 text-yellow-500 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-yellow-50 group-hover:bg-yellow-100",
      borderColor: "group-hover:border-yellow-200",
    },
    {
      title: "หลากหลายเทคนิค",
      description: "ครอบคลุมทั้งสีน้ำ สีไม้ สีโปสเตอร์ และวาดเส้น EE ให้คุณเลือกเรียนตามสไตล์ที่ชอบ",
      icon: <Palette className="w-10 h-10 text-(--color-accent-blue) transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-blue-50 group-hover:bg-blue-100",
      borderColor: "group-hover:border-blue-200",
    },
    {
      title: "สื่อการสอนครบครัน",
      description: "รวบรวมไอเดีย กิจกรรม และใบงานต่างๆ ให้ฝึกฝน พัฒนาฝีมือได้อย่างต่อเนื่อง",
      icon: <BookOpen className="w-10 h-10 text-green-500 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-green-50 group-hover:bg-green-100",
      borderColor: "group-hover:border-green-200",
    }
  ];

  return (
    <section id="features" className="py-24 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
            ทำไมต้องเรียนกับ <span className="text-(--color-primary-500)">Art Room</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl font-light">
            โรงเรียนคุณภาพ บริการด้วยหัวใจ ไม่ทิ้งใครคนใดไว้ข้างหลัง <br className="hidden md:block" />
            เราตั้งใจสร้างสรรค์สื่อการสอนที่ตอบโจทย์ทุกคน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {(Array.isArray(features) ? features : []).map((feature, index) => (
            <Card key={index} className={`group border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white rounded-3xl overflow-hidden ${feature.borderColor}`}>
              <CardHeader className="text-center pb-4 pt-10">
                <div className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600 px-6 pb-10 leading-relaxed font-light">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
