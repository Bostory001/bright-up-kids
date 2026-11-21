// DATA ONLY - generated from series spec (SB56)
window.VC_SCENE = {
 "palette": "candy",
 "bg": "rays",
 "cam": "punch",
 "seed": 11,
 "flash": true,
 "lines": {
  "e1": {
   "cap": [
    "เวลาบนโลกมีหลายแบบ",
    "วันนี้มาเรียนแบบละเอียดกัน"
   ]
  },
  "e2": {
   "cap": [
    "โลกหมุนรอบตัวเองครบรอบ",
    "ใช้เวลายี่สิบสี่ชั่วโมง"
   ]
  },
  "e3": {
   "cap": [
    "เราจึงแบ่งโลกเป็นยี่สิบสี่เขต",
    "ตามเส้นลองจิจูด"
   ]
  },
  "e4": {
   "cap": [
    "แต่ละเขตกว้างสิบห้าองศา",
    "เพราะสามร้อยหกสิบหารยี่สิบสี่ได้สิบห้า"
   ]
  },
  "e5": {
   "cap": [
    "ข้ามหนึ่งเขต เวลาจะต่างกันหนึ่งชั่วโมง"
   ]
  },
  "e6": {
   "cap": [
    "เขตแรกมีเส้นเมอริเดียนแรก",
    "คือลองจิจูดศูนย์องศา"
   ]
  },
  "e7": {
   "cap": [
    "เวลามีสามแบบ แบบแรกคือเวลามาตรฐาน",
    "ของแต่ละประเทศ"
   ]
  },
  "e8": {
   "cap": [
    "ไทยใช้ลองจิจูดหนึ่งร้อยห้าองศาตะวันออก",
    "เร็วกว่าสากลเจ็ดชั่วโมง"
   ]
  },
  "e9": {
   "cap": [
    "ประเทศใหญ่มากอย่างรัสเซียกับอเมริกา",
    "มีหลายเวลา ตามพื้นที่"
   ]
  },
  "e10": {
   "cap": [
    "แบบที่สองคือเวลามาตรฐานสากล",
    "ใช้ลองจิจูดศูนย์องศา",
    "ตามเวลากรีนิช"
   ]
  },
  "e11": {
   "cap": [
    "แบบที่สามคือเวลาท้องถิ่น",
    "นับตามลองจิจูดของที่นั่นจริงๆ"
   ]
  },
  "e12": {
   "cap": [
    "เช่นอุบลราชธานี",
    "อยู่ราวหนึ่งร้อยห้าองศา",
    "จึงเร็วกว่าสากลราวเจ็ดชั่วโมง"
   ]
  },
  "e13": {
   "cap": [
    "สรุป เวลามีสามแบบ",
    "คือมาตรฐาน สากล",
    "และท้องถิ่น"
   ]
  },
  "e14": {
   "cap": [
    "ลองถามครูดูสิ ว่าตอนนี้ที่ลอนดอนเป็นกี่โมงแล้ว"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "clock",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "white",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ไปกัน!",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:เวลาบนโลก-0.1"
    },
    {
     "cap": "เวลาบนโลก",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e1:เวลาบนโลก"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
   "items": [
    {
     "art": "arrowcurve",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "white",
     "anim": "spin",
     "idle": "spin",
     "at": 0.1
    },
    {
     "cap": "เริ่มจาก",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:ยี่สิบสี่-0.1"
    },
    {
     "cap": "24 ชั่วโมง",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e2:ยี่สิบสี่-0.3",
     "from": 0,
     "to": 24,
     "dur": 0.6
    }
   ]
  },
  "e3": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "ring",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "blue",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "แบ่งโลก",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:ยี่สิบสี่เขต-0.1"
    },
    {
     "cap": "24 เขต",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e3:ยี่สิบสี่เขต-0.3",
     "from": 0,
     "to": 24,
     "dur": 0.6
    }
   ]
  },
  "e4": {
   "cam": "push",
   "bg": "checker",
   "items": [
    {
     "art": "bulb",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "คิดเลขกัน",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:หาร-0.1"
    },
    {
     "cap": "360 ÷ 24 = 15",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e4:หาร"
    }
   ]
  },
  "e5": {
   "cam": "whip",
   "bg": "waves",
   "items": [
    {
     "art": "clock",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "white",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "จำไว้",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:หนึ่งชั่วโมง-0.1"
    },
    {
     "cap": "ต่างกัน 1 ชม.",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e5:หนึ่งชั่วโมง"
    }
   ]
  },
  "e6": {
   "cam": "punch",
   "bg": "rays",
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
     "cap": "จุดเริ่มต้น",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:ศูนย์องศา-0.1"
    },
    {
     "cap": "0 องศา",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "yellow",
     "at": "@e6:ศูนย์องศา"
    }
   ]
  },
  "e7": {
   "cam": "push",
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
     "cap": "แบบที่ 1",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e7:เวลามาตรฐาน-0.1"
    },
    {
     "cap": "เวลามาตรฐาน",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e7:เวลามาตรฐาน"
    }
   ]
  },
  "e8": {
   "cam": "whip",
   "bg": "stripes",
   "items": [
    {
     "art": "rocket",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "pop",
     "idle": "bob",
     "at": 0.1
    },
    {
     "cap": "ประเทศไทย",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e8:เจ็ดชั่วโมง-0.1"
    },
    {
     "cap": "เร็วกว่า 7 ชม.",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e8:เจ็ดชั่วโมง"
    }
   ]
  },
  "e9": {
   "cam": "punch",
   "bg": "waves",
   "items": [
    {
     "art": "exclaim",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "ข้อสังเกต",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e9:หลายเวลา-0.1"
    },
    {
     "cap": "หลายเวลา!",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "orange",
     "at": "@e9:หลายเวลา"
    }
   ]
  },
  "e10": {
   "cam": "whip",
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
     "cap": "แบบที่ 2",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e10:เวลามาตรฐานสากล-0.1"
    },
    {
     "cap": "เวลาสากล",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e10:เวลามาตรฐานสากล"
    }
   ]
  },
  "e11": {
   "cam": "push",
   "bg": "checker",
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
     "cap": "แบบที่ 3",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e11:เวลาท้องถิ่น-0.1"
    },
    {
     "cap": "เวลาท้องถิ่น",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "pink",
     "at": "@e11:เวลาท้องถิ่น"
    }
   ]
  },
  "e12": {
   "cam": "punch",
   "bg": "dots",
   "items": [
    {
     "art": "clock",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "white",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e12:เจ็ดชั่วโมง-0.1"
    },
    {
     "cap": "อุบล +7 ชม.",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e12:เจ็ดชั่วโมง"
    }
   ]
  },
  "e13": {
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
     "until": "@e13:มาตรฐาน-0.1"
    },
    {
     "cap": "มาตรฐาน|สากล|ท้องถิ่น",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e13:มาตรฐาน",
      "@e13:สากล",
      "@e13:ท้องถิ่น"
     ]
    }
   ]
  },
  "e14": {
   "cam": "pull",
   "bg": "rays",
   "items": [
    {
     "art": "question",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "ท้าทาย",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e14:ลอนดอน-0.1"
    },
    {
     "cap": "ลอนดอนกี่โมง?",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e14:ลอนดอน"
    },
    {
     "fx": "confetti",
     "at": "@e14:กี่โมง+0.2"
    }
   ]
  }
 }
};
