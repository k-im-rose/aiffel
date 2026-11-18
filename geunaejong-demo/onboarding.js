// 최초 투자 프로필 설정: 기존 프로필 양식을 그대로 쓰되, 종목과 투자 이유를 하나 이상 받는다
(async () => {
  await renderChrome("profile");
  await mountProfileForm($("#profile-form"), {
    submitLabel: "저장하고 시작하기", requireStock: true,
    onSaved: () => { setTimeout(() => location.assign("home.html"), 600); },
  });
})();
