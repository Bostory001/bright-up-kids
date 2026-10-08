import dictionary from "@/generated/data-dictionary.json";

// สร้างอัตโนมัติจาก src/lib/types.ts — แก้คำอธิบายที่ comment ในไฟล์นั้น ไม่ต้องแก้หน้านี้
export default function DataDictionaryPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Data Dictionary</h1>
      <p className="text-sm text-gray-600">ข้อมูลทั้งหมดที่ระบบเก็บ {dictionary.length} ชุด — สร้างอัตโนมัติจากโค้ดทุกครั้งที่เปิดระบบ</p>
      <nav className="flex flex-wrap gap-2 print:hidden">
        {dictionary.map((c) => (
          <a key={c.collection} href={`#${c.collection}`} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
            {c.collection}
          </a>
        ))}
      </nav>
      {dictionary.map((c) => (
        <section key={c.collection} id={c.collection} className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-mono text-lg font-bold text-amber-700">{c.collection}</h2>
          <p className="mb-2 text-sm text-gray-600">{c.description}</p>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="py-1 pr-3 font-medium">ฟิลด์</th>
                <th className="py-1 pr-3 font-medium">ชนิด</th>
                <th className="py-1 pr-3 font-medium">จำเป็น</th>
                <th className="py-1 font-medium">คำอธิบาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {c.fields.map((f) => (
                <tr key={f.name}>
                  <td className="py-1 pr-3 font-mono">{f.name}</td>
                  <td className="py-1 pr-3 font-mono text-xs text-gray-600">{f.type}</td>
                  <td className="py-1 pr-3">{f.required ? "✓" : ""}</td>
                  <td className="py-1">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
