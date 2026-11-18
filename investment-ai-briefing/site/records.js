// 개발·평가 기록: 승인판이 아닌 실행. 승인 관문을 통과하지 못한 이유도 함께 보여 준다
(async () => {
  await renderChrome("records");
  const recs = await api("/api/records");
  const box = $("#record-list");
  if (!recs.length) { box.append(el("p", "보존된 기록이 없습니다.", { class: "meta" })); return; }
  for (const r of recs) {
    const d = el("div", null, { class: "item" });
    d.append(el("div", `${longDate(r.date)} · ${r.mode === "regular" ? "정규 실행" : "테스트 실행"} · ${r.id}`, { class: "meta" }),
      el("a", r.title, { href: reportUrl(r.id) }),
      el("div", `생성 ${kst(r.published_at)} · ${r.n_stories}개 이야기 · ${mmss(r.seconds)}`, { class: "meta" }));
    if (r.revision_note) d.append(el("p", `수정 기록: ${r.revision_note}`, { class: "meta" }));
    d.append(el("p", r.gate.length ? `승인 관문 미통과: ${r.gate.slice(0, 2).join(" / ")}${r.gate.length > 2 ? ` 외 ${r.gate.length - 2}건` : ""}`
      : "승인 관문 통과 · 승인 대기", { class: "meta" }));
    box.append(d);
  }
})();
