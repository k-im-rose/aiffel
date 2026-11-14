// 용어 id별로 full(풀네임)·word(영어 단어 뜻)·cmd(터미널 명령어)·stage(개발 단계)·use(언제 쓰냐면)·code(코드 모양)·ai(AI를 쓰면)를 넣거나 바꾼다. 다른 칸은 건드리지 않는다.
// 사용: node set-fields.js <data 폴더> <patch.json>
//   patch.json 예: { "npm": { "full": "Node Package Manager", "cmd": true, "use": "..." } }
//   full을 ""로 주면 비운다. cmd는 true일 때만 적고 false면 지운다.
const fs = require('fs'), path = require('path');
const [dir, patchFile] = process.argv.slice(2);
if (!dir || !patchFile) { console.error('사용: node set-fields.js data patch.json'); process.exit(1); }
const patch = JSON.parse(fs.readFileSync(patchFile, 'utf8'));

// 문자열을 건너뛰며 각 { } 의 짝을 찾는다
function objectRanges(s) {
  const ranges = [], stack = []; let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; }
    else if (c === '{') stack.push(i);
    else if (c === '}') ranges.push([stack.pop(), i]);
  }
  return ranges;
}
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
const keyRe = (k) => new RegExp(`(\\n[ \\t]*)(["']?)${k}\\2\\s*:\\s*(?:true|false|(["'])(?:\\\\.|(?!\\3).)*\\3),?[ \\t]*(?=\\n)`);

const done = new Set();
for (const f of fs.readdirSync(dir).filter((f) => /^terms(-\d\d-\d\d)?\.js$/.test(f))) {
  const file = path.join(dir, f);
  let s = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [id, p] of Object.entries(patch)) {
    const m = new RegExp(`(["']?id["']?\\s*:\\s*)(["'])${reEsc(id)}\\2`).exec(s);
    if (!m) continue;
    const [a, b] = objectRanges(s).filter(([x, y]) => x < m.index && m.index < y).sort((p1, p2) => (p1[1] - p1[0]) - (p2[1] - p2[0]))[0];
    let obj = s.slice(a, b + 1);
    const quoted = /\n[ \t]*"id"\s*:/.test(obj) || /^\{\s*\n?\s*"/.test(obj);
    const key = (k) => (quoted ? `"${k}"` : k);
    const indent = (/\n([ \t]+)["']?(?:term|def)["']?\s*:/.exec(obj) || [, '    '])[1];

    // 기존 cmd·use 줄은 지우고 related 앞에 새로 넣는다 (풀네임은 제자리에서 바꾼다)
    for (const k of ['word', 'cmd', 'stage', 'use', 'code', 'ai']) if (k in p) obj = obj.replace(keyRe(k), '');
    if ('full' in p) {
      const fm = new RegExp(`(["']?full["']?\\s*:\\s*)(["'])((?:\\\\.|(?!\\2).)*)\\2`).exec(obj);
      if (fm) obj = obj.replace(fm[0], `${fm[1]}${fm[2]}${p.full.replace(new RegExp(fm[2], 'g'), '\\' + fm[2])}${fm[2]}`);
      else obj = obj.replace(m[0], `${m[0]}, ${key('full')}: ${JSON.stringify(p.full)}`);
    }
    const add = [];
    if (p.cmd) add.push(`${indent}${key('cmd')}: true,`);
    for (const k of ['word', 'stage', 'use', 'code', 'ai']) if (p[k]) add.push(`${indent}${key(k)}: ${JSON.stringify(p[k])},`);
    if (add.length) {
      const rm = new RegExp(`\\n[ \\t]*["']?related["']?\\s*:`).exec(obj);
      if (rm) obj = obj.slice(0, rm.index) + '\n' + add.join('\n') + obj.slice(rm.index);
      else obj = obj.replace(/,?\s*\}$/, `,\n${add.join('\n').replace(/,$/, '')}\n${indent.slice(2)}}`);
    }
    s = s.slice(0, a) + obj + s.slice(b + 1);
    done.add(id); changed = true;
  }
  if (changed) fs.writeFileSync(file, s);
}
const missing = Object.keys(patch).filter((id) => !done.has(id));
console.log(`바꾼 용어 ${done.size}개` + (missing.length ? ` · 못 찾은 id: ${missing.join(', ')}` : ''));
if (missing.length) process.exit(1);
