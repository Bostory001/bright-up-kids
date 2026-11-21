# สร้างโปรเจกต์คลิป genhaha-lesson จากสเปกสั้นๆ (เนื้อหาแต่งเอง ใช้แค่หัวข้อจากหนังสือ ป.5)
# ใช้: python make_clips.py [slug ...]  แล้วรัน voice/check/render ต่อด้วย run_all.sh
import re, subprocess, sys, os, json, glob
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
LS = os.path.join(ROOT, ".claude/skills/genhaha-lesson/scripts/lesson.mjs")
OUT = os.path.join(ROOT, "marketing/social/demo/gh")

CLIPS = [
 dict(slug="be-verbs", title="ศัพท์ ป.5 am is are", eb="GRAMMAR · ป.5", cover="am · is · are|[be verbs]",
  hook=dict(a="am / is", b="are?", t="[am] [is] [are] ใช้ยังไง?", tb="are"),
  items=[
   dict(term="am", meaning="ใช้กับ I", sub="เท่านั้น", line="[am] ใช้กับ I เท่านั้น", tm="ใช้กับ", ts="เท่านั้น", eng="I [am] a student.", gloss="ฉันเป็นนักเรียน", hit="am"),
   dict(term="is", meaning="he / she / it", sub="คนเดียว", line="[is] ใช้กับ คนเดียว หรือ สิ่งเดียว", tm="ใช้กับ", ts="คนเดียว", eng="She [is] my teacher.", gloss="เธอเป็นครูของฉัน", hit="is"),
   dict(term="are", meaning="we / you / they", sub="หลายคน", line="[are] ใช้กับ หลายคน และ คนที่เราคุยด้วย", tm="ใช้กับ", ts="หลายคน", eng="They [are] my friends.", gloss="พวกเขาเป็นเพื่อนของฉัน", hit="are"),
  ],
  tip=dict(title="ปฏิเสธ เติม not", sub="หลัง am is are", label="NEGATIVE", text="He is [not] tall.", gloss="เขาไม่สูง",
           l1="ปฏิเสธ ให้เติม [not] หลัง be", l2="ถามคำถาม ให้ย้าย be ไปไว้หน้าประโยค", hit="not"),
  outro=dict(word="am·is·are", sub="I am · he is · they are")),
 dict(slug="was-were", title="ศัพท์ ป.5 was were", eb="GRAMMAR · ป.5", cover="was · were|[past be]",
  hook=dict(a="was", b="were?", t="[was] กับ [were] ต่างกันยังไง?", tb="were"),
  items=[
   dict(term="was", meaning="เคยเป็น", sub="คนเดียว", line="[was] แปลว่า เคยเป็น ใช้กับ คนเดียว หรือ สิ่งเดียว", tm="แปลว่า", ts="คนเดียว", eng="He [was] tired yesterday.", gloss="เมื่อวานเขาเหนื่อย", hit="was"),
   dict(term="were", meaning="เคยเป็น", sub="หลายคน", line="[were] ก็แปลว่า เคยเป็น ใช้กับ หลายคน", tm="แปลว่า", ts="หลายคน", eng="We [were] at the zoo.", gloss="เราอยู่ที่สวนสัตว์", hit="were"),
   dict(term="yesterday", meaning="เมื่อวาน", sub="บอกอดีต", line="[yesterday] แปลว่า เมื่อวาน เป็นตัวบอกอดีต", tm="แปลว่า", ts="บอกอดีต", eng="It [was] sunny yesterday.", gloss="เมื่อวานแดดออก", hit="was"),
   dict(term="ago", meaning="ที่แล้ว", sub="ตามหลังเวลา", line="[ago] แปลว่า ที่แล้ว ตามหลังช่วงเวลา", tm="แปลว่า", ts="ตามหลัง", eng="They [were] here two days ago.", gloss="พวกเขาอยู่ที่นี่เมื่อสองวันก่อน", hit="were"),
  ],
  tip=dict(title="you ใช้ were เสมอ", sub="แม้เป็นคนเดียว", label="YOU", text="You [were] late.", gloss="คุณมาสาย",
           l1="คำว่า you ใช้ [were] เสมอ", l2="แม้พูดกับคนเดียว", say1="คำว่า ยู ใช้ were เสมอ", hit="were"),
  outro=dict(word="was·were", sub="I was · you were · we were")),
 dict(slug="there-is-are", title="ศัพท์ ป.5 there is there are", eb="GRAMMAR · ป.5", cover="There is|[There are]",
  hook=dict(a="there is", b="there are?", t="[there is] กับ [there are] ต่างกันยังไง?", tb="are"),
  items=[
   dict(term="there is", meaning="มี", sub="ชิ้นเดียว", line="[there is] แปลว่า มี ใช้กับ ของชิ้นเดียว", tm="แปลว่า", ts="ชิ้นเดียว", eng="There [is] a bin on the street.", gloss="มีถังขยะอยู่บนถนน", hit="is"),
   dict(term="there are", meaning="มี", sub="หลายชิ้น", line="[there are] แปลว่า มี ใช้กับ ของหลายชิ้น", tm="แปลว่า", ts="หลายชิ้น", eng="There [are] three apples on the table.", gloss="มีแอปเปิลสามผลบนโต๊ะ", hit="are"),
   dict(term="some", meaning="หลายๆ", sub="พหูพจน์", line="[some] แปลว่า หลายๆ ใช้กับนามพหูพจน์", tm="แปลว่า", ts="พหูพจน์", eng="There are [some] birds in the tree.", gloss="มีนกหลายตัวบนต้นไม้", hit="some"),
  ],
  tip=dict(title="ถามว่า มีไหม?", sub="สลับ is ไปหน้า there", label="QUESTION", text="[Is] there a bin here?", gloss="แถวนี้มีถังขยะไหม",
           l1="คำถามให้สลับ [is] หรือ are ไปไว้หน้า there", l2="ดูว่าของที่ตามมาเป็นชิ้นเดียวหรือหลายชิ้น", hit="is"),
  outro=dict(word="there is/are", sub="one → is · many → are")),
 dict(slug="do-does", title="ศัพท์ ป.5 do does", eb="GRAMMAR · ป.5", cover="do · does|[questions]",
  hook=dict(a="do", b="does?", t="[do] กับ [does] ใช้ต่างกันยังไง?", tb="does"),
  items=[
   dict(term="do", meaning="ช่วยถาม", sub="ฉัน เธอ เรา", line="[do] ใช้ช่วยถาม กับ ฉัน เธอ เรา พวกเขา", tm="ช่วยถาม", ts="ฉัน", eng="[Do] you like fish?", gloss="คุณชอบปลาไหม", hit="Do"),
   dict(term="does", meaning="ช่วยถาม", sub="เขา เธอ มัน", line="[does] ใช้ช่วยถาม กับ เขา เธอ มัน คนเดียว", tm="ช่วยถาม", ts="เขา", eng="[Does] she play tennis?", gloss="เธอเล่นเทนนิสไหม", hit="Does"),
   dict(term="don't", meaning="ไม่", sub="ปฏิเสธ", line="[don't] แปลว่า ไม่ ใช้ปฏิเสธ กับ ฉัน เธอ เรา พวกเขา", tm="แปลว่า", ts="ปฏิเสธ", eng="I [don't] eat meat.", gloss="ฉันไม่กินเนื้อสัตว์", hit="don't"),
   dict(term="doesn't", meaning="ไม่", sub="ปฏิเสธ", line="[doesn't] แปลว่า ไม่ ใช้ปฏิเสธ กับ เขา เธอ มัน", tm="แปลว่า", ts="ปฏิเสธ", eng="She [doesn't] eat meat.", gloss="เธอไม่กินเนื้อสัตว์", hit="doesn't"),
  ],
  tip=dict(title="หลัง does ไม่เติม s", sub="กริยาใช้ช่องเดิม", label="VERB", text="Does he [like] cats?", gloss="เขาชอบแมวไหม",
           l1="หลัง does กริยาไม่ต้องเติม s", l2="Does he like ถูก ไม่ใช่ likes", hit="like"),
  outro=dict(word="do·does", sub="I do · she does")),
 dict(slug="3rs-recycle", title="ศัพท์ ป.5 ช่วยโลก 3R", eb="VOCAB · ป.5", cover="Help our|[planet]",
  hook=dict(a="reduce", b="reuse?", t="[reduce] [reuse] [recycle] คืออะไร?", tb="reuse"),
  items=[
   dict(term="reduce", meaning="ลดการใช้", sub="ใช้ให้น้อยลง", line="[reduce] แปลว่า ลดการใช้ ใช้ให้น้อยลง", tm="แปลว่า", ts="ใช้ให้น้อย", eng="We [reduce] plastic bags.", gloss="เราลดการใช้ถุงพลาสติก", hit="reduce"),
   dict(term="reuse", meaning="ใช้ซ้ำ", sub="ใช้อีกครั้ง", line="[reuse] แปลว่า ใช้ซ้ำ ใช้อีกครั้ง", tm="แปลว่า", ts="ใช้อีกครั้ง", eng="I [reuse] glass bottles.", gloss="ฉันใช้ขวดแก้วซ้ำ", hit="reuse"),
   dict(term="recycle", meaning="รีไซเคิล", sub="ทำใหม่", line="[recycle] แปลว่า รีไซเคิล นำกลับมาทำใหม่", tm="แปลว่า", ts="ทำใหม่", eng="Please [recycle] old paper.", gloss="กรุณารีไซเคิลกระดาษเก่า", hit="recycle"),
   dict(term="bin", meaning="ถังขยะ", sub="ทิ้งขยะ", line="[bin] แปลว่า ถังขยะ ไว้ทิ้งขยะ", tm="แปลว่า", ts="ทิ้งขยะ", eng="Put it in the [bin].", gloss="ทิ้งมันลงถังขยะ", hit="bin"),
  ],
  tip=dict(title="rubbish = ขยะ", sub="อเมริกันใช้ trash", label="WORD", text="Please put [rubbish] in the bin.", gloss="กรุณาทิ้งขยะลงถัง",
           l1="[rubbish] คือขยะ แบบอังกฤษ", l2="ถ้าแบบอเมริกันจะใช้ trash", hit="rubbish"),
  outro=dict(word="3R", sub="reduce · reuse · recycle")),
 dict(slug="past-ed", title="ศัพท์ ป.5 กริยาอดีต ed", eb="GRAMMAR · ป.5", cover="Past|[+ed]",
  hook=dict(a="play", b="played?", t="เล่าเรื่องอดีต ต้อง [เติม ed]", tb="ed"),
  items=[
   dict(term="played", meaning="เติม ed", sub="กริยาทั่วไป", line="[play] เติม ed เป็น [played]", tm="เติม", ts="ed", eng="The children [played] outside.", gloss="เด็กๆ เล่นข้างนอก", hit="played"),
   dict(term="lived", meaning="เติม d", sub="ลงท้ายด้วย e", line="[live] ลงท้ายด้วย e เติมแค่ d เป็น [lived]", tm="ลงท้าย", ts="e", eng="Mammoths [lived] long ago.", gloss="แมมมอธอยู่เมื่อนานมาแล้ว", hit="lived"),
   dict(term="studied", meaning="y → ied", sub="ลงท้ายด้วย y", line="[study] เปลี่ยน y เป็น ied เป็น [studied]", tm="เปลี่ยน", ts="ied", eng="She [studied] hard.", gloss="เธอตั้งใจเรียน", hit="studied"),
  ],
  tip=dict(title="บางคำไม่เติม ed", sub="จำเป็นคำๆ", label="IRREGULAR", text="I [went] to the zoo.", gloss="ฉันไปสวนสัตว์",
           l1="คำเปลี่ยนรูป เช่น go เป็น [went]", l2="ต้องจำเป็นคำๆ", hit="went"),
  outro=dict(word="+ed", sub="play → played")),
 dict(slug="animal-adjectives", title="ศัพท์ ป.5 บรรยายสัตว์", eb="VOCAB · ป.5", cover="Animal|[adjectives]",
  hook=dict(a="fast", b="slow?", t="สัตว์ไหน [เร็ว] สัตว์ไหน [ช้า]?", tb="ช้า"),
  items=[
   dict(term="fast", meaning="เร็ว", sub="ตรงข้าม slow", line="[fast] แปลว่า เร็ว ตรงข้ามกับ ช้า", tm="แปลว่า", ts="ตรงข้าม", eng="A cheetah is [fast].", gloss="เสือชีตาห์วิ่งเร็ว", hit="fast"),
   dict(term="heavy", meaning="หนัก", sub="ตรงข้าม light", line="[heavy] แปลว่า หนัก ตรงข้ามกับ เบา", tm="แปลว่า", ts="ตรงข้าม", eng="An elephant is [heavy].", gloss="ช้างตัวหนัก", hit="heavy"),
   dict(term="tall", meaning="สูง", sub="ตรงข้าม short", line="[tall] แปลว่า สูง ตรงข้ามกับ เตี้ย", tm="แปลว่า", ts="ตรงข้าม", eng="A giraffe is [tall].", gloss="ยีราฟตัวสูง", hit="tall"),
   dict(term="strong", meaning="แข็งแรง", sub="ตรงข้าม weak", line="[strong] แปลว่า แข็งแรง ตรงข้ามกับ อ่อนแอ", tm="แปลว่า", ts="ตรงข้าม", eng="A bear is [strong].", gloss="หมีแข็งแรง", hit="strong"),
  ],
  tip=dict(title="has got = มี", sub="บอกลักษณะสัตว์", label="HAS GOT", text="A giraffe [has got] a long neck.", gloss="ยีราฟมีคอยาว",
           l1="[has got] แปลว่า มี ใช้บอกลักษณะ", l2="ใช้กับ เขา เธอ มัน", hit="has got"),
  outro=dict(word="ANIMALS", sub="fast · heavy · tall · strong")),
]

def js(s): return json.dumps(s, ensure_ascii=False)

def build(c, d):
    n = len(c["items"]); ids = ["hook"] + [f"i{k+1}" for k in range(n)] + ["tip", "end"]
    shots = []
    h = c["hook"]
    shots.append('    { id: "hook", start: 0, end: 1, chunks: [ { t: %s, key: "a1", sfx: "pop@0.1" } ]},' % js(h["t"]))
    keys = []
    for k, it in enumerate(c["items"]):
        b, e = f"b{k+1}", f"b{k+1}x"; keys.append((b, e))
        shots.append('    { id: "i%d", start: 0, end: 1, chunks: [\n      { t: %s, key: "%s" },\n      { t: %s, key: "%s", voice: "en", pause: 0.9, sfx: "pop@0.05" },\n    ]},' % (k+1, js(it["line"]), b, js(it["eng"]), e))
    t = c["tip"]
    l1 = '      { t: %s, key: "g1", sfx: "ding@0.3"' % js(t["l1"]) + (', say: %s' % js(t["say1"]) if t.get("say1") else "") + " },"
    shots.append('    { id: "tip", start: 0, end: 1, chunks: [\n%s\n      { t: %s, key: "g2", pause: 0.4 },\n    ]},' % (l1, js(t["l2"])))
    shots.append('    { id: "end", start: 0, end: 1, chunks: [ { t: "เซฟไว้ทบทวน แล้วกดฟอลโลว์นะ", key: "h1", pause: 0.6, sfx: "chime@0.1" } ]},')
    cap = open(os.path.join(d, "captions.js"), encoding="utf8").read()
    a = cap.index("const SHOTS = ["); b2 = cap.index("  ];", a) + 4
    cap = cap[:a] + "const SHOTS = [\n" + "\n".join(shots) + "\n  ];" + cap[b2:]
    open(os.path.join(d, "captions.js"), "w", encoding="utf8").write(cap)

    html = open(os.path.join(d, "index.html"), encoding="utf8").read()
    s = html.index('<section id="sc-hook"'); e = html.index('<audio id="vo"')
    secs = "".join('      <section id="sc-%s" class="clip" data-shot="%s" data-start="%d" data-duration="4" data-track-index="%d"></section>\n' % (i, i, k*3, 1+k%2) for k, i in enumerate(ids))
    html = html[:s] + secs.lstrip() + "\n      " + html[e:]
    s = html.index("L.grid();"); e = html.index("M.subtitles();")
    L = ['L.grid();', 'L.hook("#sc-hook", { eyebrow: %s, a: %s, b: %s, tb: B("a1", %s) });' % (js(c["eb"]), js(h["a"]), js(h["b"]), js(h["tb"]))]
    for k, it in enumerate(c["items"]):
        b, e2 = keys[k]
        L.append('L.define("#sc-i%d", { eyebrow: %s, term: %s, meaning: %s, sub: %s, y: 430, size: 170, tm: B("%s", %s), ts: B("%s", %s), example: { text: %s, gloss: %s, t: B("%s"), hit: B("%s", %s) } });' % (
            k+1, js("%02d · %s" % (k+1, it["term"].upper())), js(it["term"]), js(it["meaning"]), js(it["sub"]), b, js(it["tm"]), b, js(it["ts"]), js(it["eng"]), js(it["gloss"]), e2, e2, js(it["hit"])))
    L.append('L.tip("#sc-tip", { title: %s, sub: %s, card: { label: %s, text: %s, gloss: %s, t: B("g1", %s), hit: B("g2") } });' % (js(t["title"]), js(t["sub"]), js(t["label"]), js(t["text"]), js(t["gloss"]), js(t["hit"])))
    o = c["outro"]
    L.append('L.outro("#sc-end", { word: %s, sub: %s, pills: ["SAVE", "FOLLOW"], tp: B("h1", "เซฟ") });' % (js(o["word"]), js(o["sub"])))
    L.append("L.dots(" + js(["#sc-" + i for i in ids]) + ");")
    html = html[:s] + "\n      ".join(L) + "\n      " + html[e:]
    open(os.path.join(d, "index.html"), "w", encoding="utf8").write(html)
    vj = open(os.path.join(d, "video.json"), encoding="utf8").read()
    vj = re.sub(r'"cover":.*', '"cover": { "at": 3.0, "eyebrow": %s, "title": %s, "seconds": 0.1 },' % (js(c["eb"]), js(c["cover"])), vj)
    open(os.path.join(d, "video.json"), "w", encoding="utf8").write(vj)

if __name__ == "__main__":
    only = sys.argv[1:]
    for c in CLIPS:
        if only and c["slug"] not in only: continue
        if glob.glob(os.path.join(OUT, "*_" + c["slug"])): print("skip (exists)", c["slug"]); continue
        subprocess.run(["node", LS, "new", c["slug"], "--title", c["title"], "--dir", OUT], capture_output=True, text=True, encoding="utf8", cwd=ROOT)
        d = glob.glob(os.path.join(OUT, "*_" + c["slug"]))[0]
        build(c, d); print("built", d)
