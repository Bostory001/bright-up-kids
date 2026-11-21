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
    "บางอย่างละลายน้ำดี",
    "บางอย่างไม่ละลายเลย",
    "ขึ้นอยู่กับปัจจัยหลายอย่าง"
   ]
  },
  "e2": {
   "cap": [
    "ความสามารถในการละลาย",
    "ขึ้นอยู่กับชนิดของตัวทำละลายและตัวละลาย"
   ]
  },
  "e3": {
   "cap": [
    "เช่น เชลแล็กไม่ละลายในน้ำ",
    "แต่ละลายในเอทานอล"
   ]
  },
  "e4": {
   "cap": [
    "และเกลือแกงละลายในน้ำได้ดีกว่าสารส้ม",
    "สารต่างชนิดจึงละลายต่างกัน"
   ]
  },
  "e5": {
   "cap": [
    "ปัจจัยแรกอุณหภูมิ",
    "ถ้าตัวละลายเป็นของแข็ง",
    "อุณหภูมิสูงจะละลายได้ดี"
   ]
  },
  "e6": {
   "cap": [
    "เพราะความร้อนทำให้อนุภาคสั่นเร็ว",
    "จึงช่วยให้ตัวละลายแตกตัวได้ดี"
   ]
  },
  "e7": {
   "cap": [
    "แต่ถ้าตัวละลายเป็นแก๊ส",
    "เมื่ออุณหภูมิสูงขึ้น",
    "จะละลายได้น้อยลง"
   ]
  },
  "e8": {
   "cap": [
    "ปัจจัยที่สองชนิดของตัวทำละลาย",
    "เช่น น้ำ แอลกอฮอล์",
    "โพรพานอล"
   ]
  },
  "e9": {
   "cap": [
    "ปัจจัยที่สาม ขนาดของตัวละลายก้อนเล็กละลายเร็วกว่าก้อนใหญ่"
   ]
  },
  "e10": {
   "cap": [
    "เพราะก้อนเล็กมีพื้นที่ผิวสัมผัสมาก",
    "จึงจับกับอนุภาคตัวทำละลายได้มากกว่า"
   ]
  },
  "e11": {
   "cap": [
    "ปัจจัยที่สี่ความดัน",
    "ถ้าตัวละลายเป็นแก๊ส",
    "ความดันสูงจะละลายได้มากขึ้น"
   ]
  },
  "e12": {
   "cap": [
    "เช่น แก๊สคาร์บอนไดออกไซด์ละลายในน้ำอัดลม",
    "ตอนผลิตจึงใช้ความดันสูง"
   ]
  },
  "e13": {
   "cap": [
    "ปัจจัยที่ห้าการคน",
    "และการเขย่า ทำให้อนุภาคชนกันถี่ขึ้น",
    "ละลายได้เร็ว"
   ]
  },
  "e14": {
   "cap": [
    "ลองคิดดู ชงกาแฟด้วยน้ำร้อนแล้วคน",
    "กับน้ำเย็นไม่คน",
    "แบบไหนละลายเร็วกว่า"
   ]
  },
  "e15": {
   "cap": [
    "แบบน้ำร้อนแล้วคน",
    "ละลายเร็วกว่า เพราะใช้ถึงสองปัจจัยเลย"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "dots",
   "items": [
    {
     "art": "question",
     "x": 540,
     "y": 1040,
     "s": 2.4,
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
     "until": "@e1:ปัจจัย-0.1"
    },
    {
     "cap": "ละลายได้ไหม?",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e1:ปัจจัย"
    }
   ]
  },
  "e2": {
   "cam": "whip",
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
     "cap": "หลักการ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:ตัวทำละลาย-0.1"
    },
    {
     "cap": "ดูที่ชนิด",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e2:ตัวทำละลาย"
    }
   ]
  },
  "e3": {
   "cam": "push",
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
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:เอทานอล-0.1"
    },
    {
     "cap": "เชลแล็ก",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e3:เอทานอล"
    }
   ]
  },
  "e4": {
   "cam": "punch",
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
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e4:สารส้ม-0.1"
    },
    {
     "cap": "เกลือ ดีกว่า สารส้ม",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "lime",
     "at": "@e4:สารส้ม"
    }
   ]
  },
  "e5": {
   "cam": "drift",
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
     "cap": "ปัจจัยที่ 1",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e5:อุณหภูมิ-0.1"
    },
    {
     "cap": "อุณหภูมิสูง",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "orange",
     "at": "@e5:อุณหภูมิ"
    }
   ]
  },
  "e6": {
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
     "cap": "เพราะอะไร",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:แตกตัว-0.1"
    },
    {
     "cap": "ร้อน = ละลายเร็ว",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "orange",
     "at": "@e6:แตกตัว"
    }
   ]
  },
  "e7": {
   "cam": "punch",
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
     "cap": "ข้อยกเว้น",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e7:แก๊ส-0.1"
    },
    {
     "cap": "แก๊ส ร้อน ละลายน้อย",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "blue",
     "at": "@e7:แก๊ส"
    }
   ]
  },
  "e8": {
   "cam": "push",
   "bg": "rays",
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
     "cap": "ปัจจัยที่ 2",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e8:ชนิดของตัวทำละลาย-0.1"
    },
    {
     "cap": "ชนิดตัวทำละลาย",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "pink",
     "at": "@e8:ชนิดของตัวทำละลาย"
    }
   ]
  },
  "e9": {
   "cam": "punch",
   "bg": "dots",
   "items": [
    {
     "art": "dots",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ปัจจัยที่ 3",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e9:ก้อนเล็ก-0.1"
    },
    {
     "cap": "ก้อนเล็ก = เร็ว",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e9:ก้อนเล็ก"
    }
   ]
  },
  "e10": {
   "cam": "whip",
   "bg": "stripes",
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
     "cap": "เพราะอะไร",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e10:พื้นที่ผิว-0.1"
    },
    {
     "cap": "ผิวสัมผัสมาก",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e10:พื้นที่ผิว"
    }
   ]
  },
  "e11": {
   "cam": "push",
   "bg": "waves",
   "items": [
    {
     "art": "ring",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ปัจจัยที่ 4",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e11:ความดัน-0.1"
    },
    {
     "cap": "ความดันสูง",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "purple",
     "at": "@e11:ความดัน"
    }
   ]
  },
  "e12": {
   "cam": "punch",
   "bg": "checker",
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
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e12:น้ำอัดลม-0.1"
    },
    {
     "cap": "น้ำอัดลม",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e12:น้ำอัดลม"
    }
   ]
  },
  "e13": {
   "cam": "drift",
   "bg": "rays",
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
     "cap": "ปัจจัยที่ 5",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e13:การคน-0.1"
    },
    {
     "cap": "คน เขย่า",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e13:การคน"
    }
   ]
  },
  "e14": {
   "cam": "whip",
   "bg": "dots",
   "items": [
    {
     "art": "question",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ลองคิดดู",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e14:น้ำร้อน-0.1"
    },
    {
     "cap": "ร้อนและคน",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "orange",
     "at": "@e14:น้ำร้อน"
    }
   ]
  },
  "e15": {
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
     "cap": "เฉลย",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e15:สองปัจจัย-0.1"
    },
    {
     "cap": "2 ปัจจัย!",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e15:สองปัจจัย"
    },
    {
     "fx": "confetti",
     "at": "@e15:สองปัจจัย+0.2"
    }
   ]
  }
 }
};
