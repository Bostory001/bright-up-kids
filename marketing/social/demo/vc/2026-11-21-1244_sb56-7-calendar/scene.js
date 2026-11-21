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
    "รู้ไหมว่าเวลาหนึ่งปีมาจากการโคจรของโลก",
    "รอบดวงอาทิตย์"
   ]
  },
  "e2": {
   "cap": [
    "โลกโคจรครบหนึ่งรอบ",
    "ใช้เวลาประมาณสามร้อยหกสิบห้าวัน"
   ]
  },
  "e3": {
   "cap": [
    "เราแบ่งหนึ่งปีเป็นสิบสองเดือน",
    "เดือนละสามสิบหรือสามสิบเอ็ดวัน"
   ]
  },
  "e4": {
   "cap": [
    "มีเดือนกุมภาพันธ์เดือนเดียวที่มีวันน้อยกว่านั้น"
   ]
  },
  "e5": {
   "cap": [
    "โลกหมุนรอบตัวเองหนึ่งรอบ",
    "ใช้เวลาหนึ่งวัน",
    "หรือยี่สิบสี่ชั่วโมง"
   ]
  },
  "e6": {
   "cap": [
    "หนึ่งชั่วโมงมีหกสิบนาที",
    "และหนึ่งนาทีมีหกสิบวินาที"
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
     "face": "happy",
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
     "until": "@e1:ปี-0.1"
    },
    {
     "cap": "1 ปี",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e1:ปี"
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
     "cap": "ประมาณ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:สามร้อยหกสิบห้า-0.1"
    },
    {
     "cap": "365 วัน",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e2:สามร้อยหกสิบห้า-0.3",
     "from": 0,
     "to": 365,
     "dur": 0.6
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
     "face": "wink",
     "color": "yellow",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ส่วนใหญ่",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e3:สิบสองเดือน-0.1"
    },
    {
     "cap": "12 เดือน",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e3:สิบสองเดือน"
    }
   ]
  },
  "e4": {
   "cam": "push",
   "bg": "waves",
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
     "cap": "ข้อยกเว้น",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e4:กุมภาพันธ์-0.1"
    },
    {
     "cap": "ก.พ. วันน้อย",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "pink",
     "at": "@e4:กุมภาพันธ์"
    }
   ]
  },
  "e5": {
   "cam": "whip",
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
     "cap": "โลกหมุน",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:ยี่สิบสี่ชั่วโมง-0.1"
    },
    {
     "cap": "24 ชั่วโมง",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "blue",
     "at": "@e5:ยี่สิบสี่ชั่วโมง"
    }
   ]
  },
  "e6": {
   "cam": "pull",
   "bg": "stripes",
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
     "cap": "จำไว้เลย",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:หกสิบนาที-0.1"
    },
    {
     "cap": "60 นาที | 60 วินาที",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink"
     ],
     "at": [
      "@e6:หกสิบนาที",
      "@e6:หกสิบวินาที"
     ]
    },
    {
     "fx": "confetti",
     "at": "@e6:หกสิบวินาที+0.2"
    }
   ]
  }
 }
};
