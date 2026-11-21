"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type Me, MeContext } from "@/components/me";
import { SecurityPanel } from "@/components/SecurityPanel";
import { BRAND } from "@/lib/brand";
import { api, go, useLoad } from "@/lib/client/api";
import { ADMIN_NAV, type Module } from "@/lib/modules";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { data, reload } = useLoad<{ me: Me | null }>("me");
  const pathname = usePathname();
  const [favOverride, setFavOverride] = useState<string[] | null>(null);
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
  const favorites = (favOverride ?? me.favoriteNavs ?? []).map((href) => nav.find((m) => m.href === href)).filter((m): m is Module => !!m);

  // แสดงผลทันทีแล้วค่อยบันทึก — ถ้าบันทึกไม่ผ่านให้ย้อนกลับตามที่ server มี
  async function saveFavorites(hrefs: string[]) {
    setFavOverride(hrefs);
    try {
      await api("me/favorites", { hrefs });
    } catch {
      setFavOverride(null);
      reload();
    }
  }
  const toggleFavorite = (href: string) => {
    const current = favorites.map((m) => m.href);
    saveFavorites(current.includes(href) ? current.filter((h) => h !== href) : [...current, href]);
  };
  const moveUp = (href: string) => {
    const list = favorites.map((m) => m.href);
    const i = list.indexOf(href);
    if (i > 0) {
      [list[i - 1], list[i]] = [list[i], list[i - 1]];
      saveFavorites(list);
    }
  };

  const navItem = (m: Module, inFavorites: boolean) => {
    const isFav = favorites.some((f) => f.href === m.href);
    return (
      <div key={`${inFavorites ? "fav" : "all"}-${m.href}`} className={`group flex items-center rounded-xl ${pathname === m.href ? "bg-amber-100" : "hover:bg-gray-100"}`}>
        <Link href={m.href} className={`flex-1 whitespace-nowrap px-3 py-2 text-sm ${pathname === m.href ? "font-bold text-amber-800" : "text-gray-700"}`}>
          {m.emoji} {m.title}
        </Link>
        {inFavorites && favorites[0]?.href !== m.href && (
          <button onClick={() => moveUp(m.href)} title="ย้ายขึ้น" aria-label={`ย้าย ${m.title} ขึ้น`} className="px-1 text-xs text-gray-400 hover:text-gray-700">
            ▲
          </button>
        )}
        <button
          onClick={() => toggleFavorite(m.href)}
          title={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
          aria-label={isFav ? `เอา ${m.title} ออกจากรายการโปรด` : `เพิ่ม ${m.title} ในรายการโปรด`}
          aria-pressed={isFav}
          className={`px-2 py-2 text-sm ${isFav ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>
    );
  };

  return (
    <MeContext.Provider value={{ me, reload }}>
      <div className="flex flex-1 flex-col lg:flex-row">
        <nav className="flex gap-1 overflow-x-auto border-b border-amber-200 bg-white p-2 lg:w-56 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r print:hidden">
          <div className="hidden px-3 py-2 font-bold text-amber-600 lg:block">{BRAND}</div>
          {favorites.length > 0 && (
            <>
              <div className="hidden px-3 pt-1 text-xs font-semibold text-amber-600 lg:block">⭐ รายการโปรด</div>
              {favorites.map((m) => navItem(m, true))}
              <div className="hidden border-t border-gray-200 lg:my-1 lg:block" />
            </>
          )}
          {nav.map((m) => navItem(m, false))}
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
