// DATA ONLY - generated from series spec (SB56)
window.VC_SCENE = {
 "palette": "sunny",
 "bg": "rays",
 "cam": "punch",
 "seed": 11,
 "flash": true,
 "lines": {
  "e1": {
   "cap": [
    "ไม่มีเข็มทิศก็หาทิศได้",
    "แค่ดูเงาของสิ่งของตอนมีแดด"
   ]
  },
  "e2": {
   "cap": [
    "ตอนเช้าดวงอาทิตย์อยู่ทางตะวันออก",
    "เงาจึงทอดไปทางตะวันตก"
   ]
  },
  "e3": {
   "cap": [
    "ตอนเย็นดวงอาทิตย์อยู่ทางตะวันตก",
    "เงาก็ทอดไปทางตะวันออก"
   ]
  },
  "e4": {
   "cap": [
    "ตอนเที่ยงเงาจะสั้นที่สุด",
    "เพราะดวงอาทิตย์อยู่สูงเหนือหัว"
   ]
  },
  "e5": {
   "cap": [
    "ยืนให้มือขวาชี้ไปทางที่ดวงอาทิตย์ขึ้น",
    "หน้าเราจะหันไปทางทิศเหนือ"
   ]
  },
  "e6": {
   "cap": [
    "วิธีนี้ได้ทิศโดยประมาณนะ",
    "ลองทำกับเพื่อนดูสิ"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "sun",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "wink",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ไม่มีเข็มทิศ?",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:เงา-0.1"
    },
    {
     "cap": "ดูเงา!",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e1:เงา"
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
     "anim": "slide-l",
     "at": 0.1
    },
    {
     "cap": "ตอนเช้า",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e2:ตะวันตก-0.1"
    },
    {
     "cap": "เงา → ตะวันตก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e2:ตะวันตก"
    }
   ]
  },
  "e3": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "sun",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "smirk",
     "anim": "slide-r",
     "at": 0.1
    },
    {
     "cap": "ตอนเย็น",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:ตะวันออก-0.1"
    },
    {
     "cap": "เงา → ตะวันออก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "blue",
     "at": "@e3:ตะวันออก"
    }
   ]
  },
  "e4": {
   "cam": "push",
   "bg": "waves",
   "items": [
    {
     "art": "sun",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "shock",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ตอนเที่ยง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e4:สั้นที่สุด-0.1"
    },
    {
     "cap": "เงาสั้นสุด!",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "orange",
     "at": "@e4:สั้นที่สุด"
    }
   ]
  },
  "e5": {
   "cam": "whip",
   "bg": "rays",
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
     "cap": "ลองทำตอนเช้า",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e5:ทิศเหนือ-0.1"
    },
    {
     "cap": "หน้า = เหนือ",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "lime",
     "at": "@e5:ทิศเหนือ"
    }
   ]
  },
  "e6": {
   "cam": "pull",
   "bg": "stripes",
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
     "cap": "ข้อควรรู้",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:โดยประมาณ-0.1"
    },
    {
     "cap": "โดยประมาณ",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e6:โดยประมาณ"
    },
    {
     "fx": "sparkles",
     "x": 540,
     "y": 1000,
     "r": 380,
     "at": "@e6:ลอง"
    }
   ]
  }
 }
};
