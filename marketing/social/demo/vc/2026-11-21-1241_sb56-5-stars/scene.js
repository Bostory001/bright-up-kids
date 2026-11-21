// DATA ONLY - generated from series spec (SB56)
window.VC_SCENE = {
 "palette": "night",
 "bg": "rays",
 "cam": "punch",
 "seed": 11,
 "flash": true,
 "lines": {
  "e1": {
   "cap": [
    "ดาวที่เรามองเห็นบนฟ้ามีสองแบบ",
    "คือดาวฤกษ์กับดาวเคราะห์"
   ]
  },
  "e2": {
   "cap": [
    "ดาวฤกษ์มีแสงในตัวเอง",
    "เหมือนดวงอาทิตย์เลย"
   ]
  },
  "e3": {
   "cap": [
    "ดาวเคราะห์ที่เห็นด้วยตาเปล่ามีห้าดวง",
    "พุธ ศุกร์ อังคาร",
    "พฤหัส เสาร์"
   ]
  },
  "e4": {
   "cap": [
    "ดาวฤกษ์หลายดวงรวมกันเป็นกลุ่มดาว",
    "รูปร่างเหมือนเดิมทุกคืน"
   ]
  },
  "e5": {
   "cap": [
    "เราจึงใช้กลุ่มดาวบอกทิศได้",
    "กลุ่มดาวขึ้นทางตะวันออก",
    "ตกทางตะวันตก"
   ]
  },
  "e6": {
   "cap": [
    "เพราะโลกหมุนไปทางตะวันออก",
    "ดาวเลยดูเหมือนเคลื่อนไปทางตะวันตก"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "star",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "wink",
     "color": "yellow",
     "anim": "spin",
     "at": 0.1
    },
    {
     "cap": "รู้ไหมว่า",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:ดาวฤกษ์-0.1"
    },
    {
     "cap": "ดาวฤกษ์",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e1:ดาวฤกษ์"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
   "items": [
    {
     "art": "sun",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ดาวฤกษ์",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e2:แสงในตัวเอง-0.1"
    },
    {
     "cap": "มีแสงเอง!",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "yellow",
     "at": "@e2:แสงในตัวเอง"
    }
   ]
  },
  "e3": {
   "cam": "push",
   "bg": "stripes",
   "items": [
    {
     "art": "sparkle",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "idle": "spin",
     "at": 0.1
    },
    {
     "cap": "ดาวเคราะห์",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:ห้าดวง-0.1"
    },
    {
     "cap": "5 ดวง",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e3:ห้าดวง-0.3",
     "from": 0,
     "to": 5,
     "dur": 0.6
    }
   ]
  },
  "e4": {
   "cam": "drift",
   "bg": "waves",
   "items": [
    {
     "art": "star",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "ข้อสังเกต",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e4:กลุ่มดาว-0.1"
    },
    {
     "cap": "กลุ่มดาว",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "lime",
     "at": "@e4:กลุ่มดาว"
    }
   ]
  },
  "e5": {
   "cam": "whip",
   "bg": "rays",
   "items": [
    {
     "art": "arrow",
     "x": 540,
     "y": 1110,
     "s": 2.2,
     "color": "red",
     "anim": "pop",
     "idle": "bob",
     "at": 0.1
    },
    {
     "cap": "เหมือนดวงอาทิตย์",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e5:ตะวันออก-0.1"
    },
    {
     "cap": "ขึ้น ตะวันออก",
     "kind": "swipe",
     "y": 470,
     "size": 110,
     "color": "yellow",
     "at": "@e5:ตะวันออก"
    },
    {
     "cap": "ตก ตะวันตก",
     "kind": "swipe",
     "y": 760,
     "size": 110,
     "color": "pink",
     "at": "@e5:ตะวันตก"
    }
   ]
  },
  "e6": {
   "cam": "pull",
   "bg": "stripes",
   "items": [
    {
     "art": "eye",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "white",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ที่จริงแล้ว",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:ตะวันตก-0.1"
    },
    {
     "cap": "โลกต่างหากที่หมุน!",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "lime",
     "at": "@e6:ตะวันตก"
    },
    {
     "fx": "sparkles",
     "x": 540,
     "y": 1000,
     "r": 380,
     "at": "@e6:ตะวันตก"
    }
   ]
  }
 }
};
