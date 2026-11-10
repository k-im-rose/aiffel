// 용어 목록 점검: 총 개수, 중복 id, 끊긴 related, 섹션별 번호 범위, 자료 번호가 붙은 기존 용어 수
// 사용: node check.js [study-terms-app 경로] [자료번호 예: 03-05]
const path = require('path'), fs = require('fs');
const root = path.resolve(process.argv[2] || '.'), tag = process.argv[3];
const { buildCatalog } = require(path.join(root, 'server/terms.js'));
const { terms } = buildCatalog();
const ids = new Set(terms.map((t) => t.id));
let bad = 0;
console.log(`총 ${terms.length}개`);
if (ids.size !== terms.length) { console.log('중복 id 있음'); bad++; }
// related는 buildCatalog가 없는 id를 걸러 내므로 원본 파일에서 직접 확인
for (const f of fs.readdirSync(path.join(root, 'data')).filter((f) => /^terms-\d\d-\d\d\.js$/.test(f))) {
  const raw = fs.readFileSync(path.join(root, 'data', f), 'utf8');
  const rel = [...raw.matchAll(/"related":\s*\[([^\]]*)\]/g)].flatMap((m) => m[1].match(/"[^"]+"/g) || []).map((x) => x.slice(1, -1));
  const broken = [...new Set(rel.filter((r) => !ids.has(r)))];
  if (broken.length) { console.log(`${f}: 끊긴 related ${broken.join(', ')}`); bad++; }
}
if (tag) {
  const sec = terms.filter((t) => t.section_id === tag);
  if (sec.length) console.log(`${tag} 섹션: ${sec.length}개, WORD ${sec[0].position}~${sec.at(-1).position}`);
  const tagged = terms.filter((t) => t.section_id !== tag && t.src.split(' · ').includes(tag));
  console.log(`${tag}가 출처에 붙은 기존 용어: ${tagged.length}개`);
}
process.exit(bad ? 1 : 0);
