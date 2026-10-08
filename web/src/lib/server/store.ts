import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

// ที่เก็บข้อมูลมี 2 แบบ ใช้ interface เดียวกัน:
// - file: ไฟล์ .data/db.json สำหรับพัฒนา/ทดลองในเครื่อง (ไม่ต้องมี Firebase)
// - firestore: ใช้จริง เมื่อตั้ง FIREBASE_SERVICE_ACCOUNT ใน env
// client ไม่แตะ Firestore ตรง ๆ เลย ทุกอย่างผ่าน API ของเรา → firestore.rules ปิดทั้งหมดได้

export interface Doc {
  id: string;
}

type Where = Record<string, string | number | boolean>;

export interface Store {
  kind: "file" | "firestore";
  get<T extends Doc>(col: string, id: string): Promise<T | null>;
  list<T extends Doc>(col: string, where?: Where): Promise<T[]>;
  set<T extends Doc>(col: string, doc: T): Promise<void>;
  /** อ่าน-แก้-เขียนแบบ atomic: fn คืน null = ไม่เขียน */
  update<T extends Doc>(col: string, id: string, fn: (cur: T | null) => T | null): Promise<T | null>;
  remove(col: string, id: string): Promise<void>;
}

// ---------- file ----------

type FileDb = Record<string, Record<string, Doc>>;

function createFileStore(): Store {
  const file = path.join(process.cwd(), ".data", "db.json");
  let db: FileDb = {};
  if (existsSync(file)) db = JSON.parse(readFileSync(file, "utf8"));

  function persist() {
    mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, JSON.stringify(db));
    renameSync(tmp, file);
  }
  const clone = <T>(v: T): T => structuredClone(v);

  // ทุกคำสั่งเป็น synchronous ภายใน event loop เดียว จึง atomic โดยธรรมชาติ
  return {
    kind: "file",
    async get<T extends Doc>(col: string, id: string) {
      const doc = db[col]?.[id];
      return doc ? (clone(doc) as T) : null;
    },
    async list<T extends Doc>(col: string, where?: Where) {
      const docs = Object.values(db[col] ?? {}) as T[];
      const entries = Object.entries(where ?? {});
      return clone(docs.filter((d) => entries.every(([k, v]) => (d as Record<string, unknown>)[k] === v)));
    },
    async set(col, doc) {
      (db[col] ??= {})[doc.id] = clone(doc);
      persist();
    },
    async update<T extends Doc>(col: string, id: string, fn: (cur: T | null) => T | null) {
      const cur = db[col]?.[id];
      const next = fn(cur ? (clone(cur) as T) : null);
      if (!next) return null;
      (db[col] ??= {})[id] = clone(next);
      persist();
      return next;
    },
    async remove(col, id) {
      if (db[col]?.[id]) {
        delete db[col][id];
        persist();
      }
    },
  };
}

// ---------- firestore ----------

async function createFirestoreStore(serviceAccountJson: string): Promise<Store> {
  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  const fs = getFirestore(app);
  try {
    fs.settings({ ignoreUndefinedProperties: true });
  } catch {
    // ตั้งค่าไปแล้วใน process นี้
  }

  return {
    kind: "firestore",
    async get<T extends Doc>(col: string, id: string) {
      const snap = await fs.collection(col).doc(id).get();
      return snap.exists ? (snap.data() as T) : null;
    },
    async list<T extends Doc>(col: string, where?: Where) {
      let q: FirebaseFirestore.Query = fs.collection(col);
      for (const [k, v] of Object.entries(where ?? {})) q = q.where(k, "==", v);
      const snap = await q.get();
      return snap.docs.map((d) => d.data() as T);
    },
    async set(col, doc) {
      await fs.collection(col).doc(doc.id).set(doc);
    },
    async update<T extends Doc>(col: string, id: string, fn: (cur: T | null) => T | null) {
      const ref = fs.collection(col).doc(id);
      return fs.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const next = fn(snap.exists ? (snap.data() as T) : null);
        if (next) tx.set(ref, next);
        return next;
      });
    },
    async remove(col, id) {
      await fs.collection(col).doc(id).delete();
    },
  };
}

// เก็บใน globalThis กัน HMR สร้างซ้ำ
const g = globalThis as unknown as { __bukStore?: Promise<Store> };

export function getStore(): Promise<Store> {
  if (!g.__bukStore) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    g.__bukStore = sa ? createFirestoreStore(sa) : Promise.resolve(createFileStore());
  }
  return g.__bukStore;
}
