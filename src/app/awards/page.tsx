import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AwardsTable from "@/components/sections/AwardsTable";

export default function AwardsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen">
        <div className="mb-20">
          <AwardsTable />
        </div>
      </main>
      <Footer />
    </>
  );
}
