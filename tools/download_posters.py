#!/usr/bin/env python3
"""
ينزّل أغلفة المسلسلات من ملف links.txt إلى مجلد images/

الاستخدام:
    python3 tools/download_posters.py
    python3 tools/download_posters.py --links links.txt --out images --force

صيغة links.txt — كل سطر:  الرقم <مسافة> الرابط
مثال:  001 https://example.com/poster.jpg
السطور اللي تبدأ بـ # تنتجاهل.

الملف ينحفظ باسم images/001.jpg وهذا بالضبط اللي تدور عليه صفحة index.html.
"""

import argparse
import os
import re
import sys
import time
import urllib.error
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " \
     "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"

# نوع المحتوى -> الامتداد. الصفحة تدور على .jpg فنخليه الافتراضي.
EXT = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def parse_links(path):
    """يقرأ ملف الروابط ويرجع قائمة (رقم, رابط)."""
    items = []
    with open(path, encoding="utf-8") as fh:
        for lineno, raw in enumerate(fh, 1):
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split(None, 1)
            if len(parts) != 2:
                print(f"  ! سطر {lineno} تالف، انتجاهل: {line[:60]}")
                continue
            num, url = parts
            if not re.fullmatch(r"\d{1,3}", num):
                print(f"  ! سطر {lineno} رقمه مو صحيح ({num})، انتجاهل")
                continue
            items.append((num.zfill(3), url.strip()))
    return items


def fetch(url, retries=3):
    """ينزّل الرابط ويرجع (البايتات, نوع المحتوى). يعيد المحاولة عند الفشل."""
    last = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                "Referer": "https://www.google.com/",
            })
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read(), (resp.headers.get("Content-Type") or "").split(";")[0].strip()
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as err:
            last = err
            if attempt < retries:
                wait = 2 ** attempt
                print(f"    محاولة {attempt} فشلت ({err}) — إعادة بعد {wait}ث")
                time.sleep(wait)
    raise last


def main():
    ap = argparse.ArgumentParser(description="تنزيل أغلفة المسلسلات")
    ap.add_argument("--links", default="links.txt", help="ملف الروابط (افتراضي: links.txt)")
    ap.add_argument("--out", default="images", help="مجلد الحفظ (افتراضي: images)")
    ap.add_argument("--force", action="store_true", help="أعد التنزيل حتى لو الملف موجود")
    args = ap.parse_args()

    if not os.path.exists(args.links):
        sys.exit(f"ما لگيت الملف: {args.links}")

    os.makedirs(args.out, exist_ok=True)
    items = parse_links(args.links)
    if not items:
        sys.exit("ما بيه أي رابط صالح بالملف.")

    print(f"لگيت {len(items)} رابط. المجلد: {args.out}/\n")
    done = skipped = failed = 0

    for num, url in items:
        target_jpg = os.path.join(args.out, num + ".jpg")
        existing = [p for p in (target_jpg,) if os.path.exists(p)]
        if existing and not args.force:
            print(f"[{num}] موجود مسبقاً — انتجاهل (استخدم --force للإعادة)")
            skipped += 1
            continue

        print(f"[{num}] ينزّل…")
        try:
            data, ctype = fetch(url)
        except Exception as err:
            print(f"    ✗ فشل: {err}")
            failed += 1
            continue

        if len(data) < 1024:
            print(f"    ✗ الملف صغير جداً ({len(data)} بايت) — يمكن الرابط منتهي")
            failed += 1
            continue

        # نحفظه دائماً كـ .jpg لأن الصفحة تدور على هذا الاسم؛
        # إذا الأصل صيغة ثانية ننسخ نسخة بامتدادها أيضاً للمرجع.
        with open(target_jpg, "wb") as fh:
            fh.write(data)

        ext = EXT.get(ctype, "")
        note = "" if ext in ("", ".jpg") else f"  (الأصل {ctype})"
        print(f"    ✓ انحفظ {target_jpg}  —  {len(data) // 1024} كيلوبايت{note}")
        done += 1

    print(f"\nخلص: {done} انحفظ · {skipped} انتجاهل · {failed} فشل")
    if failed:
        print("الفاشلة غالباً روابط منتهية الصلاحية — جيب رابط جديد وحدّث links.txt.")


if __name__ == "__main__":
    main()
