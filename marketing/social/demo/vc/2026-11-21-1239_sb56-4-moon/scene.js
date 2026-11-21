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
    "ดวงจันทร์เสี้ยวก็ช่วยบอกทิศให้เราได้นะ"
   ]
  },
  "e2": {
   "cap": [
    "ช่วงข้างขึ้น เห็นเสี้ยวตอนหัวค่ำ",
    "อยู่ทางทิศตะวันตก"
   ]
  },
  "e3": {
   "cap": [
    "ด้านที่แหว่งของเสี้ยวนั้นจะหันไปทางทิศตะวันออก เสมอ"
   ]
  },
  "e4": {
   "cap": [
    "ช่วงข้างแรม เห็นเสี้ยวก่อนรุ่งเช้า",
    "อยู่ทางทิศตะวันออก"
   ]
  },
  "e5": {
   "cap": [
    "ด้านที่แหว่งจะหันไปทางทิศตะวันตก",
    "กลับกับข้างขึ้นเลย"
   ]
  },
  "e6": {
   "cap": [
    "ใช้ได้กับดวงจันทร์ตอนเป็นเสี้ยวเท่านั้นนะ"
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
     "cap": "รู้ไหมว่า",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:ดวงจันทร์เสี้ยว-0.1"
    },
    {
     "cap": "ดวงจันทร์บอกทิศ",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e1:ดวงจันทร์เสี้ยว"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
   "items": [
    {
     "art": "moon",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "slide-r",
     "at": 0.1
    },
    {
     "cap": "ข้างขึ้น",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e2:ตะวันตก-0.1"
    },
    {
     "cap": "หัวค่ำ → ตะวันตก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e2:ตะวันตก"
    }
   ]
  },
  "e3": {
   "cam": "push",
   "bg": "stripes",
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
     "cap": "ข้างขึ้น",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:ตะวันออก-0.1"
    },
    {
     "cap": "แหว่ง → ตะวันออก",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e3:ตะวันออก"
    }
   ]
  },
  "e4": {
   "cam": "whip",
   "bg": "waves",
   "items": [
    {
     "art": "moon",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "slide-l",
     "rot": 180,
     "at": 0.1
    },
    {
     "cap": "ข้างแรม",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e4:ตะวันออก-0.1"
    },
    {
     "cap": "ก่อนเช้า → ตะวันออก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "blue",
     "at": "@e4:ตะวันออก"
    }
   ]
  },
  "e5": {
   "cam": "punch",
   "bg": "dots",
   "items": [
    {
     "art": "moon",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "rot": 180,
     "at": 0.1
    },
    {
     "cap": "ข้างแรม",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:ตะวันตก-0.1"
    },
    {
     "cap": "แหว่ง → ตะวันตก",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "pink",
     "at": "@e5:ตะวันตก"
    }
   ]
  },
  "e6": {
   "cam": "pull",
   "bg": "rays",
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
     "cap": "ข้อควรรู้",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:เป็นเสี้ยว-0.1"
    },
    {
     "cap": "เฉพาะเสี้ยว!",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "red",
     "at": "@e6:เป็นเสี้ยว"
    }
   ]
  }
 }
};
