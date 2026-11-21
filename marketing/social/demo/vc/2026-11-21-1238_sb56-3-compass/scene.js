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
    "เข็มทิศเป็นเครื่องมือหาทิศที่ง่ายที่สุด",
    "แค่วางให้เข็มนิ่ง"
   ]
  },
  "e2": {
   "cap": [
    "ปลายเข็มสีแดงจะชี้ไปทางทิศเหนือเสมอ"
   ]
  },
  "e3": {
   "cap": [
    "เพราะโลกของเราเป็นเหมือนก้อนแม่เหล็กขนาดยักษ์"
   ]
  },
  "e4": {
   "cap": [
    "พอรู้ทิศเหนือแล้ว",
    "หันหน้าไปทางนั้น",
    "ขวามือก็คือทิศตะวันออก"
   ]
  },
  "e5": {
   "cap": [
    "ถือเข็มทิศให้อยู่ในแนวราบ",
    "และอย่าวางใกล้เหล็กหรือแม่เหล็ก"
   ]
  },
  "e6": {
   "cap": [
    "มีเข็มทิศอันเดียว",
    "เดินป่ากลางคืนก็ไม่หลงแล้ว"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "arrow",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "spin",
     "at": 0.1
    },
    {
     "cap": "ง่ายสุดๆ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:เข็มทิศ-0.1"
    },
    {
     "cap": "เข็มทิศ",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e1:เข็มทิศ"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
   "items": [
    {
     "art": "arrow",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "จำไว้",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e2:เหนือ-0.1"
    },
    {
     "cap": "ชี้ทิศเหนือ!",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "red",
     "at": "@e2:เหนือ"
    }
   ]
  },
  "e3": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "bolt",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "ทำไมนะ?",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e3:แม่เหล็ก-0.1"
    },
    {
     "cap": "แม่เหล็กยักษ์",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "pink",
     "at": "@e3:แม่เหล็ก"
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
     "cap": "ต่อยอดได้เลย",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:ทิศตะวันออก-0.1"
    },
    {
     "cap": "ขวา = ตะวันออก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e4:ทิศตะวันออก"
    }
   ]
  },
  "e5": {
   "cam": "whip",
   "bg": "checker",
   "items": [
    {
     "art": "cross",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "ข้อควรระวัง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:เหล็ก-0.1"
    },
    {
     "cap": "ห้ามใกล้เหล็ก",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "red",
     "at": "@e5:เหล็ก"
    }
   ]
  },
  "e6": {
   "cam": "pull",
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
     "cap": "สรุป",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:ไม่หลง-0.1"
    },
    {
     "cap": "ไม่หลงแล้ว!",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "lime",
     "at": "@e6:ไม่หลง"
    },
    {
     "fx": "confetti",
     "at": "@e6:ไม่หลง+0.2"
    }
   ]
  }
 }
};
