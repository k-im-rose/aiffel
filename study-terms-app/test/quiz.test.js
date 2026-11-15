// 퀴즈 문제 만들기 시험: 용어 원본 전체로 문제를 만들어 보고, 정답 이름이 새지 않는지·보기가 맞는지 확인한다.
// 실행: npm test
const test = require('node:test');
const assert = require('node:assert');
const Q = require('../public/quiz-core');
const { buildCatalog } = require('../server/terms');

const { terms: TERMS, sections: SECTIONS } = buildCatalog();
const byId = Object.fromEntries(TERMS.map(t => [t.id, t]));

test('교안 범위는 처음 나온 섹션이 아니라 src(나온 교안 전부) 기준', () => {
  const q = byId.quantization; // 03-03에서 처음 나오고 03-06에도 나온다
  assert.ok(Q.termsForSection(TERMS, '03-06').includes(q));
  for (const s of SECTIONS) {
    const pool = Q.termsForSection(TERMS, s.id);
    const firstHere = TERMS.filter(t => t.section_id === s.id);
    assert.ok(firstHere.every(t => pool.includes(t)), `${s.id}: 처음 나온 용어가 빠짐`);
  }
  assert.strictEqual(Q.termsForSection(TERMS, 'all').length, TERMS.length);
});

test('모든 용어: 문제 글과 힌트에 정답 이름이 남지 않는다', () => {
  const leaks = TERMS.filter(t =>
    Q.leaksName(Q.maskNames(t.def, t, TERMS), t, TERMS) || Q.leaksName(Q.hintText(t, TERMS), t, TERMS));
  assert.deepStrictEqual(leaks.map(t => t.id), []);
});

test('모든 용어: 힌트가 비어 있지 않고, 비유 줄은 힌트에 들어가지 않는다', () => {
  for (const t of TERMS) {
    const h = Q.hintText(t, TERMS);
    assert.ok(h.length > 0, `${t.id}: 힌트 없음`);
    assert.ok(!h.includes('비유하면'), `${t.id}: 힌트에 비유 줄`);
  }
});

test('소수점은 문장 나누기에서 잘리지 않는다', () => {
  assert.ok(!Q.hintText(byId['billion-params'], TERMS).includes('0. 8'));
});

test('모든 교안·모든 용어: 보기 4개, 정답 하나, 이름 겹침·연결 용어 없음', () => {
  for (const s of [...SECTIONS.map(x => x.id), 'all']) {
    const pool = Q.termsForSection(TERMS, s);
    for (const ans of pool) {
      const q = Q.buildQuestion(ans, pool, TERMS);
      assert.strictEqual(q.options.length, 4, `${s}/${ans.id}: 보기 수`);
      assert.strictEqual(q.options.filter(o => o.id === ans.id).length, 1);
      const names = q.options.map(o => o.term.toLowerCase());
      assert.strictEqual(new Set(names).size, 4, `${s}/${ans.id}: 같은 이름 보기`);
      for (const o of q.options) {
        if (o === ans) continue;
        assert.ok(!(ans.related || []).includes(o.id) && !(o.related || []).includes(ans.id), `${s}/${ans.id}: 연결 용어 ${o.id}가 오답`);
      }
    }
  }
});

test('오답은 같은 교안에서 먼저 고른다', () => {
  const pool = Q.termsForSection(TERMS, '03-06');
  const q = Q.buildQuestion(byId.quantization, pool, TERMS);
  assert.ok(q.options.every(o => pool.includes(o)));
});
