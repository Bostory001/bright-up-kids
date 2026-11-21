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
    "ถ้าสารผสมเป็นของเหลวสองชนิดที่ไม่ละลายรวมกัน",
    "เช่นน้ำกับน้ำมัน"
   ]
  },
  "e2": {
   "cap": [
    "เราแยกออกจากกันได้",
    "ด้วยอุปกรณ์ที่เรียกว่ากรวยแยก"
   ]
  },
  "e3": {
   "cap": [
    "กรวยแยกรูปร่างคล้ายกรวย",
    "ปลายเรียวยาว และมีก๊อกให้ของเหลวผ่านไป"
   ]
  },
  "e4": {
   "cap": [
    "น้ำมันเบากว่าน้ำ",
    "จึงลอยอยู่ด้านบน",
    "ส่วนน้ำอยู่ด้านล่าง"
   ]
  },
  "e5": {
   "cap": [
    "เปิดก๊อกให้น้ำไหลออก",
    "พอถึงชั้นน้ำมันก็ปิดก๊อก",
    "แยกได้แล้ว"
   ]
  },
  "e6": {
   "cap": [
    "แต่ถ้าของแข็งละลายในน้ำไปแล้ว",
    "เช่นน้ำทะเล จะกรองไม่ได้"
   ]
  },
  "e7": {
   "cap": [
    "วิธีที่สองการระเหยแห้ง",
    "ต้มให้น้ำระเหยไป",
    "เหลือเกลือแกงเป็นของแข็ง"
   ]
  },
  "e8": {
   "cap": [
    "ที่นาเกลือก็ตากน้ำทะเลกลางแดด",
    "ให้น้ำระเหย ก็จะได้เกลือ"
   ]
  },
  "e9": {
   "cap": [
    "วิธีที่สามการกลั่น",
    "ใช้เมื่ออยากได้ตัวทำละลาย",
    "เช่น น้ำจืดจากน้ำทะเล"
   ]
  },
  "e10": {
   "cap": [
    "ต้มจนน้ำกลายเป็นไอ",
    "แล้วทำให้ไอเย็นลงควบแน่นเป็นน้ำจืดกลับมา"
   ]
  },
  "e11": {
   "cap": [
    "เกลือไม่ระเหยตามไปด้วย",
    "เพราะมีจุดเดือดสูงกว่าน้ำมาก"
   ]
  },
  "e12": {
   "cap": [
    "ถ้าติดเกาะกลางทะเล",
    "ไม่มีน้ำจืด ก็ใช้การกลั่นทำน้ำจืดจากน้ำทะเลได้"
   ]
  },
  "e13": {
   "cap": [
    "จำไว้ ของแข็งไม่ละลายใช้กรอง",
    "ละลายแล้วใช้ระเหยหรือกลั่น"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "waves",
   "items": [
    {
     "art": "drop",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "blue",
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
     "until": "@e1:น้ำมัน-0.1"
    },
    {
     "cap": "น้ำ + น้ำมัน",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e1:น้ำมัน"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "rays",
   "items": [
    {
     "art": "magnifier",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "วิธีที่ 1",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e2:กรวยแยก-0.1"
    },
    {
     "cap": "กรวยแยก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e2:กรวยแยก"
    }
   ]
  },
  "e3": {
   "cam": "push",
   "bg": "dots",
   "items": [
    {
     "art": "magnifier",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "หน้าตา",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e3:ก๊อก-0.1"
    },
    {
     "cap": "มีก๊อก",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "lime",
     "at": "@e3:ก๊อก"
    }
   ]
  },
  "e4": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "drop",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "blue",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ใครอยู่ตรงไหน",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:ด้านบน-0.1"
    },
    {
     "cap": "น้ำมันลอยบน",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "orange",
     "at": "@e4:ด้านบน"
    }
   ]
  },
  "e5": {
   "cam": "drift",
   "bg": "waves",
   "items": [
    {
     "art": "check",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "lime",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ขั้นตอน",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e5:ปิดก๊อก-0.1"
    },
    {
     "cap": "เปิด แล้วปิดก๊อก",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "blue",
     "at": "@e5:ปิดก๊อก"
    }
   ]
  },
  "e6": {
   "cam": "whip",
   "bg": "checker",
   "items": [
    {
     "art": "drop",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "blue",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ข้อควรรู้",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:น้ำทะเล-0.1"
    },
    {
     "cap": "กรองไม่ได้",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "red",
     "at": "@e6:น้ำทะเล"
    }
   ]
  },
  "e7": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "flame",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "orange",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "วิธีที่ 2",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e7:การระเหยแห้ง-0.1"
    },
    {
     "cap": "ระเหยแห้ง",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "orange",
     "at": "@e7:การระเหยแห้ง"
    }
   ]
  },
  "e8": {
   "cam": "push",
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
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e8:เกลือ-0.1"
    },
    {
     "cap": "นาเกลือ",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e8:เกลือ"
    }
   ]
  },
  "e9": {
   "cam": "punch",
   "bg": "waves",
   "items": [
    {
     "art": "drop",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "blue",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "วิธีที่ 3",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e9:การกลั่น-0.1"
    },
    {
     "cap": "กลั่น",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "blue",
     "at": "@e9:การกลั่น"
    }
   ]
  },
  "e10": {
   "cam": "whip",
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
     "cap": "ขั้นตอน",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e10:ควบแน่น-0.1"
    },
    {
     "cap": "ไอ → น้ำ",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "blue",
     "at": "@e10:ควบแน่น"
    }
   ]
  },
  "e11": {
   "cam": "push",
   "bg": "dots",
   "items": [
    {
     "art": "flame",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "orange",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ทำไมแยกได้",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e11:จุดเดือด-0.1"
    },
    {
     "cap": "จุดเดือดต่างกัน",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "red",
     "at": "@e11:จุดเดือด"
    }
   ]
  },
  "e12": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "drop",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "face": "happy",
     "color": "blue",
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ใช้จริง",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e12:กลั่น-0.1"
    },
    {
     "cap": "น้ำจืดจากทะเล",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "blue",
     "at": "@e12:กลั่น"
    }
   ]
  },
  "e13": {
   "cam": "pull",
   "bg": "waves",
   "items": [
    {
     "art": "trophy",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "สรุป",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e13:ใช้กรอง-0.1"
    },
    {
     "cap": "กรอง|ระเหย|กลั่น",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "blue",
      "orange",
      "pink"
     ],
     "at": [
      "@e13:ใช้กรอง",
      "@e13:ใช้ระเหย",
      "@e13:กลั่น"
     ]
    },
    {
     "fx": "confetti",
     "at": "@e13:กลั่น+0.2"
    }
   ]
  }
 }
};
