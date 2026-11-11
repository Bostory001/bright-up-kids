"""พากย์คลิปสอน #3 ด้วยเสียงเจ้าของที่โคลนไว้แล้ว (VoxCPM2 zero-shot)

    "C:/Users/User/.venvs/bbn-video-studio/Scripts/python.exe" tools/make-vo.py [เลขจังหวะ ...]

เสียงต้นแบบใช้ของโปรเจกต์สามก๊กที่ตั้งไว้แล้ว (เสียงเจ้าของเอง ยินยอมแล้ว)
ไม่ก๊อปไฟล์ต้นแบบเข้ามาในรีโปนี้ อ้างด้วยพาธอย่างเดียว

ออกเป็น assets/vo/bN.wav + assets/vo/timing.json (ความยาวจริงของแต่ละไฟล์)
ตัว build-index.mjs จะอ่าน timing.json ไปตั้งความยาวของแต่ละจังหวะ
จังหวะภาพจึงยาวตามเสียงจริง ไม่ใช่ตัวเลขที่เดาเอา
"""
import json
import os
import pathlib
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "vo"
RAW = OUT / "_raw"          # เสียงก่อนเร่งจังหวะ เก็บไว้เผื่ออยากเปลี่ยน TEMPO
OUT.mkdir(parents=True, exist_ok=True)
RAW.mkdir(parents=True, exist_ok=True)

MODEL = os.environ.get("VOXCPM_MODEL", "openbmb/VoxCPM2")
SEED = int(os.environ.get("VOXCPM_SEED", "42"))

# เสียงต้นแบบ + ข้อความที่พูดในไฟล์นั้นคำต่อคำ (ต้องตรงกัน ไม่งั้นคุณภาพโคลนตก)
# ref.wav = เสียงเจ้าของอ่าน VOICE_REF_SCRIPT.txt ตัดเงียบหัวท้ายเหลือ 18.2 วินาที
VOICE_DIR = HERE.parent / "assets" / "voice"
VOICE_WAV = os.environ.get("BU_VOICE_WAV", str(VOICE_DIR / "ref.wav"))
PROMPT_TEXT = (VOICE_DIR / "ref.txt").read_text(encoding="utf-8").strip()

# บทพากย์ — เขียนตัวเลขเป็นคำอ่านทั้งหมด ไม่ปล่อยเลขอารบิกให้โมเดลเดาเอง
# เสียงต้นแบบเป็นผู้หญิง คำลงท้ายจึงเป็น คะ/ค่ะ ไม่ใช่ ครับ
LINES = [
    "ครึ่งหนึ่ง กับ หนึ่งในสาม อันไหนมากกว่ากันคะ",
    "เด็กส่วนใหญ่ตอบว่าหนึ่งในสาม เพราะสามมากกว่าสอง",
    "แต่เลขข้างล่างไม่ใช่จำนวนของ มันคือจำนวนคนที่มาแบ่ง",
    "เค้กก้อนเท่ากัน ก้อนซ้ายแบ่งสองคน ก้อนขวาแบ่งสามคน",
    "ยิ่งแบ่งหลายคน ชิ้นก็ยิ่งเล็กลง",
    "ชิ้นของสองคนใหญ่กว่า ครึ่งหนึ่งจึงมากกว่าหนึ่งในสาม",
    "ลองเองนะคะ หนึ่งในสี่ กับ หนึ่งในหก แบ่งหกคนย่อมได้ชิ้นเล็กกว่า",
    # ไม่อ่านเบอร์ทีละตัวแล้ว ของเดิมกินไป 9.76 วินาที ให้เบอร์อยู่บนจอแทน
    "ลูกติดตรงไหน ครูรู้ตรงนั้น ทดลองประเมินพื้นฐานฟรี โทรหาเราได้เลยค่ะ",
]

# โมเดลลอกจังหวะพูดจากไฟล์ต้นแบบด้วย ต้นแบบอ่านช้า เสียงที่ได้เลยช้าตาม
# เร่งทีหลังด้วย atempo ซึ่งไม่เปลี่ยนระดับเสียง
TEMPO = float(os.environ.get("VO_TEMPO", "1.2"))

only = {int(a) for a in sys.argv[1:]} if len(sys.argv) > 1 else None

import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from voxcpm import VoxCPM  # noqa: E402

if not pathlib.Path(VOICE_WAV).exists():
    sys.exit(f"ไม่เจอเสียงต้นแบบ: {VOICE_WAV}")

print("โหลดโมเดล...", flush=True)
model = VoxCPM.from_pretrained(MODEL, load_denoiser=False, optimize=False)
sr = model.tts_model.sample_rate

for i, text in enumerate(LINES):
    out = OUT / f"b{i}.wav"
    if only and i not in only:
        continue
    # ไม่ข้ามไฟล์ที่มีอยู่ — เปลี่ยนเสียงต้นแบบเมื่อไหร่ต้องพากย์ใหม่ทั้งชุด
    torch.manual_seed(SEED)  # voxcpm 2.x ไม่รับ seed ใน generate แล้ว
    audio = model.generate(
        text=text, prompt_wav_path=VOICE_WAV, prompt_text=PROMPT_TEXT,
        reference_wav_path=VOICE_WAV, cfg_value=2.0, inference_timesteps=10,
        normalize=False, denoise=False, retry_badcase=True, max_len=4096,
    )
    tmp = RAW / f"b{i}.wav"
    sf.write(tmp, audio, sr, subtype="PCM_16")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(tmp),
        "-af", f"atempo={TEMPO}", "-ar", str(sr), "-ac", "1", "-c:a", "pcm_s16le", str(out),
    ], check=True)
    print(f"b{i}  {len(audio) / sr:.2f} -> {sf.info(str(out)).frames / sr:.2f} วิ  {text[:34]}", flush=True)

timing = {}
for i in range(len(LINES)):
    f = OUT / f"b{i}.wav"
    if f.exists():
        info = sf.info(str(f))
        timing[f"b{i}"] = round(info.frames / info.samplerate, 3)
(OUT / "timing.json").write_text(json.dumps(timing, indent=2), encoding="utf-8")
print("timing.json:", timing, flush=True)
