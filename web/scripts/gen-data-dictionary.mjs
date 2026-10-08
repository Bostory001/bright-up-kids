// สร้าง Data Dictionary จาก src/lib/types.ts → src/generated/data-dictionary.json
// รันอัตโนมัติก่อน dev/build (predev, prebuild ใน package.json)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src/lib/types.ts");
const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

function jsDoc(node) {
  const doc = node.jsDoc?.[0];
  if (!doc) return { text: "", tags: {} };
  const text = typeof doc.comment === "string" ? doc.comment : (doc.comment ?? []).map((c) => c.text).join("");
  const tags = {};
  for (const tag of doc.tags ?? []) tags[tag.tagName.text] = typeof tag.comment === "string" ? tag.comment.trim() : "";
  return { text: text.trim(), tags };
}

const collections = [];
for (const node of source.statements) {
  if (!ts.isInterfaceDeclaration(node)) continue;
  const { text, tags } = jsDoc(node);
  if (!tags.collection) continue;
  collections.push({
    collection: tags.collection,
    name: node.name.text,
    description: text,
    fields: node.members.filter(ts.isPropertySignature).map((m) => ({
      name: m.name.getText(source),
      type: m.type?.getText(source).replace(/\s+/g, " ") ?? "unknown",
      required: !m.questionToken,
      description: jsDoc(m).text,
    })),
  });
}

const out = path.join(root, "src/generated/data-dictionary.json");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(collections, null, 2) + "\n");
console.log(`data dictionary: ${collections.length} collections`);
