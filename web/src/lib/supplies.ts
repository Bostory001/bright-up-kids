// คลังของใช้: จำนวนคงเหลือคิดจากผลรวมการเคลื่อนไหวเสมอ ไม่เก็บเป็นตัวเลขนิ่ง ๆ
// เพราะตัวเลข snapshot จะเพี้ยนทันทีที่มีคนแก้/ลบรายจ่ายย้อนหลัง

import type { SupplyItem, SupplyMove } from "./types";

export interface StockLine {
  item: SupplyItem;
  /** รับเข้าทั้งหมด */
  totalIn: number;
  /** เบิกออกทั้งหมด */
  totalOut: number;
  qty: number;
  /** ต่ำกว่าหรือเท่ากับจุดเตือน */
  low: boolean;
  /** เบิกออกย้อนหลัง 30 วัน ใช้ประมาณว่าจะใช้หมดเมื่อไร */
  usedLast30: number;
  /** ประมาณว่าของจะหมดในกี่วัน (null = ยังไม่มีข้อมูลการใช้) */
  daysLeft: number | null;
  lastMoveDate?: string;
}

export function stockOf(item: SupplyItem, moves: SupplyMove[], today: string): StockLine {
  const mine = moves.filter((m) => m.itemId === item.id);
  const sum = (kind: SupplyMove["kind"], from?: string) =>
    mine.filter((m) => m.kind === kind && (!from || m.date >= from)).reduce((s, m) => s + m.qty, 0);
  const totalIn = sum("in");
  const totalOut = sum("out");
  const qty = Math.round((totalIn - totalOut) * 100) / 100;
  const from = new Date(Date.parse(`${today}T00:00:00.000Z`) - 30 * 86_400_000).toISOString().slice(0, 10);
  const usedLast30 = sum("out", from);
  const perDay = usedLast30 / 30;
  return {
    item,
    totalIn,
    totalOut,
    qty,
    low: item.minQty !== undefined && qty <= item.minQty,
    usedLast30,
    daysLeft: perDay > 0 ? Math.floor(qty / perDay) : null,
    lastMoveDate: mine.map((m) => m.date).sort().at(-1),
  };
}

export function stockLines(items: SupplyItem[], moves: SupplyMove[], today: string): StockLine[] {
  return items
    .map((item) => stockOf(item, moves, today))
    .sort((a, b) => Number(b.low) - Number(a.low) || a.item.name.localeCompare(b.item.name));
}
