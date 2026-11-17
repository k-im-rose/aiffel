// 그내종 화면 로직. 서버 JSON API만 부른다 (배포 때 API 주소만 바꾸면 재사용).
const $ = (s) => document.querySelector(s);
const api = async (path, opt = {}) => {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opt });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || r.status);
  return d;
};
const el = (tag, text, attrs = {}) => {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const mmss = (s) => (s == null ? "-" : `${Math.floor(s / 60)}분 ${String(Math.round(s % 60)).padStart(2, "0")}초`);
const kst = (iso) => (iso ? iso.replace("T", " ").slice(0, 16) : "");
const STANCE = { strengthens: "투자 이유 강화 쪽", risk: "위험 요인 쪽", unclear: "아직 판단하기 어려움" };
let B = null; // 지금 보는 브리핑

function sourceLink(s) {
  const a = el("a", `${s.source} · ${s.title_ko || s.title}`, { href: s.url, target: "_blank", rel: "noopener" });
  const li = el("li");
  li.append(a, ` (${kst(s.published_at)})`);
  if (s.lang === "en") li.append(" [해외 원문]");
  return li;
}

// 내부 기사 id(n-/s-/f-…)가 문장에 섞여 있으면 언론사 이름으로 바꿔 보여 준다
function ids2names(text, story) {
  const by = Object.fromEntries(story.sources.map((x) => [x.id, x.source]));
  return text.replace(/\b[nsfd]-[0-9a-f]{10}\b/g, (m) => (by[m] ? `${by[m]} 기사` : "해당 기사"));
}

function renderStories() {
  const box = $("#stories");
  box.replaceChildren();
  for (const s of B.stories) {
    const art = el("article");
    art.append(el("h3", `${s.priority}. ${s.headline}`), el("p", `분야: ${s.section}`));
    // 원문 대조로 확인한 사실이 있으면 그것만 보여 준다 (요약 기반 사실과 겹치므로)
    const orig = s.facts.filter((f) => f.from_original);
    const facts = orig.length ? orig : s.facts;
    art.append(el("h4", orig.length ? "확인된 사실 (원문 대조)" : "확인된 사실 (기사 요약 기준)"));
    const ul = el("ul");
    for (const f of facts) ul.append(el("li", ids2names(f.text, s)));
    art.append(ul);
    if (s.same_event === "yes" && s.sources.length > 1) art.append(el("p", "여러 매체의 보도를 원문으로 대조해 같은 사건으로 묶었습니다."));
    art.append(el("h4", "AI 해석 (사실이 아닌 추론)"));
    art.append(el("p", s.interpretation));
    if (s.economy_impact) art.append(el("p", `경제·산업 영향: ${s.economy_impact}`));
    if (s.thesis_impact.length) {
      art.append(el("h4", "그래서 내 종목은? (AI 해석)"));
      const t = el("ul");
      for (const x of s.thesis_impact) {
        const li = el("li", `${x.stock} — ${STANCE[x.stance]}: ${x.reason}`);
        if (x.to_verify) li.append(el("br"), el("small", `판단하려면 확인할 것: ${x.to_verify}`));
        t.append(li);
      }
      art.append(t);
    }
    if (s.follow_up) art.append(el("p", `더 볼 것: ${s.follow_up}`));
    if (s.unverified.length) art.append(el("p", `확인되지 않은 부분: ${ids2names(s.unverified.join(" / "), s)}`));
    art.append(el("h4", "출처"));
    const src = el("ul");
    s.sources.forEach((x) => src.append(sourceLink(x)));
    art.append(src);
    box.append(art);
  }
}

function renderNotAired() {
  const box = $("#not-aired");
  box.replaceChildren();
  for (const g of Object.values(B.not_aired)) {
    const sec = el("details");
    sec.append(el("summary", `${g.label} (${g.items.length})`));
    if (!g.items.length) sec.append(el("p", g.none_reason ? `없음 — ${g.none_reason}` : "오늘은 없습니다."));
    const ul = el("ul");
    for (const it of g.items) {
      const li = el("li");
      if (it.what_happened) {
        // 탐색 가설: 다섯 칸
        li.append(el("strong", it.title), el("br"),
          `무슨 일: ${it.what_happened}`, el("br"), `수요 근거: ${it.demand_basis}`, el("br"),
          `구체 근거: ${it.hard_evidence}`, el("br"), `사실과 추론: ${it.fact_vs_inference}`, el("br"),
          `더 조사할 것: ${it.to_research}`);
        const s = el("ul"); it.sources.forEach((x) => s.append(sourceLink(x))); li.append(s);
      } else {
        li.append(el("a", it.title, { href: it.url, target: "_blank", rel: "noopener" }),
          ` — ${it.source}, ${kst(it.published_at)}`, el("br"), `제외 이유: ${it.note || "-"}`);
      }
      ul.append(li);
    }
    sec.append(ul);
    box.append(sec);
  }
}

function renderConcept() {
  const box = $("#concept");
  box.replaceChildren();
  const c = B.concept;
  if (!c) { box.append(el("p", "오늘은 뉴스와 직접 연결되는 800선 용어가 없습니다.")); return; }
  const q = el("blockquote", c.bok_quote);
  box.append(el("h3", c.term), q, el("p", `출처: ${c.source}, ${c.book_page}쪽 (첫 문장 인용)`),
    el("h4", "쉬운 설명 (AI가 위 정의를 바탕으로 정리)"), el("p", c.plain),
    el("h4", "오늘 뉴스에서는"), el("p", c.in_today_news),
    el("h4", "투자 분석에서는"), el("p", c.for_investing));
}

function renderQuiz() {
  const box = $("#quiz");
  box.replaceChildren();
  const q = B.quiz;
  if (!q) { box.append(el("p", "오늘은 퀴즈가 없습니다.")); return; }
  const form = el("form");
  form.append(el("p", q.question));
  q.choices.forEach((c, i) => {
    const lab = el("label");
    lab.append(el("input", null, { type: "radio", name: "quiz", value: String(i) }), ` ${i + 1}. ${c}`);
    form.append(lab, el("br"));
  });
  const btn = el("button", "정답 확인", { type: "submit" });
  const res = el("p");
  form.append(btn, res);
  form.onsubmit = (e) => {
    e.preventDefault();
    const v = form.querySelector("input[name=quiz]:checked");
    if (!v) { res.textContent = "답을 골라 주세요."; return; }
    const ok = Number(v.value) === q.answer;
    res.textContent = `${ok ? "정답입니다." : `정답은 ${q.answer + 1}번입니다.`} ${q.explanation}`;
  };
  box.append(form, el("p", `근거: ${q.based_on}`));
}

async function renderMemos() {
  const [mine, all] = await Promise.all([api(`/api/memos?date=${B.date}`), api("/api/memos")]);
  const draw = (ul, items, withDate) => {
    ul.replaceChildren();
    for (const m of items) {
      const li = el("li");
      const text = el("span", (withDate ? `[${m.date}] ` : "") + m.text);
      const edit = el("button", "수정", { type: "button" });
      const del = el("button", "삭제", { type: "button" });
      edit.onclick = async () => {
        const t = prompt("메모 수정", m.text);
        if (t && t.trim()) { await api(`/api/memos/${m.id}`, { method: "PUT", body: JSON.stringify({ text: t }) }); renderMemos(); }
      };
      del.onclick = async () => { if (confirm("이 메모를 삭제할까요?")) { await api(`/api/memos/${m.id}`, { method: "DELETE" }); renderMemos(); } };
      li.append(text, " ", edit, " ", del, el("br"), el("small", `작성 ${kst(m.created_at)}${m.updated_at !== m.created_at ? ` · 수정 ${kst(m.updated_at)}` : ""}`));
      ul.append(li);
    }
    if (!items.length) ul.append(el("li", "메모가 없습니다."));
  };
  draw($("#memo-list"), mine, false);
  draw($("#memo-all"), all, true);
}

async function renderChecks() {
  const items = await api("/api/checks");
  const open = $("#check-list"), done = $("#check-done");
  open.replaceChildren(); done.replaceChildren();
  for (const c of items) {
    const li = el("li");
    const box = el("input", null, { type: "checkbox" });
    box.checked = c.done;
    box.onchange = async () => { await api(`/api/checks/${c.id}`, { method: "PUT", body: JSON.stringify({ done: box.checked }) }); renderChecks(); };
    const edit = el("button", "수정", { type: "button" });
    edit.onclick = async () => {
      const t = prompt("점검 항목 수정", c.text);
      if (t && t.trim()) { await api(`/api/checks/${c.id}`, { method: "PUT", body: JSON.stringify({ text: t }) }); renderChecks(); }
    };
    const del = el("button", "삭제", { type: "button" });
    del.onclick = async () => { if (confirm("삭제할까요?")) { await api(`/api/checks/${c.id}`, { method: "DELETE" }); renderChecks(); refreshAiChecks(); } };
    li.append(box, ` ${c.text} `, el("small", `[${c.origin === "ai" ? "AI 추천에서 추가" : "직접 작성"} · ${kst(c.created_at)}${c.done_at ? ` · 완료 ${kst(c.done_at)}` : ""}]`), " ", edit, " ", del);
    if (c.ai_ref?.reason) li.append(el("br"), el("small", `추천 이유: ${c.ai_ref.reason}`));
    (c.done ? done : open).append(li);
  }
  if (!open.children.length) open.append(el("li", "남은 항목이 없습니다."));
}

async function refreshAiChecks() {
  const mine = await api("/api/checks");
  const added = new Set(mine.filter((c) => c.origin === "ai").map((c) => c.ai_ref?.id));
  const ul = $("#ai-checks");
  ul.replaceChildren();
  if (!B.ai_checks.length) { ul.append(el("li", "오늘은 추천이 없습니다.")); return; }
  for (const c of B.ai_checks) {
    const li = el("li");
    li.append(el("strong", `${c.target}: `), c.task, el("br"),
      el("small", `추천 이유: ${c.reason}`), el("br"), el("small", `확인 시점: ${c.when}`));
    const s = el("ul"); c.sources.forEach((x) => s.append(sourceLink(x))); li.append(s);
    if (added.has(c.id)) li.append(el("p", "내 목록에 추가됨"));
    else {
      const b = el("button", "내 목록에 추가", { type: "button" });
      b.onclick = async () => {
        await api("/api/checks", { method: "POST", body: JSON.stringify({
          text: `${c.target}: ${c.task}`, origin: "ai", briefing_date: B.date,
          ai_ref: { id: c.id, target: c.target, reason: c.reason, when: c.when, sources: c.sources.map((x) => x.url) } }) });
        renderChecks(); refreshAiChecks();
      };
      li.append(b);
    }
    ul.append(li);
  }
}

// ---- 프로필
const csv = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
function stockRow(s = {}) {
  const f = $("#stock-row").content.firstElementChild.cloneNode(true);
  f.querySelector("[name=name]").value = s.name || "";
  f.querySelector("[name=ticker]").value = s.ticker || "";
  f.querySelector("[name=status]").value = s.status === "held" ? "held" : "watchlist";
  f.querySelector("[name=thesis]").value = s.thesis || "";
  f.querySelector("[name=keywords]").value = (s.keywords || []).join(", ");
  f.querySelector("[name=risks]").value = (s.risks || []).join(", ");
  f.dataset.extra = JSON.stringify({ market: s.market, sector: s.sector, aliases: s.aliases, known_relations: s.known_relations });
  f.querySelector(".remove").onclick = () => f.remove();
  $("#p-stocks").append(f);
}
async function loadProfile() {
  const p = await api("/api/profile");
  $("#p-industries").value = (p.interest_industries || []).join(", ");
  $("#p-macro").value = (p.macro_topics || []).join(", ");
  $("#p-stocks").replaceChildren();
  (p.stocks || []).forEach(stockRow);
  if (p.updated_at) $("#p-status").textContent = `마지막 저장 ${kst(p.updated_at)}`;
}
$("#p-add").onclick = () => stockRow();
$("#profile-form").onsubmit = async (e) => {
  e.preventDefault();
  const stocks = [...document.querySelectorAll("#p-stocks .stock")].map((f) => ({
    ...JSON.parse(f.dataset.extra || "{}"),
    name: f.querySelector("[name=name]").value, ticker: f.querySelector("[name=ticker]").value,
    status: f.querySelector("[name=status]").value, thesis: f.querySelector("[name=thesis]").value,
    keywords: csv(f.querySelector("[name=keywords]").value), risks: csv(f.querySelector("[name=risks]").value),
  }));
  await api("/api/profile", { method: "PUT", body: JSON.stringify({
    interest_industries: csv($("#p-industries").value), macro_topics: csv($("#p-macro").value), stocks }) });
  $("#p-status").textContent = "저장했습니다. 다음 브리핑 생성부터 반영됩니다.";
};

// ---- 메모·점검 입력
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

async function openRun(id) {
  B = await api(`/api/briefings/${id}`);
  $("#b-title").textContent = B.title;
  $("#b-meta").textContent = `${B.mode === "regular" ? "정규" : "테스트"} 브리핑 · 생성 ${kst(B.generated_at)} · 뉴스 수집 마감 ${kst(B.cutoff_at)} KST · ${B.profile_label}`;
  $("#player").src = `/media/${id}/briefing.mp3`;
  $("#b-duration").textContent = mmss(B.audio.seconds);
  const fc = B.checks.fact_check || {};
  $("#b-checks").textContent = `사실 검증: 주장 ${fc.claims_checked ?? "-"}개 중 중대 오류 ${fc.critical_issues ?? "-"}건 · 중요 뉴스 ${B.checks.high_importance?.used ?? "-"}/${B.checks.high_importance?.total ?? "-"}건 반영`;
  $("#demo-notice").hidden = !B.is_demo;
  renderStories(); renderNotAired(); renderConcept(); renderQuiz();
  renderMemos(); renderChecks(); refreshAiChecks();
}

(async () => {
  const meta = await api("/api/meta");
  $("#today").textContent = `오늘 ${meta.today}`;
  $("#mode-label").textContent = meta.mode === "demo" ? "가상 데모 프로필" : "내 프로필";
  const runs = await api("/api/briefings");
  const sel = $("#run-select");
  for (const r of runs) sel.append(el("option", `${r.date} · ${r.title.slice(0, 30)}${r.mode === "test" ? " (테스트)" : ""}`, { value: r.id }));
  sel.onchange = () => openRun(sel.value);
  loadProfile();
  if (runs.length) openRun(runs[0].id);
  else $("#b-title").textContent = "아직 생성된 브리핑이 없습니다. 매일 07:35에 생성이 시작됩니다.";
})();
