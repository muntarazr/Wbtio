// أدوات مشتركة للروتينات المحلية
import { execSync, execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const LOGDIR = join(ROOT, 'system/routines/local/state');

export const nowUTC = () => new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

// اليوم بتوقيت بغداد (UTC+3) — لأن يومه يبدأ ببغداد لا بـUTC
export const today = () => {
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
};
export const hourBaghdad = () => new Date(Date.now() + 3 * 3600 * 1000).getUTCHours();

export function log(tag, msg) {
  mkdirSync(LOGDIR, { recursive: true });
  const line = `${nowUTC()}  [${tag}]  ${msg}\n`;
  appendFileSync(join(LOGDIR, 'run.log'), line);
  process.stdout.write(line);
}

// commit محلي فقط — لا push. المستودع عام على GitHub وما نرفع شي تلقائياً.
// ⚠️ يضيف المسارات المحددة فقط — لا يلمس شغلك غير المحفوظ إطلاقاً.
export function gitCommit(tag, msg, paths) {
  if (!paths || !paths.length) { log(tag, 'بلا مسارات — بلا commit'); return false; }
  try {
    // execFileSync بلا shell — حتى لا تنفكّ `$0` ولا أي رمز داخل الرسالة
    const dirty = execFileSync('git', ['status', '--porcelain', '--', ...paths], { cwd: ROOT }).toString().trim();
    if (!dirty) { log(tag, 'لا تغيير بملفاته — بلا commit'); return false; }
    execFileSync('git', ['add', '--', ...paths], { cwd: ROOT, stdio: 'ignore' });
    execFileSync('git', ['commit', '-q', '--only', '-m', `[routine:${tag}] ${msg}`, '--', ...paths], { cwd: ROOT, stdio: 'ignore' });
    log(tag, 'commit محلي ✓ (بلا push · ملفاته فقط)');
    return true;
  } catch (e) {
    log(tag, `فشل الـcommit: ${String(e.message).slice(0, 100)}`);
    return false;
  }
}

// هل اشتغل هذا الروتين اليوم فعلياً؟ (حارس ذاتي)
export function ranToday(tag) {
  try {
    const out = execSync(`git log -1 --format=%cI --grep="\\[routine:${tag}\\]"`, { cwd: ROOT }).toString().trim();
    if (!out) return false;
    const d = new Date(new Date(out).getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
    return d === today();
  } catch { return false; }
}
