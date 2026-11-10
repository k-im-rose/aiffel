// 기존 용어의 src 끝에 자료 번호를 덧붙인다. 문자열 안의 { } 는 무시한다.
// 사용: node add-src.js <data 폴더> <자료번호 예: 03-05> <id> [id...]
const fs = require('fs'), path = require('path');
const [dir, tag, ...ids] = process.argv.slice(2);
if (!dir || !/^\d\d-\d\d$/.test(tag || '') || !ids.length) { console.error('사용: node add-src.js data 03-05 id1 id2'); process.exit(1); }

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

const found = new Map();
for (const f of fs.readdirSync(dir).filter((f) => /^terms(-\d\d-\d\d)?\.js$/.test(f))) {
  const file = path.join(dir, f);
  let s = fs.readFileSync(file, 'utf8');
  const sec = (f.match(/terms-(\d\d-\d\d)/) || [])[1];
  const edits = [];
  for (const id of ids) {
    const m = new RegExp(`(["']?id["']?\\s*:\\s*)(["'])${id.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}\\2`).exec(s);
    if (!m) continue;
    // id를 감싸는 가장 안쪽 객체
    const [a, b] = objectRanges(s).filter(([x, y]) => x < m.index && m.index < y).sort((p, q) => (p[1] - p[0]) - (q[1] - q[0]))[0];
    const obj = s.slice(a, b + 1);
    const sm = /(["']?src["']?\s*:\s*)(["'])([^"']*)\2/.exec(obj);
    let next;
    if (sm) {
      if (sm[3].split(' · ').includes(tag)) { found.set(id, `${f} (이미 있음)`); continue; }
      next = obj.replace(sm[0], `${sm[1]}${sm[2]}${sm[3]} · ${tag}${sm[2]}`);
    } else {
      const own = sec || id; // src가 없으면 그 파일의 섹션이 출처
      next = obj.replace(m[0], `${m[0]},\n    "src": "${own} · ${tag}"`);
    }
    edits.push([a, b, next]); found.set(id, f);
  }
  for (const [a, b, next] of edits.sort((p, q) => q[0] - p[0])) s = s.slice(0, a) + next + s.slice(b + 1);
  if (edits.length) fs.writeFileSync(file, s);
}
for (const id of ids) console.log(`${found.has(id) ? 'ok ' : '없음'} ${id}${found.has(id) ? ' — ' + found.get(id) : ''}`);
if (ids.some((id) => !found.has(id))) process.exit(1);
