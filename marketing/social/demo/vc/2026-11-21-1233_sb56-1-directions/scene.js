// DATA ONLY - generated from series spec (SB56)
window.VC_SCENE = {
 "palette": "pop",
 "bg": "rays",
 "cam": "punch",
 "seed": 11,
 "flash": true,
 "lines": {
  "e1": {
   "cap": [
    "รู้ไหมว่าทิศหลักมีสี่ทิศ",
    "คือเหนือ ใต้ ตะวันออก ตะวันตก"
   ]
  },
  "e2": {
   "cap": [
    "ถ้าหันหน้าไปทางทิศเหนือ",
    "ด้านหลังของเราจะเป็นทิศใต้"
   ]
  },
  "e3": {
   "cap": [
    "มือซ้ายคือทิศตะวันตก",
    "ส่วนมือขวาคือทิศตะวันออก"
   ]
  },
  "e4": {
   "cap": [
    "เส้นที่พื้นดินไปบรรจบกับท้องฟ้า",
    "เราเรียกว่าเส้นขอบฟ้า"
   ]
  },
  "e5": {
   "cap": [
    "ดวงอาทิตย์ขึ้นจากขอบฟ้าทิศตะวันออก",
    "แล้วไปตกทางทิศตะวันตก"
   ]
  },
  "e6": {
   "cap": [
    "ที่เป็นแบบนี้เพราะโลกหมุนรอบตัวเอง",
    "พรุ่งนี้เช้าลองหันไปดูนะ"
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
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "รู้ไหมว่า",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:สี่ทิศ-0.1"
    },
    {
     "cap": "4 ทิศ!",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e1:สี่ทิศ"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
   "items": [
    {
     "art": "smile",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "หันหน้าไปทิศเหนือ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:ทิศใต้-0.1"
    },
    {
     "cap": "หลัง = ทิศใต้",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e2:ทิศใต้"
    }
   ]
  },
  "e3": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "smile",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ยืนหันหน้าไปทิศเหนือ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e3:มือซ้าย-0.1"
    },
    {
     "cap": "ซ้าย = ตะวันตก|ขวา = ตะวันออก",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "lime"
     ],
     "at": [
      "@e3:มือซ้าย",
      "@e3:มือขวา"
     ]
    }
   ]
  },
  "e4": {
   "cam": "push",
   "bg": "waves",
   "items": [
    {
     "art": "cloud",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "white",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "รู้จักไหม?",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:เส้นขอบฟ้า-0.1"
    },
    {
     "cap": "เส้นขอบฟ้า",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e4:เส้นขอบฟ้า"
    }
   ]
  },
  "e5": {
   "cam": "drift",
   "bg": "rays",
   "items": [
    {
     "art": "sun",
     "x": 540,
     "y": 1110,
     "s": 2.2,
     "face": "happy",
     "anim": "slide-l",
     "at": 0.1
    },
    {
     "cap": "ทุกวันเลย",
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
     "cap": "เพราะอะไรนะ?",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:โลกหมุน-0.1"
    },
    {
     "cap": "โลกหมุน!",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "blue",
     "at": "@e6:โลกหมุน"
    },
    {
     "fx": "confetti",
     "at": "@e6:ลอง+0.2"
    }
   ]
  }
 }
};
