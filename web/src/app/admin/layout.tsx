"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { type Me, MeContext } from "@/components/me";
import { SecurityPanel } from "@/components/SecurityPanel";
import { api, go, useLoad } from "@/lib/client/api";
import { ADMIN_NAV } from "@/lib/modules";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { data, reload } = useLoad<{ me: Me | null }>("me");
  const pathname = usePathname();
  const me = data?.me;
  const isStaff = me?.role === "owner" || me?.role === "teacher";

  useEffect(() => {
    if (data && !isStaff) go(me?.role === "parent" ? "/parent" : "/login");
  }, [data, isStaff, me]);

  if (!me || !isStaff) return <main className="flex-1 p-6 text-center text-gray-500">กำลังโหลด...</main>;

  async function logout() {
    await api("auth/logout", {});
    go("/");
  }

  // ยังไม่เปิด 2FA → บังคับตั้งค่าก่อน (server ก็กันทุก API ไว้เช่นกัน)
  if (!me.totpEnabled) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <h1 className="mb-4 text-xl font-bold">ตั้งค่าความปลอดภัยก่อนเริ่มใช้งาน</h1>
        <SecurityPanel totpEnabled={false} onChanged={reload} />
        <button onClick={logout} className="mt-4 text-sm text-gray-500 underline">
          ออกจากระบบ
        </button>
      </main>
    );
  }

  const nav = ADMIN_NAV.filter((m) => m.audience !== "owner" || me.role === "owner");
  return (
    <MeContext.Provider value={{ me, reload }}>
      <div className="flex flex-1 flex-col lg:flex-row">
        <nav className="flex gap-1 overflow-x-auto border-b border-amber-200 bg-white p-2 lg:w-56 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r print:hidden">
          <div className="hidden px-3 py-2 font-bold text-amber-600 lg:block">Bright Up Kids</div>
          {nav.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm ${pathname === m.href ? "bg-amber-100 font-bold text-amber-800" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {m.emoji} {m.title}
            </Link>
          ))}
          <button onClick={logout} className="whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 lg:mt-4">
            🚪 ออกจากระบบ ({me.displayName})
          </button>
        </nav>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 lg:p-6">
          {me.mustChangePassword && (
            <Link href="/admin/security" className="mb-4 block rounded-xl bg-red-50 p-3 text-sm text-red-700">
              ⚠️ คุณยังใช้รหัสผ่านชั่วคราว กรุณาเปลี่ยนรหัสผ่านที่หน้าความปลอดภัย
            </Link>
          )}
          {children}
        </main>
      </div>
    </MeContext.Provider>
  );
}
