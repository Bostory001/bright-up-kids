"""คัดเสียงพากย์ — ให้ทุกเสียงในคลังอ่านประโยคเดียวกัน แล้วฟังเทียบ

    "C:/Users/User/.venvs/bbn-video-studio/Scripts/python.exe" tools/vo-casting.py

คลังเสียงอยู่ที่ E:/Work/เล่าเรื่อง/03_ทรัพยากรกลาง/เสียงพากย์/cast/
แต่ละตัวมี ref.wav + ref.txt (ข้อความที่พูดในไฟล์นั้นคำต่อคำ) ซึ่ง VoxCPM2 ต้องใช้คู่กัน

เลือกเฉพาะเสียงต้นแบบที่ยาว >= 10 วินาที ตามสเปกในคู่มือคลังเสียงเอง
(สั้นกว่านั้นโคลนไม่นิ่ง) ออกที่ assets/vo-casting/<ชื่อเสียง>.wav
"""
import json
import os
import pathlib
import sys

sys.stdout.reconfigure(encoding="utf-8")

CAST = pathlib.Path(r"E:/Work/เล่าเรื่อง/03_ทรัพยากรกลาง/เสียงพากย์/cast")
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "vo-casting"
OUT.mkdir(parents=True, exist_ok=True)

MIN_REF_SEC = 10.0
SEED = int(os.environ.get("VOXCPM_SEED", "42"))

# สองประโยคที่บอกได้ว่าเสียงเข้ากับคลิปสอนไหม
# หนึ่งประโยคอธิบาย หนึ่งประโยคปิดการขาย
TEST = [
    "แต่เลขข้างล่างไม่ใช่จำนวนของ มันคือจำนวนคนที่มาแบ่ง",
    "ลูกติดตรงไหน ครูรู้ตรงนั้น ทดลองประเมินพื้นฐานฟรี",
]

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from voxcpm import VoxCPM  # noqa: E402

cands = []
for d in sorted(CAST.iterdir()):
    ref, txt = d / "ref.wav", d / "ref.txt"
    if not (d.is_dir() and ref.exists() and txt.exists()):
        continue
    info = sf.info(str(ref))
    sec = info.frames / info.samplerate
    if sec < MIN_REF_SEC:
        print(f"ข้าม {d.name} — ต้นแบบ {sec:.1f} วิ สั้นกว่า {MIN_REF_SEC:.0f} วิ", flush=True)
        continue
    cands.append((d.name, str(ref), txt.read_text(encoding="utf-8").strip(), sec))

print(f"จะทดสอบ {len(cands)} เสียง", flush=True)

model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False)
sr = model.tts_model.sample_rate
gap = np.zeros(int(sr * 0.55), dtype="float32")

report = {}
for name, ref, prompt, sec in cands:
    out = OUT / f"{name}.wav"
    if out.exists():
        print(f"ข้าม {name} (มีแล้ว)", flush=True)
        continue
    parts = []
    for text in TEST:
        torch.manual_seed(SEED)
        parts.append(model.generate(
            text=text, prompt_wav_path=ref, prompt_text=prompt, reference_wav_path=ref,
            cfg_value=2.0, inference_timesteps=10, normalize=False, denoise=False,
            retry_badcase=True, max_len=4096,
        ))
        parts.append(gap)
    audio = np.concatenate(parts)
    sf.write(out, audio, sr, subtype="PCM_16")
    report[name] = {"ref_sec": round(sec, 1), "out_sec": round(len(audio) / sr, 2)}
    print(f"เสร็จ {name}  ต้นแบบ {sec:.1f} วิ  ผลลัพธ์ {len(audio)/sr:.2f} วิ", flush=True)

(OUT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print("เขียน report.json แล้ว", flush=True)
