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
const reportUrl = (id) => `report.html?id=${encodeURIComponent(id)}`;

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
  const put = async (body) => { await api(`/api/checks/${c.id}`, { method: "PUT", body: JSON.stringify(body) }); refresh(); };
  const d = el("div", null, { class: `item todo${c.done ? " done" : ""}` });
  const box = el("input", null, { type: "checkbox", "aria-label": "완료" });
  box.checked = c.done;
  box.onchange = () => put({ done: box.checked });
  const body = el("div", null, { class: "todo-body" });
  body.append(el("span", c.text, { class: "text" }));
  body.append(el("span", String(c.created_at || "").slice(0, 10), { class: "reg" }));
  if (c.ai_ref?.reason) body.append(el("div", `추천 이유: ${c.ai_ref.reason}`, { class: "meta" }));
  const acts = el("div", null, { class: "actions" });
  const edit = el("button", "수정", { type: "button", class: "mini" });
  edit.onclick = async () => {
    const t = prompt("점검 항목 수정", c.text);
    if (t && t.trim()) put({ text: t });
  };
  const del = el("button", "삭제", { type: "button", class: "mini" });
  del.onclick = async () => { if (confirm("이 항목을 삭제할까요?")) { await api(`/api/checks/${c.id}`, { method: "DELETE" }); refresh(); } };
  acts.append(edit, del);
  d.append(box, body, acts);
  return d;
}

// 머리말: 브랜드('그내종.' 크게, 아래 '그래서 내 종목은?'), 오른쪽 두 줄 소개, 메뉴
const NAV = [
  ["profile", "mypage.html#profile", "내 투자 프로필"],
  ["archive", "archive.html", "브리핑 모음"],
];
let META = null;
async function renderChrome(page) {
  META = await api("/api/meta");
  const head = $("#site-header");
  const brand = el("div", null, { class: "brand" });
  const left = el("div");
  const name = el("a", "그내종", { href: "home.html", class: "brand-name", "aria-label": "그내종 메인으로" });
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
  const foot = $("#site-footer");
  if (foot) {
    foot.replaceChildren(
      el("p", "그내종은 투자 판단을 돕는 개인용 리서치 도구이며 매수·매도를 권하지 않습니다. 음성은 AI가 만든 대본을 AI 음성으로 읽은 것입니다."));
  }
  return META;
}
