// 투자 프로필 입력 양식 (마이페이지와 최초 설정 화면이 같이 쓴다). 저장은 기존 /api/profile PUT을 그대로 쓴다.
// 핵심은 '무엇을 보유했는가'보다 '왜 투자했고 무엇을 기대·우려하는가'를 AI가 이해하게 하는 것이다.
const csv = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

function field(label, input, hint) {
  const l = el("label", null, { class: "field" });
  l.append(el("span", label), input);
  if (hint) l.append(el("div", hint, { class: "hint" }));
  return l;
}

function stockFieldset(s = {}, n = 1) {
  const fs = el("fieldset", null, { class: "stock" });
  const legend = el("legend", s.name || `종목 ${n}`);
  const name = el("input", null, { name: "name", required: "", autocomplete: "off" }); name.value = s.name || "";
  name.oninput = () => { legend.textContent = name.value || `종목 ${n}`; };
  const ticker = el("input", null, { name: "ticker", inputmode: "numeric", autocomplete: "off" }); ticker.value = s.ticker || "";
  const status = el("select", null, { name: "status" });
  status.append(el("option", "보유", { value: "held" }), el("option", "관심 (보유하지 않음)", { value: "watchlist" }));
  status.value = s.status === "held" ? "held" : "watchlist";
  const thesis = el("textarea", null, { name: "thesis", rows: "4", placeholder: "예: 이 회사의 어떤 사업이 왜 성장할 거라고 보는지, 무엇을 기대하는지" });
  thesis.value = s.thesis || "";
  const kw = el("input", null, { name: "keywords" }); kw.value = (s.keywords || []).join(", ");
  const risks = el("input", null, { name: "risks" }); risks.value = (s.risks || []).join(", ");
  const ask = el("textarea", null, { name: "ask_ai", rows: "2", placeholder: "예: 이 회사와 관련된 뉴스가 나오면 매출 비중이 실제로 얼마나 되는지 꼭 확인해 줘" });
  ask.value = s.ask_ai || "";
  const row = el("div", null, { class: "row" });
  row.append(field("기업명", name), field("종목 코드", ticker), field("구분", status));
  const remove = el("button", "이 종목 빼기", { type: "button", class: "text" });
  remove.onclick = () => fs.remove();
  fs.append(legend, row,
    field("투자 또는 관심 이유", thesis, "왜 샀는지, 무엇을 기대하는지. AI가 오늘 뉴스를 이 이유에 비추어 해석합니다."),
    field("관련 키워드 (쉼표로 구분)", kw, "제품·사업·고객사·정책 이름 등"),
    field("주요 위험 요인 (쉼표로 구분)", risks, "이 투자에서 걱정하는 것. 관련 뉴스가 나오면 따로 짚습니다."),
    field("AI에게 특히 확인받고 싶은 내용", ask),
    remove);
  fs.dataset.extra = JSON.stringify({ market: s.market, sector: s.sector, aliases: s.aliases, known_relations: s.known_relations });
  return fs;
}

// container 안에 양식을 그린다. 저장하면 onSaved(profile)를 부른다.
async function mountProfileForm(container, { submitLabel = "프로필 저장", requireStock = false, onSaved } = {}) {
  const p = await api("/api/profile");
  const form = el("form", null, { novalidate: "" });
  const ind = el("input", null, { name: "industries" }); ind.value = (p.interest_industries || []).join(", ");
  const macro = el("input", null, { name: "macro" }); macro.value = (p.macro_topics || []).join(", ");
  const stocks = el("div");
  (p.stocks || []).forEach((s, i) => stocks.append(stockFieldset(s, i + 1)));
  if (requireStock && !stocks.children.length) stocks.append(stockFieldset({}, 1));
  const add = el("button", "종목 추가", { type: "button" });
  add.onclick = () => { const f = stockFieldset({}, stocks.children.length + 1); stocks.append(f); f.querySelector("[name=name]").focus(); };
  const msg = el("span", p.updated_at ? `마지막 저장 ${kst(p.updated_at)}` : "", { class: "meta", role: "status" });
  const actions = el("div", null, { class: "form-actions" });
  actions.append(add, el("button", submitLabel, { type: "submit" }), msg);
  const h = (n, t) => { const x = el("h2", null, { class: "pf-h" }); x.append(el("span", n, { class: "sec-n" }), t); return x; };
  const interests = el("div", null, { class: "pf-interests" });
  interests.append(field("관심 산업 (쉼표로 구분)", ind), field("거시경제 관심사 (쉼표로 구분)", macro, "예: 금리, 환율, 미국 물가"));
  form.append(h("01", "관심 영역"), interests, h("02", "보유 종목 · 관심 종목"), stocks, actions);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const list = $$(".stock", stocks).map((f) => ({
      ...JSON.parse(f.dataset.extra || "{}"),
      name: $("[name=name]", f).value.trim(), ticker: $("[name=ticker]", f).value.trim(),
      status: $("[name=status]", f).value, thesis: $("[name=thesis]", f).value.trim(),
      keywords: csv($("[name=keywords]", f).value), risks: csv($("[name=risks]", f).value), ask_ai: $("[name=ask_ai]", f).value.trim(),
    })).filter((s) => s.name);
    if (requireStock && !list.length) { msg.textContent = "보유 종목이나 관심 종목을 하나 이상 적어 주세요."; return; }
    const noReason = list.filter((s) => !s.thesis).map((s) => s.name);
    if (requireStock && noReason.length) { msg.textContent = `투자 또는 관심 이유를 적어 주세요: ${noReason.join(", ")}`; return; }
    const saved = await api("/api/profile", { method: "PUT", body: JSON.stringify({ interest_industries: csv(ind.value), macro_topics: csv(macro.value), stocks: list }) });
    msg.textContent = "저장했습니다. 다음 브리핑 생성부터 반영됩니다.";
    if (onSaved) onSaved(saved);
  };
  container.replaceChildren(form);
}

// ---------------------------------------------------------------------------
// 내 투자 프로필 화면: 종목은 한 줄 목록으로 접어 두고, 눌러서 펼쳐 수정한다.
// 접고 펼치거나 필터를 바꿔도 입력 내용은 그대로 남는다(화면에서 숨기기만 한다).
// 삭제는 저장하기 전까지 되돌릴 수 있고, 변경이 있을 때만 아래에 저장 영역이 나타난다.
// 저장 형식은 기존 /api/profile PUT과 같다.
// ---------------------------------------------------------------------------
function stockRow(s, onChange, ctx = { others: () => [] }) {
  const sk = el("div", null, { class: "sk" });
  const extra = { sector: s.sector, aliases: s.aliases, known_relations: s.known_relations };
  let picked = (s.market || s.country) ? { name: s.name || "", code: s.ticker || "" } : null;  // 상장 정보가 어느 이름·코드에 대한 것인지
  let market = s.market || "", country = s.country || "";  // 상장 시장과 그 국가 (본사 소재지가 아니다). 목록에서 고르면 채워진다
  const name = el("input", null, { name: "name", autocomplete: "off" }); name.value = s.name || "";
  const ticker = el("input", null, { name: "ticker", autocomplete: "off", spellcheck: "false" }); ticker.value = s.ticker || "";
  const status = el("select", null, { name: "status" });
  status.append(el("option", "보유", { value: "held" }), el("option", "관심 (보유하지 않음)", { value: "watchlist" }));
  status.value = s.status === "held" ? "held" : "watchlist";
  const thesis = el("textarea", null, { name: "thesis", rows: "4", placeholder: "예: 이 회사의 어떤 사업이 왜 성장할 거라고 보는지, 무엇을 기대하는지" }); thesis.value = s.thesis || "";
  const kw = el("input", null, { name: "keywords" }); kw.value = (s.keywords || []).join(", ");
  const risks = el("input", null, { name: "risks" }); risks.value = (s.risks || []).join(", ");
  const ask = el("textarea", null, { name: "ask_ai", rows: "2", placeholder: "예: 이 회사와 관련된 뉴스가 나오면 매출 비중이 실제로 얼마나 되는지 꼭 확인해 줘" }); ask.value = s.ask_ai || "";
  const focusBox = el("input", null, { type: "checkbox", name: "focus" }); focusBox.checked = s.focus === true;
  const listing = el("div", null, { class: "sk-listing" });
  const usNote = el("div", "미국 종목은 등록할 수 있지만, 지금은 기존 뉴스 수집 범위 안에서만 분석합니다. 미국 종목 전용 뉴스 수집과 SEC 공시 연동은 아직 지원하지 않습니다.", { class: "sk-us-note", hidden: "" });

  // 한 줄 머리: 종목명(+작은 회색 코드) · 보유/관심 · 투자 이유 요약
  const head = el("button", null, { type: "button", class: "sk-head", "aria-expanded": "false" });
  const idBox = el("span", null, { class: "sk-id" });
  const nameEl = el("span", null, { class: "sk-name" }), codeEl = el("span", null, { class: "sk-code" });
  const focusMark = el("span", "집중 분석", { class: "sk-focus-mark" });
  const nameLine = el("span", null, { class: "sk-nameline" });
  nameLine.append(nameEl, focusMark);
  idBox.append(nameLine, codeEl);
  const badge = el("span", null, { class: "sk-badge" }), sum = el("span", null, { class: "sk-sum" });
  head.append(idBox, badge, sum, el("span", null, { class: "sk-chev", "aria-hidden": "true" }));
  const refresh = () => {
    nameEl.textContent = name.value.trim() || "새 종목";
    codeEl.textContent = [ticker.value.trim(), market].filter(Boolean).join(" · ");
    listing.textContent = country || market ? `상장: ${[COUNTRY_LABEL[country] || country, market].filter(Boolean).join(" · ")}` : "";
    usNote.hidden = country !== "US";
    const held = status.value === "held";
    badge.textContent = held ? "보유" : "관심"; badge.className = `sk-badge ${held ? "held" : "watch"}`;
    const t = thesis.value.trim();
    sum.textContent = t || "투자 이유를 적어 주세요."; sum.classList.toggle("empty", !t);
    focusMark.hidden = !focusBox.checked;
  };

  // 펼친 모습
  const detail = el("div", null, { class: "sk-detail", hidden: "" });
  const row = el("div", null, { class: "row" });
  const nameField = field("기업명", name);
  nameField.classList.add("has-suggest");
  const suggest = el("div", null, { class: "sk-suggest", hidden: "", role: "listbox" });
  nameField.append(suggest);
  row.append(nameField, field("종목 코드 · 티커", ticker), field("구분", status));
  const focusRow = el("label", null, { class: "sk-focus" });
  focusRow.append(focusBox, el("span", "집중 분석", { class: "sk-focus-name" }),
    el("span", "투자 이유와 위험 요인에 비추어 관련 뉴스를 더 깊게 분석받습니다. 관련 뉴스가 없는 날은 만들지 않고, 다른 종목의 중요한 뉴스는 그대로 다룹니다.", { class: "sk-focus-hint" }));
  const more = el("div", null, { class: "sk-more" });
  const moreBtn = el("button", "추가 요청사항", { type: "button", class: "sk-more-toggle", "aria-expanded": "false" });
  const moreBody = el("div", null, { class: "sk-more-body", hidden: "" });
  moreBody.append(field("AI에게 특히 확인받고 싶은 내용 (선택)", ask, "필요할 때만 적어 주세요. 적은 내용은 브리핑을 만들 때 그대로 반영됩니다."));
  const setMore = (on) => { moreBtn.setAttribute("aria-expanded", String(on)); moreBody.hidden = !on; };
  moreBtn.onclick = () => setMore(moreBody.hidden);
  setMore(!!ask.value.trim());  // 이미 적은 내용이 있으면 펼쳐서 보여 준다
  more.append(moreBtn, moreBody);
  const drop = el("button", "이 종목 빼기", { type: "button", class: "text sk-remove" });
  detail.append(row, listing, usNote, focusRow,
    field("투자 또는 관심 이유", thesis, "왜 샀는지, 무엇을 기대하는지. AI가 오늘 뉴스를 이 이유에 비추어 해석합니다."),
    field("관련 키워드 (쉼표로 구분)", kw, "제품·사업·고객사·정책 이름 등"),
    field("주요 위험 요인 (쉼표로 구분)", risks, "이 투자에서 걱정하는 것. 관련 뉴스가 나오면 따로 짚습니다."),
    more, drop);

  // 뺀 종목: 저장하기 전까지 되돌릴 수 있다
  const gone = el("div", null, { class: "sk-gone" });
  const goneText = el("span"), undo = el("button", "되돌리기", { type: "button", class: "mini" });
  gone.append(goneText, undo);

  const setOpen = (on) => { head.setAttribute("aria-expanded", String(on)); detail.hidden = !on; sk.classList.toggle("open", on); };
  head.onclick = () => setOpen(detail.hidden);
  drop.onclick = () => {
    const n = name.value.trim();
    if (!n) { sk.classList.add("discarded"); sk.hidden = true; onChange(); return; }  // 아직 이름도 없는 새 칸은 바로 치운다
    if (!confirm(`'${n}' 종목을 목록에서 뺄까요?\n프로필을 저장하기 전에는 되돌릴 수 있습니다.`)) return;
    goneText.textContent = `${n} · 목록에서 뺐습니다. 저장하면 반영됩니다.`;
    setOpen(false); sk.classList.add("removed"); onChange();
  };
  undo.onclick = () => { sk.classList.remove("removed"); onChange(); };
  for (const x of [name, ticker, status, thesis, focusBox]) { x.addEventListener("input", refresh); x.addEventListener("change", refresh); }
  // 기업명 검색: 로컬 종목 목록에서 찾는다. 목록에 없으면 그대로 직접 입력한다.
  let timer = null, results = [], active = -1;
  const closeSuggest = () => { suggest.hidden = true; active = -1; };
  const dupOf = (r) => ctx.others(sk).find((o) => { const d = o.api.data(); return d.ticker && d.ticker.toUpperCase() === r.code.toUpperCase() && (!d.country || d.country === r.country); });
  const pick = (r) => {
    const dup = dupOf(r);
    if (dup) {  // 이미 등록한 종목은 새로 만들지 않고 그 종목을 보여 준다
      closeSuggest(); notice.textContent = `이미 등록된 종목입니다: ${dup.api.data().name}`; notice.hidden = false;
      dup.api.open(true); dup.scrollIntoView({ behavior: "smooth", block: "center" }); return;
    }
    name.value = r.name; ticker.value = r.code; market = r.market; country = r.country; picked = { name: r.name, code: r.code };
    notice.hidden = true; closeSuggest(); refresh(); onChange();
  };
  const notice = el("div", null, { class: "sk-notice", hidden: "" });
  nameField.append(notice);
  const draw = (data) => {
    suggest.replaceChildren();
    for (const [i, r] of results.entries()) {
      const b = el("button", null, { type: "button", role: "option", class: "sg" });
      b.append(el("span", r.name, { class: "sg-name" }), el("span", [r.code, r.market, r.country_label].join(" · "), { class: "sg-meta" }));
      if (r.alias) b.append(el("span", r.alias, { class: "sg-alias" }));
      b.onmousedown = (e) => { e.preventDefault(); pick(r); };
      suggest.append(b);
    }
    const foot = !data.available ? "종목 목록을 아직 내려받지 않았습니다. 직접 입력해 주세요."
      : results.length ? "목록에 없으면 그대로 직접 입력하세요." : "검색 결과가 없습니다. 그대로 직접 입력하세요.";
    suggest.append(el("div", foot, { class: "sg-foot" }));
    suggest.hidden = false; active = -1;
  };
  const query = async () => {
    const q = name.value.trim();
    if (!q) { closeSuggest(); return; }
    try { const d = await api(`/api/symbols?q=${encodeURIComponent(q)}`); results = d.results; draw(d); } catch { closeSuggest(); }
  };
  const staleListing = () => {  // 이름·코드를 직접 고치면 앞서 채운 상장 정보는 더 이상 확실하지 않으니 비운다
    if (picked && (name.value.trim() !== picked.name || ticker.value.trim() !== picked.code)) { picked = null; market = ""; country = ""; refresh(); }
  };
  ticker.addEventListener("input", staleListing);
  name.addEventListener("input", () => { staleListing(); notice.hidden = true; clearTimeout(timer); timer = setTimeout(query, 180); });
  name.addEventListener("blur", () => setTimeout(closeSuggest, 120));
  name.addEventListener("keydown", (e) => {
    const items = [...suggest.querySelectorAll(".sg")];
    if (suggest.hidden || !items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle("on", i === active)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") closeSuggest();
  });
  refresh();
  sk.append(head, detail, gone);
  sk.api = {
    removed: () => sk.classList.contains("removed") || sk.classList.contains("discarded"),
    status: () => status.value, open: setOpen, focusName: () => name.focus(),
    data: () => ({ ...extra, name: name.value.trim(), ticker: ticker.value.trim(), status: status.value, thesis: thesis.value.trim(),
      keywords: csv(kw.value), risks: csv(risks.value), ask_ai: ask.value.trim(), focus: focusBox.checked, market, country }),
  };
  return sk;
}

const COUNTRY_LABEL = { KR: "한국", US: "미국" };
let pfDirty = () => false;
window.addEventListener("beforeunload", (e) => { if (pfDirty()) { e.preventDefault(); e.returnValue = ""; } });

async function mountProfileList(container) {
  const p = await api("/api/profile");
  const form = el("form", null, { novalidate: "", class: "pf" });
  const ind = el("input", null, { name: "industries" }); ind.value = (p.interest_industries || []).join(", ");
  const macro = el("input", null, { name: "macro" }); macro.value = (p.macro_topics || []).join(", ");
  const h = (n, t) => { const x = el("h2", null, { class: "pf-h" }); x.append(el("span", n, { class: "sec-n" }), t); return x; };
  const interests = el("div", null, { class: "pf-interests" });
  interests.append(field("관심 산업 (쉼표로 구분)", ind), field("거시경제 관심사 (쉼표로 구분)", macro, "예: 금리, 환율, 미국 물가"));

  const list = el("div", null, { class: "sk-list" });
  const tabs = el("div", null, { class: "sk-tabs", role: "tablist" });
  const empty = el("p", "해당하는 종목이 없습니다.", { class: "sk-empty", hidden: "" });
  let filter = "all";
  const rows = () => $$(".sk", list);
  const live = () => rows().filter((r) => !r.api.removed());
  const collect = () => ({
    interest_industries: csv(ind.value), macro_topics: csv(macro.value),
    stocks: live().map((r) => r.api.data()).filter((s) => s.name),
  });
  let snapshot = JSON.stringify(collect());
  const isDirty = () => JSON.stringify(collect()) !== snapshot;
  pfDirty = isDirty;

  // 저장 영역: 변경이 있을 때만 화면 아래에 붙어 나타난다
  const bar = el("div", null, { class: "pf-bar", hidden: "", role: "status", "aria-live": "polite" });
  const barMsg = el("span", null, { class: "pf-msg" });
  const revert = el("button", "변경 취소", { type: "button", class: "text" });
  const save = el("button", "프로필 저장", { type: "submit" });
  bar.append(barMsg, revert, save);
  let hideTimer = null;
  const showBar = (kind, text) => { clearTimeout(hideTimer); bar.hidden = false; bar.dataset.kind = kind; barMsg.textContent = text; revert.hidden = kind !== "dirty" && kind !== "err"; save.hidden = kind === "ok"; save.disabled = kind === "saving"; };
  const sync = () => {
    renderTabs();
    if (isDirty()) showBar("dirty", "저장하지 않은 변경 사항이 있습니다.");
    else if (bar.dataset.kind === "dirty" || bar.dataset.kind === "err") bar.hidden = true;
  };

  function renderTabs() {
    const all = live(), held = all.filter((r) => r.api.status() === "held").length;
    const defs = [["all", "전체", all.length], ["held", "보유", held], ["watch", "관심", all.length - held]];
    tabs.replaceChildren();
    for (const [k, label, n] of defs) {
      const b = el("button", null, { type: "button", role: "tab", "aria-selected": String(filter === k), class: "sk-tab" });
      b.append(label, el("span", String(n), { class: "n" }));
      b.onclick = () => { filter = k; renderTabs(); };
      tabs.append(b);
    }
    // 필터는 보이기만 바꾼다. 입력 내용은 지우지 않는다
    let shown = 0;
    for (const r of rows()) {
      if (r.classList.contains("discarded")) continue;
      const st = r.api.status();
      const ok = filter === "all" || (filter === "held" ? st === "held" : st !== "held");
      r.hidden = !ok; if (ok) shown++;
    }
    empty.hidden = shown !== 0;
  }

  const addRow = (s, open) => { const r = stockRow(s, sync, { others: (self) => live().filter((x) => x !== self) }); list.append(r); if (open) r.api.open(true); return r; };
  (p.stocks || []).forEach((s) => addRow(s));
  snapshot = JSON.stringify(collect());  // 처음 불러온 상태가 기준. 이와 다를 때만 변경으로 본다
  const add = el("button", "종목 추가", { type: "button", class: "sk-add" });
  add.onclick = () => {
    if (live().length >= 30) { showBar("err", "종목은 30개까지 등록할 수 있습니다."); return; }
    filter = "all";
    const r = addRow({}, true); sync(); r.scrollIntoView({ behavior: "smooth", block: "center" }); r.api.focusName();
  };
  const lastSaved = el("p", p.updated_at ? `마지막 저장 ${kst(p.updated_at)}` : "", { class: "meta pf-last" });

  form.addEventListener("input", sync); form.addEventListener("change", sync);
  revert.onclick = () => { if (confirm("저장하지 않은 변경 사항을 모두 취소할까요?")) mountProfileList(container); };
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!isDirty()) return;
    const seen = new Map();
    for (const st of collect().stocks) {  // 같은 국가의 같은 코드는 한 번만
      if (!st.ticker) continue;
      const k = `${st.country || ""}:${st.ticker.toUpperCase()}`;
      if (seen.has(k)) { showBar("err", `같은 종목이 두 번 등록되어 있습니다: ${st.name} (${st.ticker}). 하나를 빼고 다시 저장해 주세요.`); return; }
      seen.set(k, true);
    }
    showBar("saving", "저장 중…");
    try {
      const saved = await api("/api/profile", { method: "PUT", body: JSON.stringify(collect()) });
      for (const r of rows()) if (r.api.removed() || !r.api.data().name) r.remove();  // 저장된 뒤에는 뺀 종목을 화면에서도 정리
      snapshot = JSON.stringify(collect());
      lastSaved.textContent = `마지막 저장 ${kst(saved.updated_at)}`;
      renderTabs();
      showBar("ok", "저장했습니다. 다음 브리핑 생성부터 반영됩니다.");
      hideTimer = setTimeout(() => { if (!isDirty()) bar.hidden = true; }, 5000);
    } catch {
      showBar("err", "저장하지 못했습니다. 연결을 확인하고 다시 눌러 주세요. 입력한 내용은 그대로 남아 있습니다.");
    }
  };

  const addrow = el("div", null, { class: "sk-addrow" });
  addrow.append(add);
  form.append(h("01", "관심 영역"), interests, h("02", "보유 종목 · 관심 종목"), tabs, list, empty, addrow, lastSaved, bar);
  renderTabs();
  container.replaceChildren(form);
}
