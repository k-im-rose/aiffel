// 아, 그게 뭐더라? — 퀴즈 문제 만들기 (화면과 상관없는 계산만)
// 브라우저에서는 window.QuizCore로, 시험(node)에서는 require로 쓴다.
// 문제는 용어 원본(def·easy)만으로 만든다. AI가 새로 쓰는 글은 없다.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuizCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const MASK = '○○○';

  // 용어가 나온 교안 목록. src는 '02-04 · 02-07'처럼 적혀 있다
  function srcList(term) {
    return String(term.src || '').split(/\s*[·,]\s*/).map(s => s.trim()).filter(Boolean);
  }

  // 그 교안에 나온 용어 전부 (처음 나온 섹션이 아니라 src 기준). 'all'이면 전체
  function termsForSection(terms, sectionId) {
    if (sectionId === 'all') return terms.slice();
    return terms.filter(t => srcList(t).includes(sectionId));
  }

  // 가릴 이름들: 영어 이름·한글 이름·풀네임과, 괄호나 · 로 나뉜 조각들. 두 글자 이상만
  // 여러 용어의 한글 이름에 같이 쓰이는 낱말 ('메모리', '모델' 같은 흔한 말). 이런 낱말은 따로 가리지 않는다
  const commonCache = new WeakMap();
  function commonKoWords(allTerms) {
    if (!allTerms) return new Set();
    if (commonCache.has(allTerms)) return commonCache.get(allTerms);
    const count = {};
    for (const t of allTerms) {
      for (const w of new Set(koWords(t))) count[w] = (count[w] || 0) + 1;
    }
    const common = new Set(Object.keys(count).filter(w => count[w] >= 2));
    commonCache.set(allTerms, common);
    return common;
  }
  function koWords(term) {
    // 괄호 안은 '(한국어 음성 합성기)'처럼 이름이 아니라 풀이인 경우가 많아 낱말로 나누지 않는다
    return String(term.ko || '').replace(/\(.*?\)/g, ' ').split(/[\s·,/]+/).filter(w => /^[가-힣]{3,}$/.test(w));
  }

  function nameParts(term, allTerms) {
    const out = new Set();
    for (const raw of [term.term, term.ko, term.full_name]) {
      if (!raw) continue;
      const whole = raw.trim();
      out.add(whole);
      out.add(whole.replace(/\s*\(.*?\)\s*/g, ' ').trim()); // 괄호 뺀 것
      for (const m of whole.matchAll(/\(([^)]*)\)/g)) out.add(m[1].trim()); // 괄호 안
      for (const piece of whole.split(/[()·,/]/)) out.add(piece.trim());
    }
    // 한글 이름의 세 글자 이상 낱말 중 이 용어에만 쓰이는 것도 가린다 ('가우시안 스플래팅' → 설명 속 '가우시안 스플랫')
    const common = commonKoWords(allTerms);
    for (const word of koWords(term)) if (!common.has(word)) out.add(word);
    return [...out].filter(s => s.length >= 2).sort((a, b) => b.length - a.length);
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // 글 안의 용어 이름을 ○○○로 가린다 (영어는 대소문자 무시)
  function maskNames(text, term, allTerms) {
    let out = String(text || '');
    for (const name of nameParts(term, allTerms)) {
      out = out.replace(new RegExp(escapeRe(name), 'gi'), MASK);
    }
    return out;
  }

  // 가렸는데도 이름이 남았는지 (점검용)
  function leaksName(text, term, allTerms) {
    const low = String(text || '').toLowerCase();
    return nameParts(term, allTerms).some(n => low.includes(n.toLowerCase()));
  }

  function sentences(text) {
    // 마침표 뒤에 빈칸이 올 때만 나눈다 ('0.8B' 같은 소수점은 그대로)
    return String(text || '').split(/(?<=[.!?。])\s+/).map(s => s.trim()).filter(Boolean);
  }

  // 쉽게 말하면 → 비유 줄과 나머지로 나누기
  function splitEasy(easy) {
    const [body, ...rest] = String(easy || '').split('\n비유하면:');
    return { body: body.trim(), analogy: rest.length ? rest.join('\n비유하면:').trim() : '' };
  }

  // 힌트: 쉽게 말하면의 앞 두 문장. 이름의 이유를 말하는 문장·비유 줄은 빼고, 이름은 가린다
  const NAME_REASON = /(라는 뜻|뜻의 말|뜻이에요|이름은|이름이|이름을|약자|줄임말|머리글자|에서 왔)/;
  function hintText(term, allTerms) {
    const picked = sentences(splitEasy(term.easy).body).filter(s => !NAME_REASON.test(s)).slice(0, 2);
    return maskNames(picked.join(' '), term, allTerms);
  }

  // 오답 설명용 한 문장: 쉽게 말하면 첫 문장, 없으면 뜻의 첫 문장
  function firstSentence(term) {
    return sentences(splitEasy(term.easy).body)[0] || sentences(term.def)[0] || '';
  }

  function shuffle(list, rand = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 오답 보기 3개: 같은 교안에 나온 용어에서 고르고, 같은 개발 단계면 먼저.
  // 정답과 서로 '연결할 용어'로 묶인 용어는 뜻이 겹칠 수 있어 뺀다. 모자라면 전체에서 채운다
  function pickDistractors(answer, pool, allTerms, rand = Math.random, n = 3) {
    const norm = s => String(s || '').trim().toLowerCase();
    const blocked = t =>
      t.id === answer.id ||
      (answer.related || []).includes(t.id) ||
      (t.related || []).includes(answer.id) ||
      norm(t.term) === norm(answer.term) ||
      norm(t.ko) === norm(answer.ko);
    const chosen = [];
    const seen = new Set([norm(answer.term)]);
    const take = list => {
      for (const t of list) {
        if (chosen.length >= n) return;
        if (blocked(t) || seen.has(norm(t.term))) continue;
        seen.add(norm(t.term));
        chosen.push(t);
      }
    };
    const fromPool = shuffle(pool, rand);
    take(fromPool.filter(t => answer.stage && t.stage === answer.stage));
    take(fromPool);
    take(shuffle(allTerms, rand));
    return chosen;
  }

  // 문제 하나: 뜻(이름 가림) + 힌트 + 보기 4개
  function buildQuestion(answer, pool, allTerms, rand = Math.random) {
    const options = shuffle([answer, ...pickDistractors(answer, pool, allTerms, rand)], rand);
    return {
      answer,
      prompt: maskNames(answer.def, answer, allTerms),
      hint: hintText(answer, allTerms),
      options,
    };
  }

  return { MASK, srcList, termsForSection, nameParts, maskNames, leaksName, splitEasy, hintText, firstSentence, shuffle, pickDistractors, buildQuestion };
});
