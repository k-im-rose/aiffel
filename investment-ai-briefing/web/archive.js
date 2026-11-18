// 브리핑 모음: 별도 화면 없이 가장 최근 보고서로 바로 이동한다 (이전 보고서는 보고서 위쪽 버튼으로)
(async () => {
  try {
    const runs = await api("/api/briefings");
    location.replace(runs.length ? reportUrl(runs[0].id) : "/");
  } catch { location.replace("/"); }
})();
