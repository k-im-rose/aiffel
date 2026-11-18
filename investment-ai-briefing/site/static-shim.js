// 정적 데모용: /api 요청을 저장된 JSON으로 답하고, 수정은 이 브라우저(localStorage)에만 저장한다. 서버로 아무것도 보내지 않는다.
(function () {
  const BASE = new URL(".", document.currentScript.src).href;
  const real = window.fetch.bind(window);
  const K = "gnj_static_demo_";
  const get = (k, d) => { try { const v = localStorage.getItem(K + k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch {} };
  const out = (d, status = 200) => new Response(JSON.stringify(d), { status, headers: { "Content-Type": "application/json" } });
  const data = (name) => real(BASE + "data/" + name).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const kstNow = () => new Date(Date.now() + 9 * 3600e3).toISOString();
  const stamp = () => kstNow().slice(0, 19) + "+09:00";
  const id = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, "0")).join("");

  window.fetch = async (input, opt = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("/api/")) return real(input, opt);
    const u = new URL(url, "http://x"), p = u.pathname, m = (opt.method || "GET").toUpperCase();
    let body = {}; try { body = opt.body ? JSON.parse(opt.body) : {}; } catch {}
    try {
      if (p === "/api/meta") { const d = await data("meta.json"); return out({ ...d, today: kstNow().slice(0, 10) }); }
      if (p === "/api/briefings" && m === "GET") return out(await data("briefings.json"));
      if (p === "/api/records") return out(await data("records.json"));
      let mm;
      if ((mm = p.match(/^\/api\/briefings\/([^/]+)$/))) {
        try { return out(await data("briefing_" + decodeURIComponent(mm[1]) + ".json")); } catch { return out({ error: "브리핑 없음" }, 404); }
      }
      if (p === "/api/symbols") return out({ available: false, meta: {}, results: [] });
      if (p === "/api/profile") {
        if (m === "PUT") { const cur = get("profile", null) || await data("profile.json"); const saved = { ...cur, ...body, updated_at: stamp() }; set("profile", saved); return out(saved); }
        return out(get("profile", null) || await data("profile.json"));
      }
      if (p === "/api/memos") {
        const all = get("memos", []);
        if (m === "POST") { const it = { id: id(), date: String(body.date || "").slice(0, 10), text: String(body.text || ""), created_at: stamp(), updated_at: stamp() }; all.push(it); set("memos", all); return out(it, 201); }
        const date = u.searchParams.get("date");
        return out(all.filter((x) => !date || x.date === date).sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
      }
      if ((mm = p.match(/^\/api\/memos\/([^/]+)$/))) {
        const all = get("memos", []), it = all.find((x) => x.id === mm[1]);
        if (!it) return out({ error: "없음" }, 404);
        if (m === "DELETE") { set("memos", all.filter((x) => x !== it)); return out({ deleted: it.id }); }
        if (body.text != null) it.text = String(body.text);
        it.updated_at = stamp(); set("memos", all); return out(it);
      }
      if (p === "/api/checks") {
        const all = get("checks", []);
        if (m === "POST") {
          const ref = body.origin === "ai" ? body.ai_ref : null;
          if (ref && all.some((c) => c.ai_ref && c.ai_ref.id === ref.id)) return out({ error: "이미 목록에 있습니다" }, 409);
          const it = { id: id(), text: String(body.text || "").slice(0, 500), origin: body.origin === "ai" ? "ai" : "user", done: false, created_at: stamp(), updated_at: stamp(), done_at: null, briefing_date: body.briefing_date || null };
          if (ref) it.ai_ref = ref;
          all.push(it); set("checks", all); return out(it, 201);
        }
        return out(all);
      }
      if ((mm = p.match(/^\/api\/checks\/([^/]+)$/))) {
        const all = get("checks", []), it = all.find((x) => x.id === mm[1]);
        if (!it) return out({ error: "없음" }, 404);
        if (m === "DELETE") { set("checks", all.filter((x) => x !== it)); return out({ deleted: it.id }); }
        if (body.text) it.text = String(body.text);
        if ("done" in body) { it.done = !!body.done; it.done_at = it.done ? stamp() : null; }
        it.updated_at = stamp(); set("checks", all); return out(it);
      }
    } catch (e) { return out({ error: String(e.message || e) }, 500); }
    return out({ error: "정적 데모에서 지원하지 않는 요청" }, 404);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const b = document.createElement("div");
    b.setAttribute("style", "background:var(--tint-accent,#F8F1EE);color:var(--color-ink-2,#555);font-size:12px;line-height:1.6;padding:8px 16px;text-align:center");
    b.textContent = "정적 데모 · 가상 투자자 프로필 + 2026-11-17 실제 수집 뉴스 · 수정한 내용은 이 브라우저에만 저장됩니다 · 음성은 비공식 서비스(edge-tts)로 만든 개인 시연용 파일입니다 · 매수·매도를 권유하지 않습니다";
    document.body.prepend(b);
  });
})();
