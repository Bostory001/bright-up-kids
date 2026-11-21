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
    "ทิศไม่ได้มีแค่สี่ทิศ",
    "แต่บอกเป็นองศาก็ได้นะ"
   ]
  },
  "e2": {
   "cap": [
    "วงกลมหนึ่งรอบมีสามร้อยหกสิบองศา",
    "นับจากทิศเหนือเป็นศูนย์"
   ]
  },
  "e3": {
   "cap": [
    "แล้วนับวนตามเข็มนาฬิกา",
    "ทิศตะวันออกคือเก้าสิบองศา"
   ]
  },
  "e4": {
   "cap": [
    "ทิศใต้คือหนึ่งร้อยแปดสิบองศา",
    "ทิศตะวันตกคือสองร้อยเจ็ดสิบ"
   ]
  },
  "e5": {
   "cap": [
    "ถ้าแบ่งละเอียดขึ้น",
    "ก็มีสิบหกทิศ หรือสามสิบสองทิศ"
   ]
  },
  "e6": {
   "cap": [
    "ทหารใช้บอกทิศเป็นองศา",
    "เรียกวิธีนี้ว่าอะซิมุท"
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
     "until": "@e1:องศา-0.1"
    },
    {
     "cap": "ทิศเป็นองศา",
     "kind": "bounce",
     "y": 540,
     "size": 200,
     "color": "yellow",
     "at": "@e1:องศา"
    }
   ]
  },
  "e2": {
   "cam": "whip",
   "bg": "dots",
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
     "cap": "วงกลมหนึ่งรอบ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e2:สามร้อยหกสิบ-0.1"
    },
    {
     "cap": "360 องศา",
     "kind": "counter",
     "y": 540,
     "size": 200,
     "color": "pink",
     "at": "@e2:สามร้อยหกสิบ-0.3",
     "from": 0,
     "to": 360,
     "dur": 0.6
    }
   ]
  },
  "e3": {
   "cam": "punch",
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
     "cap": "ทิศตะวันออก",
     "kind": "tilt",
     "y": 385,
     "size": 110,
     "color": "yellow",
     "at": 0.15,
     "until": "@e3:เก้าสิบ-0.1"
    },
    {
     "cap": "90 องศา",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "lime",
     "at": "@e3:เก้าสิบ"
    }
   ]
  },
  "e4": {
   "cam": "push",
   "bg": "waves",
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
     "cap": "ต่อไปเรื่อยๆ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e4:หนึ่งร้อยแปดสิบ-0.1"
    },
    {
     "cap": "180 | 270",
     "kind": "stack",
     "y": 680,
     "size": 130,
     "colors": [
      "yellow",
      "pink"
     ],
     "at": [
      "@e4:หนึ่งร้อยแปดสิบ",
      "@e4:สองร้อยเจ็ดสิบ"
     ]
    }
   ]
  },
  "e5": {
   "cam": "whip",
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
     "cap": "แบ่งละเอียด",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e5:สามสิบสอง-0.1"
    },
    {
     "cap": "32 ทิศ",
     "kind": "burst",
     "y": 540,
     "size": 190,
     "color": "orange",
     "at": "@e5:สามสิบสอง"
    }
   ]
  },
  "e6": {
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
     "cap": "ชื่อเท่ๆ",
     "kind": "aside",
     "y": 330,
     "size": 76,
     "color": "pink",
     "at": 0.15,
     "until": "@e6:อะซิมุท-0.1"
    },
    {
     "cap": "อะซิมุท",
     "kind": "stamp",
     "y": 540,
     "size": 150,
     "color": "purple",
     "at": "@e6:อะซิมุท"
    },
    {
     "fx": "confetti",
     "at": "@e6:อะซิมุท+0.2"
    }
   ]
  }
 }
};
