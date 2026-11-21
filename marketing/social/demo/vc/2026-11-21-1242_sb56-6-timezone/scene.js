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
    "ตอนไทยเป็นเวลาเช้า",
    "ที่อเมริกายังเป็นกลางคืน ทำไมนะ"
   ]
  },
  "e2": {
   "cap": [
    "เพราะโลกกลมและหมุนไปเรื่อยๆ",
    "แต่ละที่จึงได้รับแสงอาทิตย์ไม่พร้อมกัน"
   ]
  },
  "e3": {
   "cap": [
    "เราจึงแบ่งโลกเป็นยี่สิบสี่เขตเวลา",
    "เขตละหนึ่งชั่วโมง"
   ]
  },
  "e4": {
   "cap": [
    "แต่ละเขตกว้างสิบห้าองศา",
    "สิบห้าคูณยี่สิบสี่ได้สามร้อยหกสิบ"
   ]
  },
  "e5": {
   "cap": [
    "ไทยใช้เวลาตามเส้นลองจิจูดหนึ่งร้อยห้าองศาตะวันออก"
   ]
  },
  "e6": {
   "cap": [
    "เวลาไทยจึงเร็วกว่าเวลาสากลที่กรีนิชเจ็ดชั่วโมง"
   ]
  },
  "e7": {
   "cap": [
    "ถ้ากรีนิชเป็นเที่ยงวัน",
    "ไทยก็เป็นหนึ่งทุ่มแล้ว"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "moon",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ทำไมนะ?",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:กลางคืน-0.1"
    },
    {
     "cap": "เวลาไม่เท่ากัน!",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e1:กลางคืน"
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
     "cap": "เหตุผลคือ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:แสงอาทิตย์-0.1"
    },
    {
     "cap": "โลกหมุน",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e2:แสงอาทิตย์"
    }
   ]
  },
  "e3": {
   "cam": "push",
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
     "cap": "แบ่งโลก",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:ยี่สิบสี่-0.1"
    },
    {
     "cap": "24 เขตเวลา",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e3:ยี่สิบสี่-0.3",
     "from": 0,
     "to": 24,
     "dur": 0.6
    }
   ]
  },
  "e4": {
   "cam": "punch",
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
     "until": "@e4:สามร้อยหกสิบ-0.1"
    },
    {
     "cap": "15 × 24 = 360",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e4:สามร้อยหกสิบ"
    }
   ]
  },
  "e5": {
   "cam": "whip",
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
     "cap": "ประเทศไทย",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:ตะวันออก-0.1"
    },
    {
     "cap": "105 องศา ตะวันออก",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e5:ตะวันออก"
    }
   ]
  },
  "e6": {
   "cam": "punch",
   "bg": "rays",
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
     "cap": "ผลที่ได้",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:เจ็ดชั่วโมง-0.1"
    },
    {
     "cap": "เร็วกว่า 7 ชม.",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e6:เจ็ดชั่วโมง"
    }
   ]
  },
  "e7": {
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
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e7:หนึ่งทุ่ม-0.1"
    },
    {
     "cap": "เที่ยง → 1 ทุ่ม",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e7:หนึ่งทุ่ม"
    },
    {
     "fx": "confetti",
     "at": "@e7:หนึ่งทุ่ม+0.2"
    }
   ]
  }
 }
};
