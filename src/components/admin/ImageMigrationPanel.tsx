"use client";

import { useEffect, useState } from "react";
import { swalSuccess, swalError } from "@/lib/swal";

export default function ImageMigrationPanel() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [r2Ready, setR2Ready] = useState<boolean>(false);
  const [running, setRunning] = useState(false);
  const [migratedTotal, setMigratedTotal] = useState(0);

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/migrate-images", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setRemaining(data.remaining);
        setR2Ready(Boolean(data.r2Ready));
      }
    } catch {}
  };

  useEffect(() => {
    refresh();
  }, []);

  const runMigration = async () => {
    setRunning(true);
    setMigratedTotal(0);
    let total = 0;
    let errorCount = 0;
    try {
      // Process in small batches until nothing is left
      for (let i = 0; i < 500; i++) {
        const res = await fetch("/api/admin/migrate-images", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "ย้ายรูปไม่สำเร็จ");
        total += data.migrated || 0;
        errorCount += (data.errors || []).length;
        setMigratedTotal(total);
        setRemaining(data.remaining);
        if (!data.remaining || (data.migrated === 0 && (data.errors || []).length > 0)) break;
      }
      if (errorCount > 0) {
        swalError("ย้ายรูปเสร็จบางส่วน", `ย้ายสำเร็จ ${total} งาน, ผิดพลาด ${errorCount} รายการ`);
      } else {
        swalSuccess("ย้ายรูปเสร็จแล้ว", `ย้ายรูปงานนักเรียน ${total} งานไปเก็บที่ R2 เรียบร้อย`);
      }
    } catch (e: any) {
      swalError("เกิดข้อผิดพลาด", e?.message);
    } finally {
      setRunning(false);
      refresh();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 font-kanit">ย้ายรูปงานนักเรียนไปเก็บที่ Cloudflare R2</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            ลดพื้นที่ฐานข้อมูล D1 โดยย้ายรูปเก่าที่เก็บแบบ base64 ไปไว้ใน R2 (รูปยังแสดงผลเหมือนเดิม)
          </p>
        </div>
        <button
          type="button"
          onClick={runMigration}
          disabled={running || !r2Ready || !remaining}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {running ? `กำลังย้าย... (${migratedTotal})` : "เริ่มย้ายรูป"}
        </button>
      </div>
      <div className="text-xs text-gray-600 flex gap-4 flex-wrap">
        <span>
          สถานะ R2:{" "}
          <strong className={r2Ready ? "text-emerald-600" : "text-rose-600"}>
            {r2Ready ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ"}
          </strong>
        </span>
        <span>
          งานที่ยังค้างใน D1: <strong>{remaining === null ? "-" : remaining}</strong>
        </span>
      </div>
    </div>
  );
}

