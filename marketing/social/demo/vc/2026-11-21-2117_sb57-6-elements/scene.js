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
    "ธาตุทุกชนิดในโลก",
    "แบ่งตามสมบัติได้เป็นสามกลุ่ม"
   ]
  },
  "e2": {
   "cap": [
    "คือธาตุโลหะ ธาตุอโลหะ",
    "และธาตุกึ่งโลหะ"
   ]
  },
  "e3": {
   "cap": [
    "ธาตุโลหะ ส่วนใหญ่เป็นของแข็ง",
    "ยกเว้นปรอทที่เป็นของเหลว"
   ]
  },
  "e4": {
   "cap": [
    "ผิวมันวาว นำความร้อนและไฟฟ้าได้ดี",
    "จุดเดือดและจุดหลอมเหลวสูง"
   ]
  },
  "e5": {
   "cap": [
    "ตัวอย่างโลหะ เช่น",
    "โซเดียม เหล็ก แคลเซียม",
    "ปรอท และอะลูมิเนียม"
   ]
  },
  "e6": {
   "cap": [
    "ธาตุอโลหะ มีสมบัติตรงข้าม",
    "คือไม่นำไฟฟ้า"
   ]
  },
  "e7": {
   "cap": [
    "จุดเดือดและจุดหลอมเหลวต่ำ",
    "เปราะบาง และเปลี่ยนสมบัติทางกายภาพได้มากกว่าโลหะ"
   ]
  },
  "e8": {
   "cap": [
    "เช่น ออกซิเจนซึ่งเป็นแก๊ส",
    "กำมะถัน และฟอสฟอรัสที่เป็นของแข็ง"
   ]
  },
  "e9": {
   "cap": [
    "ธาตุกึ่งโลหะ มีสมบัติกึ่งกลาง",
    "ระหว่างโลหะกับอโลหะ"
   ]
  },
  "e10": {
   "cap": [
    "เช่น ซิลิคอน และเจอร์เมเนียม",
    "นำไฟฟ้าได้บ้าง",
    "ที่อุณหภูมิปกติ"
   ]
  },
  "e11": {
   "cap": [
    "และนำไฟฟ้าได้มากขึ้น",
    "เมื่ออุณหภูมิสูงขึ้น"
   ]
  },
  "e12": {
   "cap": [
    "เป็นของแข็ง ผิวมันวาวสีเงิน",
    "จุดเดือดสูง แต่เปราะแตกง่ายคล้ายอโลหะ"
   ]
  },
  "e13": {
   "cap": [
    "ลองทายดูสิ ว่าซิลิคอนเป็นธาตุกลุ่มไหน",
    "ตอบว่ากึ่งโลหะ"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "waves",
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
     "until": "@e1:สามกลุ่ม-0.1"
    },
    {
     "cap": "3 กลุ่ม",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e1:สามกลุ่ม"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "rays",
   "items": [
    {
     "art": "sparkle",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ชื่อกลุ่ม",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:ธาตุโลหะ-0.1"
    },
    {
     "cap": "โลหะ|อโลหะ|กึ่งโลหะ",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e2:ธาตุโลหะ",
      "@e2:ธาตุอโลหะ",
      "@e2:ธาตุกึ่งโลหะ"
     ]
    }
   ]
  },
  "e3": {
   "cam": "push",
   "bg": "dots",
   "items": [
    {
     "art": "coin",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "โลหะ",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:ปรอท-0.1"
    },
    {
     "cap": "ยกเว้นปรอท",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e3:ปรอท"
    }
   ]
  },
  "e4": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "bolt",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "สมบัติโลหะ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:มันวาว-0.1"
    },
    {
     "cap": "มันวาว นำไฟฟ้า",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e4:มันวาว"
    }
   ]
  },
  "e5": {
   "cam": "drift",
   "bg": "waves",
   "items": [
    {
     "art": "coin",
     "x": 540,
     "y": 1040,
     "s": 2.4,
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
     "until": "@e5:อะลูมิเนียม-0.1"
    },
    {
     "cap": "เหล็ก อะลูมิเนียม",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "blue",
     "at": "@e5:อะลูมิเนียม"
    }
   ]
  },
  "e6": {
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
     "at": 0.1
    },
    {
     "cap": "อโลหะ",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e6:ไม่นำไฟฟ้า-0.1"
    },
    {
     "cap": "ไม่นำไฟฟ้า",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e6:ไม่นำไฟฟ้า"
    }
   ]
  },
  "e7": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "zigzag",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "สมบัติอโลหะ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e7:เปราะบาง-0.1"
    },
    {
     "cap": "เปราะบาง",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "orange",
     "at": "@e7:เปราะบาง"
    }
   ]
  },
  "e8": {
   "cam": "push",
   "bg": "dots",
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
     "until": "@e8:ฟอสฟอรัส-0.1"
    },
    {
     "cap": "ออกซิเจน กำมะถัน",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "lime",
     "at": "@e8:ฟอสฟอรัส"
    }
   ]
  },
  "e9": {
   "cam": "punch",
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
     "cap": "กึ่งโลหะ",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e9:กึ่งกลาง-0.1"
    },
    {
     "cap": "กึ่งกลาง",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "purple",
     "at": "@e9:กึ่งกลาง"
    }
   ]
  },
  "e10": {
   "cam": "whip",
   "bg": "rays",
   "items": [
    {
     "art": "bolt",
     "x": 540,
     "y": 1040,
     "s": 2.4,
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
     "until": "@e10:ได้บ้าง-0.1"
    },
    {
     "cap": "นำไฟฟ้าได้บ้าง",
     "kind": "swipe",
     "y": 540,
     "size": 110,
     "color": "yellow",
     "at": "@e10:ได้บ้าง"
    }
   ]
  },
  "e11": {
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
     "cap": "จุดเด่น",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e11:อุณหภูมิ-0.1"
    },
    {
     "cap": "ร้อนขึ้น นำดีขึ้น",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "orange",
     "at": "@e11:อุณหภูมิ"
    }
   ]
  },
  "e12": {
   "cam": "punch",
   "bg": "stripes",
   "items": [
    {
     "art": "crown",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "anim": "pop",
     "at": 0.1
    },
    {
     "cap": "ทั้งสองแบบ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e12:เปราะ-0.1"
    },
    {
     "cap": "เปราะแตกง่าย",
     "kind": "shake",
     "y": 540,
     "size": 170,
     "color": "pink",
     "at": "@e12:เปราะ"
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
     "cap": "ทายสิ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e13:กึ่งโลหะ-0.1"
    },
    {
     "cap": "กึ่งโลหะ!",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "lime",
     "at": "@e13:กึ่งโลหะ"
    },
    {
     "fx": "confetti",
     "at": "@e13:กึ่งโลหะ+0.2"
    }
   ]
  }
 }
};
