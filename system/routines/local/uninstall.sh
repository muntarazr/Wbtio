#!/bin/bash
# يوقف ويحذف كل الروتينات المحلية. الملفات والسجلات تبقى.
set -uo pipefail
LA="$HOME/Library/LaunchAgents"
for ID in R1 R2 R3 R4 R5; do
  LABEL="iq.wbtio.routine.$ID"
  launchctl bootout "gui/$UID/$LABEL" 2>/dev/null && echo "⏹  $ID أُوقف" || echo "—  $ID ما كان شغّالاً"
  rm -f "$LA/$LABEL.plist"
done
echo
echo "تمّ. لا روتين شغّال. الملفات والسجلات ما انحذفت."
echo "تعيد التشغيل: bash system/routines/local/install.sh"
