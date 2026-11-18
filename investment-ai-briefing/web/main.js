// 메인 화면: 최신 보고서, 프로필 요약, 지난 브리핑, 아직 점검하지 않은 항목
(async () => {
  const meta = await renderChrome("main");
  $("#today").textContent = `오늘 ${longDate(meta.today)}`;

  const [profile, runs, checks] = await Promise.all([api("/api/profile"), api("/api/briefings"), api("/api/checks")]);

  // 처음 쓰는 사용자: 프로필에 종목이 없으면 최초 설정 화면으로
  if (!(profile.stocks || []).length) { location.replace("/onboarding"); return; }

  // ③ 가장 최근 발행된 보고서
  const latest = runs[0];
  if (latest) {
    $("#latest-when").textContent = `${longDate(latest.date)} 발행`;
    { // 제목을 "날짜 브리핑"과 핵심 뉴스 제목 두 줄로 나눠 보인다 (글자 내용은 그대로)
      const t = $("#latest-title"), i = latest.title.indexOf(": ");
      if (i > 0) { const d = document.createElement("span"); d.className = "t-day"; d.textContent = latest.title.slice(0, i);
        const h = document.createElement("span"); h.className = "t-head"; h.textContent = latest.title.slice(i + 2); t.replaceChildren(d, h); }
      else t.textContent = latest.title;
    }
    const ol = $("#latest-headlines");
    latest.headlines.forEach((h) => ol.append(el("li", h)));
    $("#latest-summary").textContent = [
      `핵심 뉴스 ${latest.n_stories}건`,
      latest.holdings.length ? `관련 종목 ${latest.holdings.join(", ")}` : "",
      `오디오 ${mmss(latest.seconds)}`,
    ].filter(Boolean).join(" · ");
    const go = $("#latest-go");
    go.href = reportUrl(latest.id);
    { const au = $("#latest-audio"); au.src = `/media/${encodeURIComponent(latest.id)}/briefing.mp3`; au.hidden = false; }  // 메인에서 바로 듣기
    go.hidden = false;
  } else {
    $("#latest-title").textContent = "아직 발행된 보고서가 없습니다.";
    $("#latest-summary").textContent = "승인된 보고서가 아직 없습니다. 매일 07:35 정규 실행이 승인 관문을 통과하면 여기에 발행됩니다.";
  }

  // ④ 프로필 요약: 종목 이름과 관심 산업만. 투자 이유·위험은 편집 화면에서
  const kv = $("#profile-kv");
  const held = profile.stocks.filter((s) => s.status === "held").map((s) => s.name);
  const watch = profile.stocks.filter((s) => s.status !== "held").map((s) => s.name);
  for (const [k, v] of [["보유 종목", held], ["관심 종목", watch], ["관심 산업", profile.interest_industries || []]]) {
    kv.append(el("dt", k), el("dd", v.length ? v.join(", ") : "없음"));
  }

  // ⑤ 지난 브리핑: 날짜마다 승인판 하나만 (테스트·이전 판은 /records의 개발·평가 기록)
  const list = $("#archive-list");
  if (!runs.length) list.append(el("p", "발행된 보고서가 없습니다.", { class: "meta" }));
  for (const r of runs) {
    const row = el("div", null, { class: "list-row" });
    const body = el("div", null, { class: "body" });
    body.append(el("a", r.title, { href: reportUrl(r.id) }));
    row.append(el("div", longDate(r.date).replace(/^\d+년 /, ""), { class: "date" }), body, el("div", mmss(r.seconds), { class: "side num" }));
    list.append(row);
  }

  // ⑥ 아직 점검하지 않은 항목: 중요 표시한 것 먼저, 그다음 오래된 것부터 3개
  const open = checks.filter((c) => !c.done)
    .sort((a, b) => (b.important === true) - (a.important === true) || a.created_at.localeCompare(b.created_at));
  $("#open-count").textContent = open.length;
  $("#open-count").classList.add("motion-number"); // 숫자에만 짧은 모션 (동작 줄이기 설정이면 없음)
  const ol = $("#open-list");
  if (!open.length) ol.append(el("p", "남은 항목이 없습니다.", { class: "meta" }));
  for (const c of open.slice(0, 3)) {
    const it = el("div", null, { class: "item" });
    const t = el("div", c.text, { class: "text" });
    if (c.important) t.append(el("span", "중요", { class: "mark" }));
    it.append(t, el("div", `${c.origin === "ai" ? "AI 추천에서 추가" : "직접 작성"} · ${c.briefing_date || kst(c.created_at).slice(0, 10)}`, { class: "meta" }));
    ol.append(it);
  }
})();
