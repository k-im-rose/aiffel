// 용어 원본(data/*.js)을 읽어 DB에 넣을 모양으로 만든다.
// 원본 파일은 사람이 고치기 쉬운 JS 형식이고, 서버가 켜질 때마다 DB와 맞춘다 (새 용어 추가 = 파일 하나 추가).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadTermFiles() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => /^terms(-\d\d-\d\d)?\.js$/.test(f)).sort();
  // terms.js(기본 용어와 addSection 정의)를 먼저, 그다음 자료별 파일
  files.sort((a, b) => (a === 'terms.js' ? -1 : b === 'terms.js' ? 1 : a.localeCompare(b)));
  const code = files.map((f) => fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).join('\n;\n');
  return vm.runInNewContext(code + '\n;({ TERMS, SECTIONS })', {}, { filename: 'data/terms*.js' });
}

// 섹션은 자료 순서로, 번호(position)는 섹션 순서대로 1부터
function buildCatalog() {
  const { TERMS, SECTIONS } = loadTermFiles();
  const sections = [...SECTIONS].sort((a, b) => a.id.localeCompare(b.id));
  const byId = Object.fromEntries(TERMS.map((t) => [t.id, t]));
  const terms = [];
  let position = 0;
  for (const sec of sections) {
    for (const id of sec.ids) {
      const t = byId[id];
      terms.push({
        id: t.id,
        section_id: sec.id,
        position: ++position,
        term: t.term,
        ko: t.ko,
        full_name: t.full || '',
        src: t.src,
        level: t.level || '',
        def: t.def,
        easy: t.easy || '',
        ex: typeof t.ex === 'string' ? t.ex : `${t.ex.title} — ${t.ex.body}`,
        related: (t.related || []).filter((r) => byId[r]),
        is_cmd: !!t.cmd,
        usage: t.use || '',
        stage: t.stage || '',
        ai: t.ai || '',
      });
    }
  }
  return { sections: sections.map((s) => ({ id: s.id, title: s.title })), terms };
}

module.exports = { buildCatalog };
