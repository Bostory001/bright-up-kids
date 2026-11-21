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
    "ในแผนที่ เราบอกทิศได้ถึงหกแบบ",
    "ไม่ได้มีแค่เหนือใต้"
   ]
  },
  "e2": {
   "cap": [
    "แบบที่หนึ่ง บอกเป็นชื่อทิศ",
    "มีให้เลือกสี่ สิบหก",
    "หรือสามสิบสองทิศ"
   ]
  },
  "e3": {
   "cap": [
    "แบบที่สอง บอกเป็นมิล",
    "วงกลมหนึ่งรอบแบ่งเป็นหกพันสี่ร้อยหน่วย"
   ]
  },
  "e4": {
   "cap": [
    "แบบที่สาม บอกเป็นองศา",
    "วงกลมหนึ่งรอบมีสามร้อยหกสิบองศา"
   ]
  },
  "e5": {
   "cap": [
    "หนึ่งองศามีหกสิบลิปดา",
    "และหนึ่งลิปดามีหกสิบพิลิปดา"
   ]
  },
  "e6": {
   "cap": [
    "แบบที่สี่ บอกเป็นเกรด",
    "วงกลมหนึ่งรอบมีสี่ร้อยเกรด"
   ]
  },
  "e7": {
   "cap": [
    "เหนือคือศูนย์เกรด",
    "ตะวันออกหนึ่งร้อย",
    "ใต้สองร้อย ตะวันตกสามร้อย"
   ]
  },
  "e8": {
   "cap": [
    "แบบที่ห้า บอกเป็นอะซิมุท",
    "วัดจากทิศเหนือตามเข็มนาฬิกา",
    "ทหารนิยมใช้"
   ]
  },
  "e9": {
   "cap": [
    "แบบที่หก บอกเป็นแบริ่ง",
    "วัดจากเหนือหรือใต้",
    "ไปทางออกหรือตก"
   ]
  },
  "e10": {
   "cap": [
    "ค่าแบริ่งไม่เกินเก้าสิบองศา",
    "เช่น เหนือสี่สิบเก้าองศาตะวันออก"
   ]
  },
  "e11": {
   "cap": [
    "ทั้งหกแบบบอกทิศได้ละเอียดต่างกัน",
    "เลือกใช้ให้เหมาะกับงานนะ"
   ]
  }
 },
 "shots": {
  "e1": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "arrowcurve",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "yellow",
     "anim": "spin",
     "idle": "spin",
     "at": 0.1
    },
    {
     "cap": "รู้ไหมว่า",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e1:หกแบบ-0.1"
    },
    {
     "cap": "6 แบบ!",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "yellow",
     "at": "@e1:หกแบบ"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
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
     "cap": "แบบที่ 1",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e2:สี่-0.1"
    },
    {
     "cap": "4 ทิศ|16 ทิศ|32 ทิศ",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e2:สี่",
      "@e2:สิบหก",
      "@e2:สามสิบสอง"
     ]
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
     "cap": "แบบที่ 2",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:หกพันสี่ร้อย-0.1"
    },
    {
     "cap": "6,400 มิล",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "pink",
     "at": "@e3:หกพันสี่ร้อย"
    }
   ]
  },
  "e4": {
   "cam": "push",
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
     "cap": "แบบที่ 3",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e4:สามร้อยหกสิบ-0.1"
    },
    {
     "cap": "360 องศา",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e4:สามร้อยหกสิบ-0.3",
     "from": 0,
     "to": 360,
     "dur": 0.6
    }
   ]
  },
  "e5": {
   "cam": "whip",
   "bg": "checker",
   "items": [
    {
     "art": "magnifier",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "blue",
     "anim": "pop",
     "idle": "bob",
     "at": 0.1
    },
    {
     "cap": "ละเอียดขึ้น",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e5:ลิปดา-0.1"
    },
    {
     "cap": "60 ลิปดา|60 พิลิปดา",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink"
     ],
     "at": [
      "@e5:ลิปดา",
      "@e5:พิลิปดา"
     ]
    }
   ]
  },
  "e6": {
   "cam": "punch",
   "bg": "rays",
   "items": [
    {
     "art": "ring",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "lime",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "แบบที่ 4",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e6:สี่ร้อย-0.1"
    },
    {
     "cap": "400 เกรด",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "lime",
     "at": "@e6:สี่ร้อย-0.3",
     "from": 0,
     "to": 400,
     "dur": 0.6
    }
   ]
  },
  "e7": {
   "cam": "push",
   "bg": "dots",
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
     "cap": "ค่าของเกรด",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e7:ตะวันออกหนึ่งร้อย-0.1"
    },
    {
     "cap": "ออก 100|ใต้ 200|ตก 300",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e7:ตะวันออกหนึ่งร้อย",
      "@e7:ใต้สองร้อย",
      "@e7:ตะวันตกสามร้อย"
     ]
    }
   ]
  },
  "e8": {
   "cam": "whip",
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
     "cap": "แบบที่ 5",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e8:อะซิมุท-0.1"
    },
    {
     "cap": "อะซิมุท",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "purple",
     "at": "@e8:อะซิมุท"
    }
   ]
  },
  "e9": {
   "cam": "punch",
   "bg": "waves",
   "items": [
    {
     "art": "megaphone",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "red",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "แบบที่ 6",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e9:แบริ่ง-0.1"
    },
    {
     "cap": "แบริ่ง",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "orange",
     "at": "@e9:แบริ่ง"
    }
   ]
  },
  "e10": {
   "cam": "push",
   "bg": "checker",
   "items": [
    {
     "art": "check",
     "x": 540,
     "y": 1040,
     "s": 2.4,
     "color": "lime",
     "anim": "pop",
     "idle": "pulse",
     "at": 0.1
    },
    {
     "cap": "ตัวอย่าง",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e10:แบริ่ง-0.1"
    },
    {
     "cap": "แบริ่งเหนือ|49 องศา|ตะวันออก",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink",
      "lime"
     ],
     "at": [
      "@e10:แบริ่ง",
      "@e10:สี่สิบเก้า",
      "@e10:ตะวันออก"
     ]
    }
   ]
  },
  "e11": {
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
     "until": "@e11:เลือกใช้-0.1"
    },
    {
     "cap": "เลือกให้เหมาะ",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e11:เลือกใช้"
    },
    {
     "fx": "confetti",
     "at": "@e11:งานนะ+0.2"
    }
   ]
  }
 }
};
