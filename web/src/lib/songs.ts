// ต้นแบบ "เรียนจีนจากเพลง" — เนื้อเพลงถอดด้วย Whisper (ต้องตรวจกับต้นฉบับ) · พินอิน pinyin-pro · คำแปลไทยร่างโดย AI ยังไม่ผ่านครูตรวจ
export interface SongLine { start: number; end: number; zh: string; py: string; th: string; check?: boolean }
export interface Song { id: string; title: string; artist: string; video: string; lines: SongLine[] }

export const SONGS: Song[] = [
  {
    id: "song1",
    title: "情非得已 (เผลอใจรัก)",
    artist: "ต้นฉบับจาก TikTok @mew_china47 (ร่าง · รอตรวจลิขสิทธิ์/เนื้อเพลง)",
    video: "/songs/song1.mp4",
    lines: [
    { start: 0, end: 3.74, zh: "只怕我自己会爱上你", py: "zhǐ pà wǒ zì jǐ huì ài shàng nǐ", th: "แค่กลัวว่าตัวฉันเองจะตกหลุมรักเธอ" },
    { start: 3.74, end: 8.06, zh: "不敢让自己靠得太近", py: "bù gǎn ràng zì jǐ kào dé tài jìn", th: "ไม่กล้าให้ตัวเองเข้าใกล้เกินไป" },
    { start: 8.06, end: 9.5, zh: "靠得太近", py: "kào dé tài jìn", th: "ใกล้เกินไป" },
    { start: 9.5, end: 12.66, zh: "怕我没什么能够给你", py: "pà wǒ méi shén me néng gòu gěi nǐ", th: "กลัวว่าฉันไม่มีอะไรจะให้เธอได้" },
    { start: 12.66, end: 17.14, zh: "爱你也需要很大的勇气", py: "ài nǐ yě xū yào hěn dà de yǒng qì", th: "การรักเธอก็ต้องใช้ความกล้าอย่างมาก" },
    { start: 17.14, end: 22, zh: "只怕我自己会爱上你", py: "zhǐ pà wǒ zì jǐ huì ài shàng nǐ", th: "แค่กลัวว่าตัวฉันเองจะตกหลุมรักเธอ" },
    { start: 22, end: 26.22, zh: "也许有天会情不自禁", py: "yě xǔ yǒu tiān huì qíng bú zì jīn", th: "บางทีสักวันอาจห้ามใจไม่ไหว" },
    { start: 26.22, end: 30.52, zh: "想念只让自己苦了自己", py: "xiǎng niàn zhǐ ràng zì jǐ kǔ le zì jǐ", th: "ความคิดถึงมีแต่จะทำให้ตัวเองทุกข์ใจ" },
    { start: 30.52, end: 37.22, zh: "爱上你是我情非得已", py: "ài shàng nǐ shì wǒ qíng fēi dé yǐ", th: "การตกหลุมรักเธอ เป็นสิ่งที่ฉันห้ามใจไม่ได้เลย" },
    { start: 37.22, end: 41.78, zh: "什么原因", py: "shén me yuán yīn", th: "เพราะอะไรกันนะ" },
    { start: 41.78, end: 46.48, zh: "我竟然又会遇见你", py: "wǒ jìng rán yòu huì yù jiàn nǐ", th: "ทำไมฉันถึงได้มาพบเธออีกครั้ง" },
    { start: 46.48, end: 52.62, zh: "我真的真的不愿意", py: "wǒ zhēn de zhēn de bú yuàn yì", th: "ฉันไม่อยากเลยจริง ๆ" },
    { start: 52.62, end: 55.44, zh: "就这样陷入爱的陷阱", py: "jiù zhè yàng xiàn rù ài de xiàn jǐng", th: "ต้องตกลงไปในกับดักความรักแบบนี้" },
    ],
  },
];
