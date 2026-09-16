#!/bin/bash
# مثبّت الروتينات المحلية — launchd على macOS
# يشغّلها كل ساعة بلا ما تفتح أي تطبيق. تشتغل حتى والشاشة مقفلة.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
NODE="$(command -v node)"
LA="$HOME/Library/LaunchAgents"
LOGDIR="$REPO/system/routines/local/state"
LABEL_PREFIX="iq.wbtio.routine"

[ -x "$NODE" ] || { echo "❌ ما لقيت node بالـPATH"; exit 1; }
mkdir -p "$LA" "$LOGDIR"

# الروتين | السكربت | الدقيقة
ROUTINES=(
  "R1|radar.mjs|13"
  "R2|guard.mjs|27"
  "R3|pulse.mjs|41"
  "R4|income.mjs|53"
  "R5|consistency.mjs|9"
)

echo "المستودع : $REPO"
echo "node     : $NODE"
echo

for entry in "${ROUTINES[@]}"; do
  IFS='|' read -r ID SCRIPT MIN <<< "$entry"
  LABEL="$LABEL_PREFIX.$ID"
  PLIST="$LA/$LABEL.plist"

  cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$REPO/system/routines/local/$SCRIPT</string>
  </array>
  <key>WorkingDirectory</key><string>$REPO</string>
  <key>StartCalendarInterval</key>
  <dict><key>Minute</key><integer>$MIN</integer></dict>
  <key>StandardOutPath</key><string>$LOGDIR/$ID.out.log</string>
  <key>StandardErrorPath</key><string>$LOGDIR/$ID.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$(dirname "$NODE"):/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>LANG</key><string>en_US.UTF-8</string>
  </dict>
  <key>ProcessType</key><string>Background</string>
  <key>LowPriorityIO</key><true/>
</dict>
</plist>
PLISTEOF

  launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
  launchctl bootstrap "gui/$UID" "$PLIST"
  echo "✅ $ID  ← كل ساعة عند الدقيقة :$MIN  ($SCRIPT)"
done

echo
echo "── تمّ. الروتينات الخمسة شغّالة محلياً على جهازك. ──"
echo
echo "تشوف حالتها :  launchctl list | grep $LABEL_PREFIX"
echo "تشوف سجلّها :  tail -f $LOGDIR/run.log"
echo "توقف واحد   :  launchctl bootout gui/\$UID/$LABEL_PREFIX.R1"
echo "توقف الكل   :  bash $REPO/system/routines/local/uninstall.sh"
