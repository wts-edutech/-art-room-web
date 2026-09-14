import { Suspense } from "react";
import LessonDetailClient from "./LessonDetailClient";
import GuestBlockModal from "@/components/modals/GuestBlockModal";
import { getSession } from "@/lib/api-auth";
import { redirect } from "next/navigation";

export default async function LessonDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();

  const params = await searchParams;
  const idQuery = params?.id ? `?id=${params.id}` : "";
  const targetRedirect = `/materials/m4/detail${idQuery}`;

  if (!session) {
    redirect(`/login?tab=student&redirect=${encodeURIComponent(targetRedirect)}&notice=student_only`);
  }

  if (session.role !== "student") {
    return <GuestBlockModal redirectPath={targetRedirect} />;
  }

  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#FDF9F1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </main>
    }>
      <LessonDetailClient />
    </Suspense>
  );
}

