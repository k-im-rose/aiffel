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
  form.append(field("관심 산업 (쉼표로 구분)", ind), field("거시경제 관심사 (쉼표로 구분)", macro, "예: 금리, 환율, 미국 물가"), stocks, actions);
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
