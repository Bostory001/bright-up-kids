"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const BTN = {
  primary: "bg-amber-500 text-white hover:bg-amber-600",
  ghost: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BTN }) {
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-40 ${BTN[variant]} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}>{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

const INPUT = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-base outline-none focus:border-amber-500";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT} ${props.className ?? ""}`} />;
}

export function ErrorText({ children }: { children?: ReactNode }) {
  return children ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{children}</p> : null;
}

const BADGE = {
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-700",
};

export function Badge({ color = "gray", children }: { color?: keyof typeof BADGE; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[color]}`}>{children}</span>;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 [&_td]:px-3 [&_td]:py-2">{children}</tbody>
      </table>
    </div>
  );
}

// กล่องแสดงข้อมูลลับที่เห็นได้ครั้งเดียว (PIN / รหัสผ่านชั่วคราว)
export function SecretBox({ title, lines, onClose }: { title: string; lines: [string, string | undefined][]; onClose: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4">
      <div className="font-bold">{title}</div>
      <p className="text-xs text-gray-600">จดไว้ตอนนี้ ระบบจะไม่แสดงอีก</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {lines
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-gray-600">{k}</dt>
              <dd className="font-mono text-lg font-bold">{v}</dd>
            </div>
          ))}
      </dl>
      <Button variant="ghost" className="mt-3" onClick={onClose}>
        จดแล้ว ปิด
      </Button>
    </div>
  );
}
