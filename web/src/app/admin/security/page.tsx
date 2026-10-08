"use client";

import { useMe } from "@/components/me";
import { SecurityPanel } from "@/components/SecurityPanel";

export default function SecurityPage() {
  const { me, reload } = useMe();
  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">ความปลอดภัย</h1>
      <SecurityPanel totpEnabled={me.totpEnabled} onChanged={reload} />
    </div>
  );
}
