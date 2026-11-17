// 마이페이지: 프로필 편집, 날짜별 메모, 점검 목록(완료·미완료), 지난 브리핑
async function renderMemoAll() {
  const items = await api("/api/memos");
  const box = $("#memo-all");
  box.replaceChildren();
  if (!items.length) { box.append(el("p", "메모가 없습니다. 보고서 화면의 '오늘의 메모'에서 쓸 수 있습니다.", { class: "meta" })); return; }
  const byDate = new Map();
  for (const m of items) { if (!byDate.has(m.date)) byDate.set(m.date, []); byDate.get(m.date).push(m); }
  for (const [date, ms] of [...byDate].sort((a, b) => b[0].localeCompare(a[0]))) {
    box.append(el("h4", longDate(date)));
    ms.forEach((m) => box.append(memoItem(m, renderMemoAll)));
  }
}

async function renderCheckAll() {
  const items = await api("/api/checks");
  const open = $("#check-open"), done = $("#check-done");
  open.replaceChildren(); done.replaceChildren();
  const sorted = [...items].sort((a, b) => (b.important === true) - (a.important === true) || a.created_at.localeCompare(b.created_at));
  for (const c of sorted) (c.done ? done : open).append(checkItem(c, renderCheckAll));
  if (!open.children.length) open.append(el("p", "남은 항목이 없습니다.", { class: "meta" }));
  if (!done.children.length) done.append(el("p", "완료한 항목이 없습니다.", { class: "meta" }));
}

async function renderRuns() {
  const runs = await api("/api/briefings");
  const box = $("#run-list");
  if (!runs.length) { box.append(el("p", "발행된 보고서가 없습니다.", { class: "meta" })); return; }
  for (const r of runs) {
    const row = el("div", null, { class: "list-row" });
    const body = el("div", null, { class: "body" });
    body.append(el("a", r.title, { href: reportUrl(r.id) }), el("div", `승인 ${kst(r.approved_at)}`, { class: "meta" }));
    row.append(el("div", longDate(r.date).replace(/^\d+년 /, ""), { class: "date" }), body, el("div", mmss(r.seconds), { class: "side num" }));
    box.append(row);
  }
}

$("#check-form").onsubmit = async (e) => {
  e.preventDefault();
  const t = $("#check-text").value.trim();
  if (!t) return;
  await api("/api/checks", { method: "POST", body: JSON.stringify({ text: t, origin: "user" }) });
  $("#check-text").value = "";
  renderCheckAll();
};

(async () => {
  await renderChrome(location.hash === "#account" ? "account" : location.hash === "#records" ? "records" : "profile");
  await Promise.all([mountProfileForm($("#profile-form")), renderMemoAll(), renderCheckAll(), renderRuns()]);
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
