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
    "ลองจินตนาการว่า",
    "เรายืนกลางทุ่งโล่ง",
    "มองเห็นท้องฟ้าเป็นโดมครึ่งวงกลม"
   ]
  },
  "e2": {
   "cap": [
    "เราคือศูนย์กลาง",
    "ของทรงกลมฟ้า ที่ใช้บอกตำแหน่งของดวงดาว"
   ]
  },
  "e3": {
   "cap": [
    "ทิศทั้งสี่ คือ เหนือ",
    "ใต้ ตะวันออก ตะวันตก",
    "ล้อมรอบตัวเรา"
   ]
  },
  "e4": {
   "cap": [
    "หันหน้าไปทางเหนือ",
    "หลังคือใต้ ซ้ายมือตะวันตก",
    "ขวามือตะวันออก"
   ]
  },
  "e5": {
   "cap": [
    "จุดเหนือศีรษะ คือจุดสูงสุดบนฟ้า",
    "อยู่เหนือหัวเราพอดี"
   ]
  },
  "e6": {
   "cap": [
    "ส่วนจุดใต้เท้า",
    "เป็นจุดต่ำสุด อยู่ใต้เท้าเรา"
   ]
  },
  "e7": {
   "cap": [
    "เส้นขอบฟ้า คือแนวที่ฟ้ามาบรรจบพื้น",
    "มองเห็นเป็นวงกลมรอบตัว"
   ]
  },
  "e8": {
   "cap": [
    "เส้นเมอริเดียน",
    "ลากจากเหนือไปใต้",
    "ผ่านจุดเหนือศีรษะพอดี"
   ]
  },
  "e9": {
   "cap": [
    "ตอนเที่ยงวัน ดวงอาทิตย์จะเคลื่อนมาถึงเส้นเมอริเดียนพอดี"
   ]
  },
  "e10": {
   "cap": [
    "สรุป สี่ทิศ สองจุด",
    "และสองเส้น ที่ใช้บอกตำแหน่งบนฟ้า"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
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
     "cap": "ลองจินตนาการ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:โดม-0.1"
    },
    {
     "cap": "โดมฟ้า",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e1:โดม"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
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
     "cap": "เราคือ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:ศูนย์กลาง-0.1"
    },
    {
     "cap": "ศูนย์กลาง",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e2:ศูนย์กลาง"
    }
   ]
  },
  "e3": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "star",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "spin",
     "idle": "spin",
     "at": 0.1
    },
    {
     "cap": "รอบตัวเรา",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e3:ทิศทั้งสี่-0.1"
    },
    {
     "cap": "4 ทิศ",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e3:ทิศทั้งสี่"
    }
   ]
  },
  "e4": {
   "cam": "push",
   "bg": "waves",
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
     "cap": "หันหน้าไปทางเหนือ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:หลัง-0.1"
    },
    {
     "cap": "หลัง = ใต้|ซ้าย = ตะวันตก|ขวา = ตะวันออก",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e4:หลัง",
      "@e4:ซ้ายมือ",
      "@e4:ขวามือ"
     ]
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
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "pop",
     "idle": "bob",
     "at": 0.1
    },
    {
     "cap": "จุดที่ 1",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:จุดเหนือศีรษะ-0.1"
    },
    {
     "cap": "จุดเหนือศีรษะ",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "pink",
     "at": "@e5:จุดเหนือศีรษะ"
    }
   ]
  },
  "e6": {
   "cam": "punch",
   "bg": "checker",
   "items": [
    {
     "art": "arrow",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "blue",
     "anim": "pop",
     "idle": "bob",
     "rot": 180,
     "at": 0.1
    },
    {
     "cap": "จุดที่ 2",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e6:จุดใต้เท้า-0.1"
    },
    {
     "cap": "จุดใต้เท้า",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "blue",
     "at": "@e6:จุดใต้เท้า"
    }
   ]
  },
  "e7": {
   "cam": "push",
   "bg": "dots",
   "items": [
    {
     "art": "ring",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "white",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "เส้นที่ 1",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e7:เส้นขอบฟ้า-0.1"
    },
    {
     "cap": "เส้นขอบฟ้า",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e7:เส้นขอบฟ้า"
    }
   ]
  },
  "e8": {
   "cam": "whip",
   "bg": "waves",
   "items": [
    {
     "art": "arrow",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "lime",
     "anim": "pop",
     "idle": "bob",
     "at": 0.1
    },
    {
     "cap": "เส้นที่ 2",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e8:เส้นเมอริเดียน-0.1"
    },
    {
     "cap": "เส้นเมอริเดียน",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "lime",
     "at": "@e8:เส้นเมอริเดียน"
    }
   ]
  },
  "e9": {
   "cam": "punch",
   "bg": "rays",
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
     "cap": "น่ารู้",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e9:เที่ยงวัน-0.1"
    },
    {
     "cap": "เที่ยงวัน",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e9:เที่ยงวัน"
    }
   ]
  },
  "e10": {
   "cam": "pull",
   "bg": "stripes",
   "items": [
    {
     "art": "trophy",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "idle": "bob",
     "at": 0.1
    },
    {
     "cap": "สรุป",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e10:สี่ทิศ-0.1"
    },
    {
     "cap": "4 ทิศ|2 จุด|2 เส้น",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e10:สี่ทิศ",
      "@e10:สองจุด",
      "@e10:สองเส้น"
     ]
    },
    {
     "fx": "confetti",
     "at": "@e10:บนฟ้า+0.2"
    }
   ]
  }
 }
};
