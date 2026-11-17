// 날짜별 일일 투자 리서치 보고서. 기존 한 페이지 화면(web/v1_single_page/)의 내용과 기능을 그대로 옮기고,
// '내 종목에 미치는 영향'을 이야기별에서 종목별 섹션으로 모았다.
const STANCE = { strengthens: "투자 이유를 강화하는 쪽", risk: "위험 요인 쪽", unclear: "아직 판단하기 어려움" };
const BASIS = { original: "기자 본문에서 확인", partial: "공개된 일부 본문에서 확인", summary_only: "원문 확인 불가 · 제목·요약 기준", no_source: "출처 없음" };
let B = null;
let RUN_ID = null;

// 내부 기사 id(n-/s-/f-…)가 문장에 섞여 있으면 언론사 이름으로 바꿔 보여 준다
function ids2names(text, story) {
  const by = Object.fromEntries(story.sources.map((x) => [x.id, x.source]));
  return text.replace(/\b[nsfd]-[0-9a-f]{10}\b/g, (m) => (by[m] ? `${by[m]} 기사` : "해당 기사"));
}

function renderChecksLine() {
  const fc = B.checks.fact_check || {};
  const ev = fc.evidence;
  const parts = [`사실 주장 ${fc.claims_checked ?? "-"}개 중 출처와 어긋난 주장 ${fc.critical_issues ?? "-"}건(중대) · ${fc.minor_issues ?? "-"}건(경미)`];
  if (ev) parts.push(`사실 문장의 근거: 기자 본문 ${ev.original}, 공개된 일부 본문 ${ev.partial}, 원문 확인 불가 ${ev.summary_only}`);
  if (fc.removed_unverifiable != null) parts.push(`출처에서 확인할 수 없어 뺀 문장 ${fc.removed_unverifiable}개${fc.shortened_unverifiable ? `, 일부만 뺀 문장 ${fc.shortened_unverifiable}개` : ""}`);
  parts.push(`중요 뉴스 ${B.checks.high_importance?.used ?? "-"}/${B.checks.high_importance?.total ?? "-"}건 반영`);
  $("#b-checks").textContent = parts.join(" · ");
  $("#b-scope").textContent = (fc.scope || "AI가 출처 기사와 대조한 결과입니다.")
    + (ev ? "" : " 이 보고서는 근거 수준을 기록하기 전의 검증 방식으로 만들었습니다.")
    + " 독립적인 사실 검증이 아니며, 기업 공시·공식 통계 확인은 별도 단계로 아직 하지 않습니다.";
}

function renderStories() {
  const box = $("#stories");
  box.replaceChildren();
  for (const s of B.stories) {
    const art = el("article", null, { class: "entry story" });
    art.append(el("div", `${s.priority} · ${s.section}`, { class: "tag" }), el("h3", s.headline));
    // 원문 대조로 확인한 사실이 있으면 그것만 보여 준다 (요약 기반 사실과 겹치므로)
    const orig = s.facts.filter((f) => f.from_original);
    const facts = orig.length ? orig : s.facts;
    art.append(el("h4", "확인된 사실"));
    const ul = el("ul");
    for (const f of facts) {
      const li = el("li", ids2names(f.text, s));
      if (f.basis) li.append(el("span", BASIS[f.basis] || f.basis, { class: "fact-basis" }));
      ul.append(li);
    }
    art.append(ul);
    if (s.same_event === "yes" && s.sources.length > 1) art.append(el("p", "여러 매체의 보도를 원문으로 대조해 같은 사건으로 묶었습니다.", { class: "meta" }));
    // 확인 불가: 원문에서 확인할 수 없는 내용. 사실로 쓰지 않는다
    const unv = [...(s.facts_removed || []).map((t) => `${t} (출처 본문에서 확인되지 않아 사실에서 뺌)`), ...s.unverified];
    if (unv.length) {
      art.append(el("h4", "확인 불가"));
      const u = el("ul");
      unv.forEach((t) => u.append(el("li", ids2names(t, s))));
      art.append(u);
    }
    art.append(el("h4", "AI 해석 (사실이 아닌 추론)"), el("p", s.interpretation.replace(/^해석:\s*/, ""), { class: "interp" }));
    if (s.economy_impact) art.append(el("h4", "경제·산업 영향 (AI 해석)"), el("p", s.economy_impact));
    if (s.follow_up) art.append(el("h4", "더 볼 것"), el("p", s.follow_up));
    if ((s.sources_removed || []).length) art.append(el("p", `근거가 확인되지 않아 이 이야기에서 뺀 기사: ${s.sources_removed.join(" / ")}`, { class: "meta" }));
    const det = el("details");
    det.append(el("summary", `출처 ${s.sources.length}건`));
    const src = el("ul");
    s.sources.forEach((x) => src.append(sourceLink(x)));
    det.append(src);
    art.append(det);
    box.append(art);
  }
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
  if (!by.size) { box.append(el("p", "오늘 뉴스 가운데 내 종목과 직접 이어지는 것이 없습니다.", { class: "meta" })); return; }
  for (const [stock, items] of by) {
    const blk = el("div", null, { class: "stock-block" });
    blk.append(el("h3", stock));
    for (const x of items) {
      const p = el("div", null, { class: "item" });
      p.append(el("div", `${x.story.priority}. ${x.story.headline}`, { class: "meta" }),
        el("p", STANCE[x.stance] || x.stance, { class: "stance" }), el("p", x.reason));
      if (x.to_verify) p.append(el("p", `판단하려면 확인할 것 — ${x.to_verify}`));
      blk.append(p);
    }
    box.append(blk);
  }
}

function renderNotAired() {
  const box = $("#not-aired");
  box.replaceChildren();
  for (const g of Object.values(B.not_aired)) {
    const sec = el("details");
    sec.append(el("summary", `${g.label} (${g.items.length})`));
    if (!g.items.length) sec.append(el("p", g.none_reason ? `없음 — ${g.none_reason}` : "오늘은 없습니다.", { class: "meta" }));
    for (const it of g.items) {
      const d = el("div", null, { class: "item" });
      if (it.what_happened) { // 탐색 가설: 다섯 칸
        d.append(el("strong", it.title));
        for (const [k, v] of [["무슨 일", it.what_happened], ["수요 근거", it.demand_basis], ["구체 근거", it.hard_evidence], ["사실과 추론", it.fact_vs_inference], ["더 조사할 것", it.to_research]]) {
          d.append(el("p", `${k}: ${v}`));
        }
        const s = el("ul"); it.sources.forEach((x) => s.append(sourceLink(x))); d.append(s);
      } else {
        d.append(el("a", it.title, { href: it.url, target: "_blank", rel: "noopener" }),
          el("div", `${it.source} · ${kst(it.published_at)} · 제외 이유: ${it.note || "-"}`, { class: "meta" }));
      }
      sec.append(d);
    }
    box.append(sec);
  }
}

function renderConcept() {
  const box = $("#concept");
  box.replaceChildren();
  const c = B.concept;
  if (!c) { box.append(el("p", "오늘은 뉴스와 직접 연결되는 800선 용어가 없습니다.", { class: "meta" })); return; }
  box.append(el("div", c.term, { class: "concept-term" }), el("blockquote", c.bok_quote),
    el("p", `출처: ${c.source}, ${c.book_page}쪽 (첫 문장 인용)`, { class: "meta" }),
    el("h4", "쉬운 설명 (AI가 위 정의를 바탕으로 정리)"), el("p", c.plain),
    el("h4", "오늘 뉴스에서는"), el("p", c.in_today_news),
    el("h4", "투자 분석에서는"), el("p", c.for_investing));
}

function renderQuiz() {
  const box = $("#quiz");
  box.replaceChildren();
  const q = B.quiz;
  if (!q) { box.append(el("p", "오늘은 퀴즈가 없습니다.", { class: "meta" })); return; }
  const form = el("form");
  form.append(el("p", q.question, { class: "quiz-q" }));
  q.choices.forEach((c, i) => {
    const lab = el("label", null, { class: "choice" });
    lab.append(el("input", null, { type: "radio", name: "quiz", value: String(i) }), `${i + 1}. ${c}`);
    form.append(lab);
  });
  const res = el("p", null, { class: "result" });
  const actions = el("div", null, { class: "form-actions" });
  actions.append(el("button", "정답 확인", { type: "submit" }));
  form.append(actions, res);
  form.onsubmit = (e) => {
    e.preventDefault();
    const v = form.querySelector("input[name=quiz]:checked");
    if (!v) { res.textContent = "답을 골라 주세요."; return; }
    const ok = Number(v.value) === q.answer;
    res.replaceChildren(el("span", ok ? "정답입니다. " : `정답은 ${q.answer + 1}번입니다. `, { class: "accent" }), q.explanation);
  };
  box.append(form, el("p", `근거: ${q.based_on}`, { class: "meta" }));
}

async function renderMemos() {
  const items = await api(`/api/memos?date=${B.date}`);
  const box = $("#memo-list");
  box.replaceChildren();
  for (const m of items) box.append(memoItem(m, renderMemos));
  if (!items.length) box.append(el("p", "이 날짜의 메모가 없습니다.", { class: "meta" }));
}

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
  const box = $("#ai-checks");
  box.replaceChildren();
  if (!B.ai_checks.length) { box.append(el("p", "오늘은 추천이 없습니다.", { class: "meta" })); return; }
  for (const c of B.ai_checks) {
    const d = el("div", null, { class: "item" });
    d.append(el("div", c.target, { class: "meta" }), el("p", c.task),
      el("p", `추천 이유: ${c.reason}`, { class: "meta" }), el("p", `확인 시점: ${c.when}`, { class: "meta" }));
    const s = el("ul"); c.sources.forEach((x) => s.append(sourceLink(x))); d.append(s);
    if (added.has(c.id)) d.append(el("p", "내 목록에 추가됨", { class: "accent" }));
    else {
      const b = el("button", "내 목록에 추가", { type: "button" });
      b.onclick = async () => {
        await api("/api/checks", { method: "POST", body: JSON.stringify({
          text: `${c.target}: ${c.task}`, origin: "ai", briefing_date: B.date,
          ai_ref: { id: c.id, target: c.target, reason: c.reason, when: c.when, sources: c.sources.map((x) => x.url) } }) });
        renderChecks(); refreshAiChecks();
      };
      d.append(b);
    }
    box.append(d);
  }
}

$("#memo-form").onsubmit = async (e) => {
  e.preventDefault();
  const t = $("#memo-text").value.trim();
  if (!t) return;
  await api("/api/memos", { method: "POST", body: JSON.stringify({ date: B.date, text: t }) });
  $("#memo-text").value = "";
  renderMemos();
};
$("#check-form").onsubmit = async (e) => {
  e.preventDefault();
  const t = $("#check-text").value.trim();
  if (!t) return;
  await api("/api/checks", { method: "POST", body: JSON.stringify({ text: t, origin: "user", briefing_date: B.date }) });
  $("#check-text").value = "";
  renderChecks();
};
$("#rate").onchange = () => { $("#player").playbackRate = Number($("#rate").value); };
$("#player").onloadedmetadata = () => {
  $("#player").playbackRate = Number($("#rate").value);
  if (isFinite($("#player").duration)) $("#b-duration").textContent = mmss($("#player").duration);
};

(async () => {
  await renderChrome("report");
  RUN_ID = decodeURIComponent(location.pathname.split("/").pop());
  const runs = await api("/api/briefings");
  const sel = $("#run-select");
  for (const r of runs) sel.append(el("option", `${r.date} · ${r.title.slice(0, 26)}`, { value: r.id }));
  sel.value = RUN_ID;
  sel.onchange = () => { location.href = reportUrl(sel.value); };
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
      " · ", el("a", "기록 목록", { href: "/records" }));
    n.hidden = false;
    if (!runs.some((r) => r.id === RUN_ID)) sel.prepend(el("option", `${B.date} · 개발·평가 기록 (${RUN_ID})`, { value: RUN_ID }));
    sel.value = RUN_ID;
  }
  $("#r-title").textContent = B.title;
  $("#r-meta").textContent = `${B.mode === "regular" ? "정규" : "테스트"} 브리핑 · 생성 ${kst(B.generated_at)} · 뉴스 수집 마감 ${kst(B.cutoff_at)} KST · ${B.profile_label}`;
  if (B.revision) { $("#r-revision").textContent = `수정 기록: ${B.revision.change}`; $("#r-revision").hidden = false; }
  $("#player").src = `/media/${encodeURIComponent(RUN_ID)}/briefing.mp3`;
  $("#b-duration").textContent = mmss(B.audio.seconds);
  renderChecksLine();
  renderStories(); renderHoldings(); renderNotAired(); renderConcept(); renderQuiz();
  renderMemos(); renderChecks(); refreshAiChecks();
})();
