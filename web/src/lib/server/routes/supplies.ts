import "server-only";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_KEYS } from "../../finance";
import { stockLines } from "../../supplies";
import type { ExpenseCategory, SupplyItem, SupplyMove } from "../../types";
import { OWNER, route, STAFF } from "../router";
import { bkkDate, dateStr, HttpError, newId, nowIso, num, oneOf, optStr, str } from "../util";

// ---------- คลังของใช้ ----------
// ซื้อเข้า: ผูกกับรายจ่ายหมวดของใช้ (id ของการเคลื่อนไหว = "exp-<expenseId>" แก้/ลบรายจ่ายแล้วคลังตามทันที)
// เบิกออก: ครูกดเบิกเองได้ เพราะเป็นงานประจำวัน

const SUPPLY_CATEGORIES = EXPENSE_CATEGORY_KEYS.filter((k) => EXPENSE_CATEGORIES[k].kind === "supply");

route("GET", "admin/supplies", STAFF, async ({ store }) => {
  const today = bkkDate();
  const [items, moves] = await Promise.all([store.list<SupplyItem>("supply_items"), store.list<SupplyMove>("supply_moves")]);
  const lines = stockLines(items, moves, today);
  return {
    lines,
    lowCount: lines.filter((l) => l.low).length,
    categories: SUPPLY_CATEGORIES.map((key) => ({ key, label: EXPENSE_CATEGORIES[key].label })),
    recent: moves
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20)
      .map((m) => ({ ...m, itemName: items.find((i) => i.id === m.itemId)?.name ?? "(ถูกลบ)" })),
  };
});

route("POST", "admin/supplies", STAFF, async ({ store, body }) => {
  const item: SupplyItem = {
    id: newId(),
    name: str(body.name, "ชื่อของใช้", 80),
    unit: str(body.unit, "หน่วยนับ", 20),
    category: oneOf(body.category, SUPPLY_CATEGORIES, "หมวด") as ExpenseCategory,
    minQty: body.minQty === undefined || body.minQty === "" ? undefined : num(body.minQty, "จุดเตือนของใกล้หมด", 0, 100_000),
    note: optStr(body.note, 200),
    createdAt: nowIso(),
  };
  await store.set("supply_items", item);
  return { item };
});

route("PATCH", "admin/supplies/:id", STAFF, async ({ store, body, params }) => {
  const cur = await store.get<SupplyItem>("supply_items", params.id);
  if (!cur) throw new HttpError(404, "ไม่พบของใช้ชิ้นนี้");
  const next: SupplyItem = {
    ...cur,
    name: str(body.name ?? cur.name, "ชื่อของใช้", 80),
    unit: str(body.unit ?? cur.unit, "หน่วยนับ", 20),
    category: oneOf(body.category ?? cur.category, SUPPLY_CATEGORIES, "หมวด") as ExpenseCategory,
    minQty: body.minQty === undefined || body.minQty === "" ? undefined : num(body.minQty, "จุดเตือนของใกล้หมด", 0, 100_000),
    note: optStr(body.note ?? cur.note, 200),
  };
  await store.set("supply_items", next);
  return { item: next };
});

// ลบของใช้ทิ้งทั้งประวัติ — เฉพาะเจ้าของ
route("DELETE", "admin/supplies/:id", OWNER, async ({ store, params }) => {
  const moves = (await store.list<SupplyMove>("supply_moves")).filter((m) => m.itemId === params.id);
  for (const m of moves) await store.remove("supply_moves", m.id);
  await store.remove("supply_items", params.id);
  return { ok: true, removedMoves: moves.length };
});

// เบิกใช้ / รับเข้าด้วยมือ (ของที่ได้มาฟรี หรือปรับยอดหลังนับจริง)
route("POST", "admin/supplies/:id/move", STAFF, async ({ store, body, params, me }) => {
  const item = await store.get<SupplyItem>("supply_items", params.id);
  if (!item) throw new HttpError(404, "ไม่พบของใช้ชิ้นนี้");
  const kind = oneOf(body.kind, ["in", "out"] as const, "ประเภทการเคลื่อนไหว");
  const qty = num(body.qty, "จำนวน", 0.01, 100_000);

  if (kind === "out") {
    const moves = await store.list<SupplyMove>("supply_moves");
    const have = moves.filter((m) => m.itemId === item.id).reduce((s, m) => s + (m.kind === "in" ? m.qty : -m.qty), 0);
    if (qty > have) throw new HttpError(400, `เบิกเกินของที่มี (เหลือ ${Math.round(have * 100) / 100} ${item.unit})`);
  }

  const move: SupplyMove = {
    id: newId(),
    itemId: item.id,
    date: body.date ? dateStr(body.date, "วันที่") : bkkDate(),
    kind,
    qty,
    note: optStr(body.note, 200),
    by: me!.id,
    createdAt: nowIso(),
  };
  await store.set("supply_moves", move);
  return { move };
});

route("DELETE", "admin/supplies/moves/:id", STAFF, async ({ store, params }) => {
  const move = await store.get<SupplyMove>("supply_moves", params.id);
  if (move?.expenseId) throw new HttpError(400, "รายการนี้มาจากการซื้อ ให้แก้ที่หน้ารายจ่ายแทน");
  await store.remove("supply_moves", params.id);
  return { ok: true };
});
