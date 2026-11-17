// 그내종 공통 도우미: API 호출, 요소 만들기, 머리말(브랜드·메뉴)과 꼬리말. 모든 화면이 같이 쓴다.
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
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
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const longDate = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 ${WEEK[new Date(y, m - 1, d).getDay()]}요일`;
};
const reportUrl = (id) => `/report/${encodeURIComponent(id)}`;

function sourceLink(s) {
  const li = el("li");
  li.append(el("a", `${s.source} · ${s.title_ko || s.title}`, { href: s.url, target: "_blank", rel: "noopener" }),
    el("span", ` ${kst(s.published_at)}${s.lang === "en" ? " · 해외 원문" : ""}`, { class: "meta" }));
  return li;
}

// 메모 한 건: 수정·삭제 (보고서·마이페이지 공통)
function memoItem(m, refresh, withDate = false) {
  const d = el("div", null, { class: "item" });
  if (withDate) d.append(el("div", longDate(m.date), { class: "meta" }));
  d.append(el("p", m.text, { class: "text pre" }),
    el("div", `작성 ${kst(m.created_at)}${m.updated_at !== m.created_at ? ` · 수정 ${kst(m.updated_at)}` : ""}`, { class: "meta" }));
  const acts = el("div", null, { class: "actions" });
  const edit = el("button", "수정", { type: "button", class: "text" });
  const del = el("button", "삭제", { type: "button", class: "text" });
  edit.onclick = async () => {
    const t = prompt("메모 수정", m.text);
    if (t && t.trim()) { await api(`/api/memos/${m.id}`, { method: "PUT", body: JSON.stringify({ text: t }) }); refresh(); }
  };
  del.onclick = async () => { if (confirm("이 메모를 삭제할까요?")) { await api(`/api/memos/${m.id}`, { method: "DELETE" }); refresh(); } };
  acts.append(edit, del);
  d.append(acts);
  return d;
}

// 점검 항목 한 건: 완료 체크·중요 표시·수정·삭제 (보고서·마이페이지 공통)
function checkItem(c, refresh) {
  const d = el("div", null, { class: `item${c.done ? " done" : ""}` });
  const line = el("label", null, { class: "check-line" });
  const box = el("input", null, { type: "checkbox", "aria-label": "완료" });
  box.checked = c.done;
  box.onchange = async () => { await api(`/api/checks/${c.id}`, { method: "PUT", body: JSON.stringify({ done: box.checked }) }); refresh(); };
  const text = el("span", c.text, { class: "text" });
  if (c.important) text.append(el("span", "중요", { class: "mark" }));
  line.append(box, text);
  d.append(line, el("div", `${c.origin === "ai" ? "AI 추천에서 추가" : "직접 작성"} · ${kst(c.created_at)}${c.done_at ? ` · 완료 ${kst(c.done_at)}` : ""}`, { class: "meta" }));
  if (c.ai_ref?.reason) d.append(el("div", `추천 이유: ${c.ai_ref.reason}`, { class: "meta" }));
  const acts = el("div", null, { class: "actions" });
  const imp = el("button", c.important ? "중요 표시 해제" : "중요 표시", { type: "button", class: "text" });
  imp.onclick = async () => { await api(`/api/checks/${c.id}`, { method: "PUT", body: JSON.stringify({ important: !c.important }) }); refresh(); };
  const edit = el("button", "수정", { type: "button", class: "text" });
  edit.onclick = async () => {
    const t = prompt("점검 항목 수정", c.text);
    if (t && t.trim()) { await api(`/api/checks/${c.id}`, { method: "PUT", body: JSON.stringify({ text: t }) }); refresh(); }
  };
  const del = el("button", "삭제", { type: "button", class: "text" });
  del.onclick = async () => { if (confirm("이 항목을 삭제할까요?")) { await api(`/api/checks/${c.id}`, { method: "DELETE" }); refresh(); } };
  if (!c.done) acts.append(imp);
  acts.append(edit, del);
  d.append(acts);
  return d;
}

// 머리말: 브랜드('그내종.' 크게, 아래 '그래서 내 종목은?'), 오른쪽 두 줄 소개, 메뉴
const NAV = [
  ["main", "/", "메인"],
  ["profile", "/mypage#profile", "내 투자 프로필"],
  ["archive", "/#archive", "지난 브리핑"],
  ["records", "/mypage#records", "내 기록"],
  ["account", "/mypage#account", "계정 설정"],
];
let META = null;
async function renderChrome(page) {
  META = await api("/api/meta");
  const head = $("#site-header");
  const brand = el("div", null, { class: "brand" });
  const left = el("div");
  const name = el("a", "그내종", { href: "/", class: "brand-name", "aria-label": "그내종 메인으로" });
  name.append(el("span", ".", { class: "dot" }));
  left.append(name, el("div", "그래서 내 종목은?", { class: "brand-sub" }));
  const intro = el("div", null, { class: "brand-intro" });
  intro.append("투자자의 일일 경제 브리핑,", el("br"), "시장을 읽고 내 투자로 연결하는 기록.");
  brand.append(left, intro);
  const nav = el("nav", null, { class: "site-nav", "aria-label": "주 메뉴" });
  for (const [key, href, label] of NAV) {
    const a = el("a", label, { href });
    if (key === page) a.setAttribute("aria-current", "page");
    nav.append(a);
  }
  head.replaceChildren(brand, nav);
  if (META.mode === "demo") {
    head.append(el("p", "가상 데모입니다. 가상 투자자 프로필로 실제 뉴스(2026-11-17 수집)를 AI 파이프라인에 돌린 결과이며, 실제 사람의 보유 내역이 아니고 투자 권유가 아닙니다.", { class: "notice" }));
  }
  const foot = $("#site-footer");
  if (foot) {
    foot.replaceChildren(
      el("p", "그내종은 투자 판단을 돕는 개인용 리서치 도구이며 매수·매도를 권하지 않습니다. 음성은 AI가 만든 대본을 AI 음성으로 읽은 것입니다."),
      el("p", `지금은 이 컴퓨터에서만 쓰는 단일 사용자 버전입니다. 로그인과 사용자별 데이터 분리는 아직 구현하지 않았습니다. · ${META.mode === "demo" ? "가상 데모 데이터" : "내 데이터"}`));
  }
  return META;
}
