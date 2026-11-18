// 날짜별 일일 투자 리서치 보고서. 기존 한 페이지 화면(web/v1_single_page/)의 내용과 기능을 그대로 옮기고,
// '내 종목에 미치는 영향'을 이야기별에서 종목별 섹션으로 모았다.
const STANCE = { strengthens: "긍정 신호", risk: "위험 신호", unclear: "판단 보류" };
const BASIS = { original: "기자 본문에서 확인", partial: "공개된 일부 본문에서 확인", summary_only: "원문 확인 불가 · 제목·요약 기준", no_source: "출처 없음" };
let B = null;
let RUN_ID = null;

// 내부 기사 id(n-/s-/f-…)가 문장에 섞여 있으면 언론사 이름으로 바꿔 보여 준다
function ids2names(text, story) {
  const by = Object.fromEntries(story.sources.map((x) => [x.id, x.source]));
  return text.replace(/\b[nsfd]-[0-9a-f]{10}\b/g, (m) => (by[m] ? `${by[m]} 기사` : "해당 기사"));
}

// ---- 핵심 수치 블록: 저장된 '확인된 사실' 문장에서 표시 단계에서만 꺼낸다 (원본·검증 결과는 수정하지 않음) ----
// 규칙: 문장 속 표현이 정해진 모양과 정확히 맞을 때만 만든다. 맞지 않으면 블록 없이 일반 텍스트 레이아웃을 쓴다.
// 화면에 쓰는 수치 글자는 모두 문장에서 그대로 가져온 것이며, 마지막에 문장에 실제로 들어 있는지 다시 확인한다.
const ITEM_RULES = [
  { re: /10년물 국채금리가 (\d+bp) 올라 (\d+(?:\.\d+)?%)/, f: (m) => ({ label: "미 10년물 국채금리", value: m[2], sub: `${m[1]} 상승` }) },
  { re: /미국 (\d+월) (?:소비자물가|CPI)는 전월 대비 (\d+(?:\.\d+)?%)/, f: (m) => ({ label: `미국 ${m[1]} 소비자물가`, value: m[2], sub: "전월 대비 상승" }) },
  { re: /10년물 금리는 장중 (\d+%)를 재돌파/, f: (m) => ({ label: "미 10년물 금리", value: m[1], sub: "장중 재돌파" }) },
  { re: /원유가 배럴당 (\d+)달러로 (하락|상승)/, f: (m) => ({ label: "미국 원유 (배럴당)", value: `${m[1]}달러`, sub: m[2] }) },
];
const BAR_RULES = [
  // 같은 날 적용되는 석유 최고가격: 단위(ℓ당 원)가 같은 세 품목
  { re: /제(\d+)차 석유 최고가격은 ℓ당 휘발유 (\d+)원, 경유 (\d+)원, 등유 (\d+)원/,
    f: (m, text) => { const d = text.match(/(\d+\/\d+)부터 적용된/); return { type: "bars", title: `제${m[1]}차 석유 최고가격 (ℓ당)`, note: d ? `${d[1]}부터 적용` : "",
      rows: [["휘발유", m[2]], ["경유", m[3]], ["등유", m[4]]].map(([l, v]) => ({ label: l, raw: `${v}원`, n: +v })) }; } },
  // 코픽스: 같은 지표를 이전과 이번으로 비교 (단위 같음). 잔액·신잔액 기준이 함께 적혀 있으면 한 도표에 묶는다
  { re: /신규 취급액 기준 코픽스는 연 (\d+\.\d+)%로 전월\((\d+\.\d+)%\)보다 (\d+\.\d+%포인트) 올/,
    f: (m, text) => {
      const g = [{ g: "신규 취급액 기준", a: m[2], b: m[1] }];
      const k = text.match(/잔액 기준 코픽스는 (\d+\.\d+)%에서 (\d+\.\d+)%로, 신잔액 기준은 (\d+\.\d+)%에서 (\d+\.\d+)%로 올/);
      if (k) g.push({ g: "잔액 기준", a: k[1], b: k[2] }, { g: "신잔액 기준", a: k[3], b: k[4] });
      return { type: "bars", title: "코픽스 (연 %)", note: `신규 취급액 기준은 전월 대비 +${m[3]}`,
        rows: g.flatMap((x) => [{ group: x.g, label: "이전", raw: `${x.a}%`, n: parseFloat(x.a) }, { group: x.g, label: "이번", raw: `${x.b}%`, n: parseFloat(x.b), accent: true }]) };
    } },
];
function gwhBlock(text) {
  // 같은 단위(GWh)로 기사에 함께 적힌 기존·신규·누적 물량
  const nw = text.match(/LFP 배터리 (\d+)GWh를 공급/), cum = text.match(/누적 물량은 약 (\d+)GWh/), old = text.match(/기존 계약 물량은 (\d+)GWh/);
  if (!nw || !cum) return null;
  const rows = [];
  if (old) rows.push({ label: "기존 계약", raw: `${old[1]}GWh`, n: +old[1] });
  rows.push({ label: "이번 신규 계약", raw: `${nw[1]}GWh`, n: +nw[1], accent: true }, { label: "누적 (약)", raw: `약 ${cum[1]}GWh`, n: +cum[1] });
  return { type: "bars", title: "삼성SDI 미국 ESS 공급 물량", note: "", rows };
}
function policyTimeline(text) {
  const steps = [];
  if (/8월 세법개정안은[^.]*?전기차는 제외/.test(text)) steps.push({ when: "8월", text: "세법개정안에서 전기차는 제외", done: true });
  if (/이달 말 국회 조세소위에서 윤곽/.test(text)) steps.push({ when: "이달 말", text: "국회 조세소위에서 윤곽" });
  const y = text.match(/이르면 내년 (\d+월) 시행령으로 지원 규모가 정해질 것이라는 관측/);
  if (y) steps.push({ when: `이르면 내년 ${y[1]}`, text: "시행령으로 지원 규모 결정 (관측)" });
  return steps.length >= 2 ? { type: "timeline", title: "전기차 국내생산 세제 진행", steps } : null;
}
function shareBlock(text) {
  // 세계 자동차 생산 점유율: 같은 지표(%)를 2015년과 올해로 비교. 연도별로 묶은 세로 막대
  const cn = text.match(/중국산은 \d+만대\((\d+\.\d+)%\)로, 2015년 (\d+\.\d+)%에서/), kr = text.match(/한국산은 (\d+\.\d+)%에서 (\d+\.\d+)%로 줄었/), y = text.match(/(\d{4})년 세계 자동차 생산/);
  if (!cn || !kr || !y) return null;
  const v = (x) => ({ raw: `${x}%`, n: parseFloat(x) });
  return { type: "columns", title: "세계 자동차 생산 점유율 (%)", series: ["중국산", "한국산"],
    groups: [{ label: "2015년", values: [v(cn[2]), v(kr[1])] }, { label: `${y[1]}년`, values: [v(cn[1]), v(kr[2])] }] };
}
function summitDate(text) {
  const m = text.match(/(\d{1,2})일 (?:중국 )?(선전)에서 (?:사상 첫 )?(3자 정상회담)/) || (() => { const k = text.match(/(3자 정상회담)이 (\d{1,2})일 (선전)에서/); return k && [k[0], k[2], k[3], k[1]]; })();
  return m ? { type: "date", day: `${m[1]}일`, where: m[2], what: m[3] } : null;
}
function extractBlocks(facts, story) {
  const text = facts.map((f) => ids2names(f.text, story)).join("\n");
  let blks = [];
  for (const r of BAR_RULES) { const m = text.match(r.re); if (m) { blks.push(r.f(m, text)); break; } }
  for (const b of [gwhBlock(text), policyTimeline(text), shareBlock(text), summitDate(text)]) if (b) blks.push(b);
  if (!blks.length) {
    const items = ITEM_RULES.map((r) => { const m = text.match(r.re); return m && r.f(m); }).filter(Boolean).slice(0, 2);
    if (items.length) blks.push({ type: "metrics", items });
  }
  // 최종 확인: 화면에 쓸 수치 글자가 문장에 그대로 들어 있어야 한다
  const ok = (blk) => {
    const shown = blk.type === "metrics" ? blk.items.map((i) => i.value) : blk.type === "bars" ? blk.rows.map((r) => r.raw.replace(/^약 /, "")) : blk.type === "date" ? [blk.day.replace("일", "")] : blk.type === "columns" ? blk.groups.flatMap((g) => g.values.map((x) => x.raw)) : [];
    return shown.every((v) => text.includes(v));
  };
  return blks.filter(ok).slice(0, 2);
}
function renderBlock(b) {
  const box = el("div", null, { class: `figure figure-${b.type}` });
  if (b.type === "metrics") {
    for (const i of b.items) {
      const m = el("div", null, { class: "metric" });
      m.append(el("div", i.label, { class: "metric-label" }), el("div", i.value, { class: "metric-value num motion-number" }), el("div", i.sub, { class: "metric-sub" }));
      box.append(m);
    }
  } else if (b.type === "bars") {
    box.append(el("div", b.title, { class: "figure-title" }));
    const max = Math.max(...b.rows.map((r) => r.n));
    let lastGroup = null, idx = 0;
    for (const r of b.rows) {
      if (r.group && r.group !== lastGroup) { box.append(el("div", r.group, { class: "bar-group" })); lastGroup = r.group; }
      const row = el("div", null, { class: `bar-row${r.accent ? " is-accent" : ""}` });
      const bar = el("div", null, { class: "bar" }); const fill = el("div", null, { class: "bar-fill" }); fill.style.setProperty("--i", String(idx++)); fill.style.width = `${(r.n / max) * 100}%`; bar.append(fill);
      row.append(el("div", r.label, { class: "bar-label" }), bar, el("div", r.raw, { class: "bar-value num" }));
      box.append(row);
    }
    if (b.note) box.append(el("div", b.note, { class: "figure-note" }));
  } else if (b.type === "columns") {
    box.append(el("div", b.title, { class: "figure-title" }));
    const lg = el("div", null, { class: "col-legend" });
    b.series.forEach((n, i) => { const k = el("span", null, { class: "col-key" }); k.append(el("i", null, { class: `sw s${i}` }), n); lg.append(k); });
    box.append(lg);
    const max = Math.max(...b.groups.flatMap((g) => g.values.map((x) => x.n)));
    const plot = el("div", null, { class: "col-plot" });
    let idx = 0;
    for (const g of b.groups) {
      const grp = el("div", null, { class: "col-group" }), cols = el("div", null, { class: "cols" });
      g.values.forEach((x, i) => {
        const cc = el("div", null, { class: "col-cell" });
        const bar = el("div", null, { class: `col s${i}` }); bar.style.height = `${(x.n / max) * 100}%`; bar.style.setProperty("--i", String(idx++));
        cc.append(el("div", x.raw, { class: "col-value num" }), bar); cols.append(cc);
      });
      grp.append(cols, el("div", g.label, { class: "col-label" })); plot.append(grp);
    }
    box.append(plot);
  } else if (b.type === "timeline") {
    box.append(el("div", b.title, { class: "figure-title" }));
    const ol = el("ol", null, { class: "timeline" });
    b.steps.forEach((s, i) => { const li = el("li", null, { class: s.done ? "done" : "" }); li.style.setProperty("--i", String(i)); li.append(el("span", s.when, { class: "tl-when" }), el("span", s.text, { class: "tl-text" })); ol.append(li); });
    box.append(ol);
  } else if (b.type === "date") {
    // 달력 아이콘 모양 일정 카드: 윗띠에 일정 이름, 가운데 큰 날짜 (기사 문장에 있는 글자만 쓴다)
    const card = el("div", null, { class: "cal-icon", role: "img", "aria-label": `${b.what} ${b.where} ${b.day}` });
    card.append(el("div", `${b.what} · ${b.where}`, { class: "cal-icon-top" }),
      el("div", null, { class: "cal-icon-body" }));
    card.lastChild.append(el("div", b.day, { class: "cal-icon-day num motion-number" }), el("div", "공식 발표된 개최일", { class: "cal-icon-sub" }));
    box.append(card);
  }
  return box;
}

// 문장 속 핵심 수치(숫자+단위)만 굵게. 글자는 그대로 두고 표시만 바꾼다 (날짜·연도는 제외)
const FIG_RE = /(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s?(%포인트|%p|%|bp|달러|조\s?원|억\s?원|만\s?원|원|만대|GWh|MWh|배)/g;
function withFigures(node, text) {
  let last = 0;
  for (const m of text.matchAll(FIG_RE)) {
    if (m.index > last) node.append(text.slice(last, m.index));
    node.append(el("strong", m[0], { class: "hl" }));
    last = m.index + m[0].length;
  }
  if (last < text.length) node.append(text.slice(last));
  return node;
}

// 사실 문장 바로 옆의 작은 '원문 확인' 링크: 그 문장에 붙은 출처 기사로 간다
function srcLinks(f, story) {
  const urls = (f.source_ids || []).map((id) => story.sources.find((x) => x.id === id)).filter((x) => x && x.url);
  return urls.map((x, i) => el("a", urls.length > 1 ? `원문 확인 ${i + 1}` : "원문 확인", { href: x.url, target: "_blank", rel: "noopener", class: "src-link", title: `${x.source} · ${x.title_ko || x.title}` }));
}

// 모션: 화면에 들어올 때 한 번, 짧게. 막대는 자라고 숫자는 올라가고 진행선은 그어진다 (동작 줄이기 설정이면 쓰지 않음)
function armMotion(root) {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window);
  if (calm) return;
  document.documentElement.classList.add("js-motion");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target); e.target.classList.add("in");
    e.target.querySelectorAll(".metric-value").forEach(countUp);
  }), { threshold: 0.3 });
  root.querySelectorAll(".figure").forEach((f) => io.observe(f));
}
function countUp(node) {
  const full = node.textContent, m = full.match(/^(약 )?(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return;
  const to = parseFloat(m[2]), dec = (m[2].split(".")[1] || "").length, t0 = performance.now(), dur = 700;
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - k, 3));
    node.textContent = k < 1 ? `${m[1] || ""}${v.toFixed(dec)}${m[3]}` : full;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderStories() {
  const box = $("#stories");
  box.replaceChildren();
  for (const s of B.stories) {
    const art = el("article", null, { class: "entry story", id: `story-${s.priority}` });
    art.append(el("div", s.section, { class: "tag" }), el("h3", s.headline));
    // 원문 대조로 확인한 사실이 있으면 그것만 보여 준다 (요약 기반 사실과 겹치므로)
    const orig = s.facts.filter((f) => f.from_original);
    const facts = orig.length ? orig : s.facts;
    const [lead, ...rest] = facts;
    if (lead) {
      const p = withFigures(el("p", null, { class: "fact-lead" }), ids2names(lead.text, s));
      srcLinks(lead, s).forEach((a) => p.append(" ", a));
      art.append(p);
    }
    extractBlocks(facts, s).forEach((b) => art.append(renderBlock(b)));
    if (rest.length) {
      const ul = el("ul");
      for (const f of rest) {
        const li = withFigures(el("li"), ids2names(f.text, s));
        srcLinks(f, s).forEach((a) => li.append(" ", a));
        ul.append(li);
      }
      art.append(ul);
    }
    if (s.same_event === "yes" && s.sources.length > 1) art.append(el("p", "여러 매체의 보도를 원문으로 대조해 같은 사건으로 묶었습니다.", { class: "meta" }));
    // AI 해석: 사실과 구분되는 옅은 배경면
    const ai = el("div", null, { class: "ai-panel" });
    ai.append(el("h4", "AI 해석"), el("p", s.interpretation.replace(/^해석:\s*/, ""), { class: "interp" }));
    if (s.economy_impact) ai.append(el("h4", "경제·산업 영향"), el("p", s.economy_impact));
    art.append(ai);
    if (s.follow_up) { const f = el("div", null, { class: "follow" }); f.append(el("p", s.follow_up)); art.append(f); }
    const det = el("details");
    det.append(el("summary", `출처 ${s.sources.length}건`));
    const src = el("ul");
    s.sources.forEach((x) => src.append(sourceLink(x)));
    det.append(src);
    art.append(det);
    box.append(art);
  }
  armMotion(box);
}

// 3. 종목별로 모은 영향과 확인할 사항
function renderHoldings() {
  const box = $("#holdings");
  box.replaceChildren();
  const by = new Map();
  for (const s of B.stories) for (const x of s.thesis_impact || []) {
    if (!by.has(x.stock)) by.set(x.stock, []);
    by.get(x.stock).push({ ...x, story: s });
  }
  for (const c of B.ai_checks) if (!by.has(c.target)) by.set(c.target, []);  // 점검 항목만 있는 종목도 한 묶음
  if (!by.size) { box.append(el("p", "오늘 뉴스 가운데 내 종목과 직접 이어지는 것이 없습니다.", { class: "meta" })); return; }
  // 위험 신호가 있는 종목 -> 긍정 신호 -> 판단 보류 -> 뉴스 없음 순
  const rank = (items) => (items.some((x) => x.stance === "risk") ? 0 : items.some((x) => x.stance === "strengthens") ? 1 : items.length ? 2 : 3);
  const entries = [...by].sort((a, b) => rank(a[1]) - rank(b[1]));
  const many = entries.length > 3;  // 4종목 이상이면 접어 두고 위에 목차를 둔다 (3종목 이하는 모두 펼침)
  const index = el("div", null, { class: "stock-index" });
  for (const [stock, items] of entries) {
    const blk = el("div", null, { class: "stock-block" });
    blk.dataset.stock = stock;
    const hasRisk = items.some((x) => x.stance === "risk");
    const h3 = el("h3", stock);
    blk.append(h3);
    if (many) {
      const counts = {};
      for (const x of items) counts[x.stance] = (counts[x.stance] || 0) + 1;
      const nChecks = B.ai_checks.filter((c) => c.target === stock).length;
      const parts = ["risk", "strengthens", "unclear"].filter((k) => counts[k]).map((k) => `${STANCE[k]} ${counts[k]}`);
      if (nChecks) parts.push(`점검 ${nChecks}`);
      const sum = el("button", parts.join(" · ") || "오늘 관련 뉴스 없음", { type: "button", class: "stock-sum" });
      const toggle = () => blk.classList.toggle("open");
      sum.onclick = toggle; h3.onclick = toggle;
      blk.classList.add("collapsible");
      if (hasRisk) blk.classList.add("open");
      blk.append(sum);
    }
    const chip = el("button", stock, { type: "button", class: "si" });  // 종목 수와 상관없이 목차는 항상 보인다
    if (hasRisk) chip.append(el("span", null, { class: "risk-dot", title: "위험 신호" }));
    chip.onclick = () => { blk.classList.add("open"); blk.scrollIntoView({ behavior: "smooth", block: "start" }); };
    index.append(chip);
    for (const x of items) {
      const p = el("div", null, { class: "item holding" });
      const rel = el("div", null, { class: "meta rel" });
      const go = el("a", `${x.story.priority}. ${x.story.headline}`, { href: `#story-${x.story.priority}` });
      go.onclick = (e) => {  // 같은 보고서의 해당 뉴스(01)로 이동해 잠깐 표시
        e.preventDefault();
        const t = document.getElementById(`story-${x.story.priority}`);
        if (!t) return;
        t.scrollIntoView({ behavior: "smooth", block: "start" });
        t.classList.add("flash"); setTimeout(() => t.classList.remove("flash"), 1800);
      };
      rel.append("관련 뉴스 | ", go);
      const txt = el("p", null, { class: "reason" });
      txt.append(el("span", STANCE[x.stance] || x.stance, { class: `stance stance-${x.stance}` }), x.reason);
      p.append(txt, rel);
      if (x.to_verify) { const v = el("div", null, { class: "verify" }); v.append(el("h4", "판단하려면 확인할 것"), el("p", x.to_verify)); p.append(v); }
      blk.append(p);
    }
    box.append(blk);
  }
  if (entries.some(([, items]) => items.some((x) => x.stance === "risk"))) {
    const lg = el("span", null, { class: "si-legend" });
    lg.append(el("span", null, { class: "risk-dot" }), " 위험 신호 있음");
    index.append(lg);
  }
  box.prepend(index);
}

// 추가로 보면 좋을 뉴스: 방송에 못 담은 기사 중 다시 볼 만한 것을 제목·출처만 한 줄씩 (제외 이유·분류 설명은 화면에 쓰지 않는다)
function renderNotAired() {
  const box = $("#not-aired");
  box.replaceChildren();
  const arts = Object.values(B.not_aired).flatMap((g) => g.items.filter((it) => it.url));
  if (!arts.length) { box.append(el("p", "오늘은 없습니다.", { class: "meta" })); return; }
  for (const it of arts) {
    const d = el("div", null, { class: "item" });
    d.append(el("a", it.title_ko || it.title, { href: it.url, target: "_blank", rel: "noopener" }), el("div", `${it.source} · ${kst(it.published_at)}`, { class: "meta" }));
    if (it.ai_reason) d.append(el("p", it.ai_reason, { class: "na-sum" }));
    box.append(d);
  }
}

function renderConcept() {
  const box = $("#concept");
  box.replaceChildren();
  const c = B.concept;
  if (!c) { box.append(el("p", "오늘은 뉴스와 직접 연결되는 800선 용어가 없습니다.", { class: "meta" })); return; }
  box.append(el("div", c.term, { class: "concept-term" }), el("p", c.plain, { class: "concept-plain" }));
  const link = el("div", null, { class: "concept-link" });
  link.append(el("h4", "오늘 뉴스에서는"), el("p", c.in_today_news));
  const inv = el("div", null, { class: "concept-link concept-inv" });
  inv.append(el("h4", "투자 분석에서는"), el("p", c.for_investing));
  const src = el("details", null, { class: "bok" });
  src.append(el("summary", "한국은행 원문 정의"), el("blockquote", c.bok_quote, { class: "concept-def" }),
    el("p", `출처: ${c.source}, ${c.book_page}쪽 (첫 문장 인용)`, { class: "meta" }));
  box.append(link, inv, src);
}

function renderQuiz() {
  const box = $("#quiz");
  box.replaceChildren();
  const q = B.quiz;
  if (!q) { box.append(el("p", "오늘은 퀴즈가 없습니다.", { class: "meta" })); return; }
  const form = el("form");
  { const qq = el("p", null, { class: "quiz-q" }); qq.append(q.question); form.append(qq); }
  q.choices.forEach((c, i) => {
    const lab = el("label", null, { class: "choice" });
    lab.append(el("input", null, { type: "radio", name: "quiz", value: String(i) }), el("span", `${i + 1}. ${c}`, { class: "ctext" }));
    form.append(lab);
  });
  const res = el("div", null, { class: "result" });
  const actions = el("div", null, { class: "form-actions" });
  actions.append(el("button", "정답 확인", { type: "submit" }));
  form.append(actions, res);
  form.onsubmit = (e) => {
    e.preventDefault();
    const v = form.querySelector("input[name=quiz]:checked");
    if (!v) { res.textContent = "답을 골라 주세요."; res.classList.add("shown"); return; }
    const ok = Number(v.value) === q.answer;
    res.replaceChildren(el("strong", ok ? "정답입니다. " : `정답은 ${q.answer + 1}번입니다. `, { class: "accent" }), q.explanation); res.classList.add("shown");
  };
  box.append(form);
}

// 오늘의 메모: 날짜마다 메모 하나를 두고 계속 이어 쓴다. 입력하면 잠시 뒤 자동 저장하고 상태를 작게 보여 준다
let memoId = null, memoTimer = null, memoLast = "", memoQueue = Promise.resolve(), memoFailed = false;
const memoStatus = (t) => { $("#memo-status").textContent = t; };
async function loadMemo() {
  const items = await api(`/api/memos?date=${B.date}`);  // 최신순. 같은 날짜에 여러 건이 있으면 가장 최근 한 건을 이어 쓴다
  if (items.length) { memoId = items[0].id; $("#memo-text").value = items[0].text; memoLast = items[0].text.trim(); memoFit(); }
}
function saveMemo() {  // 저장은 한 번에 하나씩 차례로 (메모가 둘로 갈라지지 않게)
  memoQueue = memoQueue.then(async () => {
    const t = $("#memo-text").value.trim();
    if (t === memoLast && !memoFailed) { return; }
    memoStatus("저장 중…");
    try {
      if (!t) { if (memoId) { await api(`/api/memos/${memoId}`, { method: "DELETE" }); memoId = null; } }
      else if (memoId) await api(`/api/memos/${memoId}`, { method: "PUT", body: JSON.stringify({ text: t }) });
      else memoId = (await api("/api/memos", { method: "POST", body: JSON.stringify({ date: B.date, text: t }) })).id;
      memoLast = t; memoFailed = false; memoStatus("저장됨");
    } catch (e) {
      memoFailed = true; memoStatus("저장 실패");
      clearTimeout(memoTimer); memoTimer = setTimeout(saveMemo, 5000);  // 잠시 뒤 다시 시도
    }
  });
}
const memoFit = () => { const t = $("#memo-text"); t.style.height = "auto"; t.style.height = `${Math.max(300, t.scrollHeight)}px`; };  // 기본 크기를 지키고, 길어지면 글 길이만큼 아래로 늘어난다
window.addEventListener("resize", memoFit);
$("#memo-text").oninput = () => { memoFit(); clearTimeout(memoTimer); memoStatus(""); memoTimer = setTimeout(saveMemo, 800); };
$("#memo-text").onblur = () => { clearTimeout(memoTimer); saveMemo(); };
// 아직 저장되지 않았거나 저장에 실패한 채로 나가려 하면 한 번 알려 준다
window.addEventListener("beforeunload", (e) => {
  if (memoFailed || $("#memo-text").value.trim() !== memoLast) { e.preventDefault(); e.returnValue = ""; }
});

async function renderChecks() {
  const items = await api("/api/checks");
  const open = $("#check-list"), done = $("#check-done");
  open.replaceChildren(); done.replaceChildren();
  for (const c of items) (c.done ? done : open).append(checkItem(c, () => { renderChecks(); refreshAiChecks(); }));
  if (!open.children.length) open.append(el("p", "남은 항목이 없습니다.", { class: "meta" }));
}

async function refreshAiChecks() {
  const mine = await api("/api/checks");
  const added = new Set(mine.filter((c) => c.origin === "ai").map((c) => c.ai_ref?.id));
  const today = new Date().toLocaleDateString("sv-SE");
  for (const blk of document.querySelectorAll("#holdings .stock-block")) {
    blk.querySelector(".ai-checklist")?.remove();
    const list = B.ai_checks.filter((c) => c.target === blk.dataset.stock);
    if (!list.length) continue;
    const wrap = el("div", null, { class: "ai-checklist" });
    wrap.append(el("h4", "점검 리스트"));
    for (const c of list) {
      const d = el("div", null, { class: "ck" });
      const main = el("div", null, { class: "ck-main" });
      main.append(el("p", c.task, { class: "ck-task" }),
        el("div", `추천 이유: ${c.reason} · 확인 시점: ${c.when}`, { class: "meta" }));
      const s = el("ul", null, { class: "ck-src" }); c.sources.forEach((x) => s.append(sourceLink(x))); main.append(s);
      d.append(main);
      if (added.has(c.id)) d.append(el("span", "내 목록에 추가됨", { class: "ck-done" }));
      else {
        const b = el("button", "내 목록에 추가", { type: "button", class: "mini add-btn" });
        b.dataset.tip = `누르면 '다음에 점검할 것'에 이렇게 들어갑니다\n☐ ${c.target}: ${c.task}\n${today}`;
        b.onclick = async () => {
          await api("/api/checks", { method: "POST", body: JSON.stringify({
            text: `${c.target}: ${c.task}`, origin: "ai", briefing_date: B.date,
            ai_ref: { id: c.id, target: c.target, reason: c.reason, when: c.when, sources: c.sources.map((x) => x.url) } }) });
          renderChecks(); refreshAiChecks();
        };
        d.append(b);
      }
      wrap.append(d);
    }
    blk.append(wrap);
  }
}

$("#memo-form").onsubmit = (e) => e.preventDefault();
$("#check-form").onsubmit = async (e) => {
  e.preventDefault();
  const t = $("#check-text").value.trim();
  if (!t) return;
  await api("/api/checks", { method: "POST", body: JSON.stringify({ text: t, origin: "user", briefing_date: B.date }) });
  $("#check-text").value = "";
  renderChecks();
};
$("#pdf-btn").onclick = () => window.print();  // 인쇄 창에서 "PDF로 저장"을 고르면 A4 한두 쪽으로 나온다

(async () => {
  await renderChrome("archive");
  RUN_ID = new URLSearchParams(location.search).get("id");
  const runs = await api("/api/briefings");
  // 이전 보고서 확인하기: 버튼을 누르면 날짜별 보고서가 아래에 펼쳐진다 (날짜 + 핵심 뉴스 제목)
  const list = $("#run-list"), toggle = $("#run-toggle");
  const pick = (t) => { const i = t.indexOf(": "); return (i > 0 ? t.slice(i + 2) : t).slice(0, 80); };
  const runRow = (date, text, id, current) => {
    const row = el("div", null, { class: `list-row${current ? " is-current" : ""}` });
    const body = el("div", null, { class: "body" });
    body.append(current ? el("span", text) : el("a", text, { href: reportUrl(id) }));
    row.append(el("div", date, { class: "date" }), body, el("div", current ? "보고 있는 보고서" : "", { class: "side" }));
    return row;
  };
  for (const r of runs) list.append(runRow(r.date, pick(r.title), r.id, r.id === RUN_ID));
  // 버튼 바로 아래에 떠서 열리는 목록 (페이지 배치를 밀지 않는다). 바깥을 누르거나 Esc를 누르면 닫힌다
  const setOpen = (open) => { list.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); };
  toggle.onclick = (e) => { e.stopPropagation(); setOpen(list.hidden); };
  document.addEventListener("click", (e) => { if (!list.hidden && !list.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !list.hidden) { setOpen(false); toggle.focus(); } });
  try { B = await api(`/api/briefings/${encodeURIComponent(RUN_ID)}`); }
  catch { $("#r-title").textContent = "이 날짜의 보고서가 없습니다."; return; }
  document.title = `그내종 · ${B.date} 보고서`;
  $("#r-when").textContent = longDate(B.date);
  if (B.release?.status !== "approved") {
    // 개발·평가 기록: 일반 목록에 없는 판. 승인판이 있으면 그쪽으로 안내한다
    const final = runs.find((r) => r.date === B.date);
    const n = $("#r-record");
    n.replaceChildren(el("strong", "개발·평가 기록입니다. 이 날짜의 최종 승인판이 아닙니다. "),
      final ? el("a", "이 날짜의 승인판 보기", { href: reportUrl(final.id) }) : "이 날짜에는 승인판이 없습니다.",
      " · ", el("a", "기록 목록", { href: "records.html" }));
    n.hidden = false;
    if (!runs.some((r) => r.id === RUN_ID)) list.prepend(runRow(B.date, `개발·평가 기록 (${RUN_ID})`, RUN_ID, true));
  }
  { // 제목을 "날짜 브리핑" 줄과 핵심 뉴스 줄로 나눠 보인다 (글자 내용은 그대로)
    const t = $("#r-title"), i = B.title.indexOf(": ");
    if (i > 0) { t.replaceChildren(el("span", B.title.slice(0, i), { class: "t-day" }), el("span", B.title.slice(i + 2), { class: "t-head" })); }
    else t.textContent = B.title;
  }
  $("#r-meta").textContent = `생성 ${kst(B.generated_at)} · 뉴스 수집 마감 ${kst(B.cutoff_at)} KST`;
  // 수정 기록(B.revision)은 화면에 쓰지 않는다. 자동 실행 때 채팅으로 따로 보고한다.
  $(".player").replaceChildren(el("p", "음성 파일(MP3)은 재배포 조건이 확인되지 않아 공개하지 않았습니다. 대본은 저장소의 script.md에서 읽을 수 있습니다.", { class: "meta" }));
  { // 핵심 요약: 저장된 뉴스 제목 앞 네 건
    const sb = $("#b-summary"), top = B.stories.slice(0, 4);
    if (top.length) { { const lb = el("div", "핵심", { class: "summary-label" }); lb.append(el("br"), "요약"); sb.append(lb); } const ul = el("ul"); top.forEach((s) => ul.append(el("li", s.headline))); sb.append(ul); sb.hidden = false; }
  }
  renderStories(); renderHoldings(); renderNotAired(); renderConcept(); renderQuiz();
  loadMemo(); renderChecks(); refreshAiChecks();
})();
