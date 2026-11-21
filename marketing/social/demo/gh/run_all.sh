#!/bin/bash
# voice → check → render ทุกโฟลเดอร์ใน gh/ ที่ยังไม่มี -final.mp4 (ลองซ้ำ 2 รอบเพราะ Chrome บน Windows สะดุดบ้าง)
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8
cd "$(dirname "$0")/../../../.."
LS=.claude/skills/genhaha-lesson/scripts/lesson.mjs
for P in marketing/social/demo/gh/20*_*/; do
  P=${P%/}
  ls "$P"/renders/*-final.mp4 >/dev/null 2>&1 && { echo "done $P"; continue; }
  for try in 1 2 3; do node $LS voice --project "$P" > "$P/voice.log" 2>&1 && break; sleep 20; done
  for try in 1 2 3; do node $LS render --project "$P" > "$P/render.log" 2>&1; ls "$P"/renders/*-final.mp4 >/dev/null 2>&1 && break; done
  tail -3 "$P/render.log" | head -2
done
echo ALLDONE
