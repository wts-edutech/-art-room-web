import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import fs from "fs";
import path from "path";
import CalendarView from "@/components/ui/CalendarView";

// Helper to get activities on server side
function getActivities() {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const data = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(data);
    const activitiesList = db.activities || [];
    // Sort descending by created time
    return activitiesList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to read db", error);
    return [];
  }
}

export default function ActivitiesPage() {
  const activities = getActivities();

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 opacity-[0.08] rounded-full blur-[80px] -z-10"></div>
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-red-400 opacity-[0.05] rounded-full blur-[60px] -z-10"></div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
              กิจกรรมต่างๆ
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              ประมวลภาพกิจกรรมและผลงานนักเรียนจากโครงการต่างๆ ของ Art Room
            </p>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-12 items-start mt-8">
            {/* Left Column: Calendar */}
            <div className="w-full xl:w-[350px] flex-shrink-0 sticky top-32">
              <CalendarView activities={activities} />
            </div>

            {/* Right Column: Gallery */}
            <div className="flex-1 w-full">
              <h2 className="text-3xl font-bold font-heading text-gray-900 mb-8 tracking-tight border-l-4 border-(--color-primary-500) pl-4">
                ประมวลภาพกิจกรรมที่ผ่านมา
              </h2>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg">ยังไม่มีประมวลภาพกิจกรรมในขณะนี้</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(Array.isArray(activities) ? activities : []).map((activity: any, index: number) => (
                    <div key={activity.id} className={`group rounded-2xl overflow-hidden relative h-[300px] shadow-sm hover:shadow-xl transition-all duration-500 ${index % 3 === 2 ? 'md:col-span-2' : ''}`}>
                      <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={activity.imageUrl} 
                          alt={activity.title}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found")}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90"></div>
                      <div className={`absolute bottom-0 left-0 p-8 w-full ${index % 3 === 2 ? 'md:w-2/3' : ''}`}>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full inline-block border border-white/20 shadow-sm">{activity.date}</span>
                          {activity.location && (
                            <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full inline-flex items-center gap-1 border border-blue-400/50 shadow-sm">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {activity.location}
                            </span>
                          )}
                        </div>
                        <h3 className={`font-bold font-heading text-white mb-2 ${index % 3 === 2 ? 'text-3xl' : 'text-2xl'}`}>{activity.title}</h3>
                        <p className="text-gray-200 text-sm font-light line-clamp-2">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
