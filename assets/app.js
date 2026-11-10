/* ===========================================================
   全港小學比賽地圖 — 互動邏輯
   =========================================================== */
(function () {
  "use strict";

  var DATA = window.COMPETITIONS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 狀態 ---------- */
  var state = {
    cat: "全部",
    grade: "全部",
    level: "全部",
    freeOnly: false,
    savedOnly: false,
    q: "",
    sort: "value"
  };

  var saved = {};
  try { saved = JSON.parse(localStorage.getItem("hkcomp-saved") || "{}"); } catch (e) { saved = {}; }

  /* ---------- 工具 ---------- */
  function gradeText(g) {
    if (!g || !g.length) return "—";
    if (g.length === 6) return "小一至小六";
    if (g.length === 1) return "只限小" + "一二三四五六".charAt(g[0] - 1) + "、" + "小" + "一二三四五六".charAt(g[0] - 1);
    if (g.length === 2 && g[0] === 5) return "只限小五、小六";
    if (g.length === 2 && g[0] === 4) return "小四至小六";
    if (g.length === 4 && g[0] === 3) return "小三至小六";
    return "小" + "一二三四五六".charAt(g[0] - 1) + "至小" + "一二三四五六".charAt(g[g.length - 1] - 1);
  }
  function fitsP3P4(c) { return c.grades.indexOf(3) > -1 || c.grades.indexOf(4) > -1; }
  function levelWord(n) { return ["", "極低", "低", "中等", "偏高", "高"][n] || "—"; }

  function meter(n, cls) {
    var out = '<span class="meter ' + (cls || "") + '">';
    for (var i = 1; i <= 5; i++) out += '<i class="' + (i <= n ? "on" : "") + '"></i>';
    return out + "</span>";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- 卡片 ---------- */
  function cardHTML(c) {
    var isSaved = !!saved[c.id];
    var badges = "";
    if (c.free === true) badges += '<span class="badge free">免費</span>';
    if ((c.tags || []).indexOf("現正接受報名") > -1) badges += '<span class="badge now">現正報名</span>';

    var linkHTML = c.link
      ? '<a class="link" href="' + esc(c.link) + '" target="_blank" rel="noopener">官方資料</a>'
      : '<span class="link off">官方連結待更新</span>';

    return '' +
      '<article class="card" data-id="' + esc(c.id) + '">' +
        '<div class="card-top">' +
          '<span class="cat" data-cat="' + esc(c.cat) + '">' + esc(c.cat) + "</span>" +
          badges +
        "</div>" +
        "<h3>" + esc(c.name) + "</h3>" +
        '<p class="org">' + esc(c.org) + "</p>" +
        '<div class="facts">' +
          '<div class="fact"><span>適用</span><span>' + gradeText(c.grades) + "</span></div>" +
          '<div class="fact"><span>技術門檻</span><span>' + meter(c.level, c.level <= 2 ? "low" : "") + " " + levelWord(c.level) + "</span></div>" +
          '<div class="fact"><span>費用</span><span>' + esc(c.fee) + "</span></div>" +
          '<div class="fact"><span>報名</span><span>' + esc(c.reg) + "</span></div>" +
          '<div class="fact"><span>比賽</span><span>' + esc(c.event) + "</span></div>" +
        "</div>" +
        '<p class="note">' + esc(c.note) + "</p>" +
        '<div class="card-foot">' + linkHTML +
          '<button class="save' + (isSaved ? " on" : "") + '" data-save="' + esc(c.id) + '" aria-label="收藏" title="加入我的清單">' + (isSaved ? "✓" : "＋") + "</button>" +
        "</div>" +
      "</article>";
  }

  /* ---------- 篩選 ---------- */
  function filtered() {
    var list = DATA.filter(function (c) {
      if (state.cat !== "全部" && c.cat !== state.cat) return false;
      if (state.grade !== "全部" && c.grades.indexOf(Number(state.grade)) === -1) return false;
      if (state.level !== "全部" && c.level > Number(state.level)) return false;
      if (state.freeOnly && c.free !== true) return false;
      if (state.savedOnly && !saved[c.id]) return false;
      if (state.q) {
        var hay = (c.name + " " + c.org + " " + c.cat + " " + (c.tags || []).join(" ") + " " + c.note).toLowerCase();
        if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
      }
      return true;
    });

    list.sort(function (a, b) {
      if (state.sort === "level") return a.level - b.level || b.value - a.value;
      if (state.sort === "name") return a.name.localeCompare(b.name, "zh-Hant");
      return b.value - a.value || a.level - b.level;
    });
    return list;
  }

  function render() {
    var list = filtered();
    var grid = $("#grid");
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : '<div class="empty">沒有符合條件的比賽。試試放寬「技術門檻」或清除搜尋。</div>';

    $("#count").innerHTML = "顯示 <b>" + list.length + "</b> / " + DATA.length + " 項";
  }

  /* ---------- 精選 ---------- */
  var PICKS = [
    { id: "volunteer-leader", why: "線上 1–2 小時，小三起可報" },
    { id: "writing-wenyu", why: "免費、自由命題、12/31 截止" },
    { id: "volunkids", why: "50 小時就有分科獎章" },
    { id: "speech-festival", why: "全港最大型，學校代報" },
    { id: "redbud-painting", why: "交作品即可，1/8 截止" },
    { id: "maths-cup", why: "題型溫和，5/2 比賽" }
  ];

  function renderPicks() {
    $("#picks-grid").innerHTML = PICKS.map(function (p, i) {
      var c = DATA.filter(function (d) { return d.id === p.id; })[0];
      if (!c) return "";
      return '<a class="pick" href="' + (c.link || "#") + '" target="_blank" rel="noopener">' +
        '<span class="pick-rank">0' + (i + 1) + "</span>" +
        "<h3>" + esc(c.name) + "</h3>" +
        "<p>" + esc(p.why) + "</p>" +
        '<div class="pick-meta"><span class="badge">' + esc(c.cat) + "</span>" +
        (c.free === true ? '<span class="badge free">免費</span>' : '<span class="badge">' + esc(c.fee.split("，")[0]) + "</span>") +
        "</div></a>";
    }).join("");
  }

  /* ---------- 統計 ---------- */
  function renderStats() {
    var cats = {};
    DATA.forEach(function (c) { cats[c.cat] = 1; });
    $("#stat-total").textContent = DATA.length;
    var hn = $("#hero-n"); if (hn) hn.textContent = DATA.length;
    $("#stat-low").textContent = DATA.filter(function (c) { return c.level <= 2; }).length;
    $("#stat-free").textContent = DATA.filter(function (c) { return c.free === true; }).length;
    $("#stat-cat").textContent = Object.keys(cats).length;
  }

  /* ---------- 時間軸 ---------- */
  var TIMELINE = [
    { m: "1月", items: [["報名", "科學奧林匹克（小五小六）", "reg"], ["比賽", "香港學校音樂節", "evt"], ["截止", "教育城學生創新大賽", "reg"]] },
    { m: "2月", items: [["比賽", "學校音樂節 / 舞蹈節", "evt"], ["比賽", "香港小學科學奧林匹克", "evt"], ["比賽", "奧數賽（中級組）", "evt"]] },
    { m: "3月", items: [["比賽", "舞蹈節 / 戲劇節", "evt"], ["報名", "閱讀報告比賽", "reg"], ["報名", "數學盃（至 4/25）", "reg"]] },
    { m: "4月", items: [["比賽", "小棋聖盃", "evt"], ["比賽", "戲劇節校內演出", "evt"], ["報名", "SDMF 舞蹈音樂節", "reg"]] },
    { m: "5月", items: [["比賽", "全港數學盃挑戰賽", "evt"], ["比賽", "戲劇節公開演出", "evt"], ["比賽", "21 世紀杯決賽", "evt"]] },
    { m: "6月", items: [["比賽", "SDMF 舞蹈音樂節", "evt"], ["報名", "繪畫大獎賽 / 童夢飛揚", "reg"], ["比賽", "戲劇節閉幕", "evt"]] },
    { m: "7月", items: [["比賽", "SDMF 決賽", "evt"], ["截止", "繪畫大獎賽收作品", "reg"], ["—", "暑假：整理 portfolio", ""]] },
    { m: "8月", items: [["報名", "國際朗誦公開賽", "reg"], ["報名", "SDMF 新一屆", "reg"], ["—", "暑期密集練習", ""]] },
    { m: "9月", items: [["報名", "朗誦節 / 音樂節", "reg"], ["報名", "HKSSF 學界體育", "reg"], ["報名", "學校舞蹈節", "reg"]] },
    { m: "10月", items: [["截止", "音樂節報名（10/27）", "reg"], ["報名", "奧數賽（中級組）", "reg"], ["報名", "數學盃", "reg"]] },
    { m: "11月", items: [["比賽", "香港學校朗誦節", "evt"], ["截止", "文裕盃徵文（12/31）", "reg"], ["比賽", "STEM 智科問答", "evt"]] },
    { m: "12月", items: [["比賽", "朗誦節決賽週", "evt"], ["截止", "紫荊盃繪畫（1/8）", "reg"], ["截止", "義工年度結算", "reg"]] }
  ];

  function renderTimeline() {
    $("#timeline").innerHTML = TIMELINE.map(function (col) {
      return '<div class="tl-col"><div class="tl-m">' + col.m + "</div>" +
        col.items.map(function (it) {
          return '<span class="tl-item ' + it[2] + '"><b>' + it[0] + "</b>" + esc(it[1]) + "</span>";
        }).join("") + "</div>";
    }).join("");
  }

  /* ---------- 事件 ---------- */
  function bind() {
    $$(".chip[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.cat = b.dataset.cat;
        $$(".chip[data-cat]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        render();
      });
    });

    $$(".chip[data-grade]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.grade = b.dataset.grade;
        $$(".chip[data-grade]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        render();
      });
    });

    $$(".chip[data-level]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.level = b.dataset.level;
        $$(".chip[data-level]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        render();
      });
    });

    var freeChip = $("#chip-free");
    if (freeChip) freeChip.addEventListener("click", function () {
      state.freeOnly = !state.freeOnly;
      freeChip.classList.toggle("on", state.freeOnly);
      render();
    });

    var savedChip = $("#chip-saved");
    if (savedChip) savedChip.addEventListener("click", function () {
      state.savedOnly = !state.savedOnly;
      savedChip.classList.toggle("on", state.savedOnly);
      render();
    });

    var q = $("#q");
    if (q) q.addEventListener("input", function () { state.q = q.value.trim(); render(); });

    var sort = $("#sort");
    if (sort) sort.addEventListener("change", function () { state.sort = sort.value; render(); });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-save]");
      if (!btn) return;
      var id = btn.dataset.save;
      if (saved[id]) { delete saved[id]; btn.classList.remove("on"); btn.textContent = "＋"; }
      else { saved[id] = 1; btn.classList.add("on"); btn.textContent = "✓"; }
      try { localStorage.setItem("hkcomp-saved", JSON.stringify(saved)); } catch (err) {}
      var n = Object.keys(saved).length;
      var badge = $("#saved-count");
      if (badge) badge.textContent = n ? "(" + n + ")" : "";
      if (state.savedOnly) render();
    });

    var top = $("#to-top");
    if (top) {
      top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
      window.addEventListener("scroll", function () {
        top.classList.toggle("show", window.scrollY > 600);
      }, { passive: true });
    }
  }

  /* ---------- 啟動 ---------- */
  function init() {
    renderStats();
    renderPicks();
    renderTimeline();
    render();
    bind();
    var n = Object.keys(saved).length;
    var badge = $("#saved-count");
    if (badge) badge.textContent = n ? "(" + n + ")" : "";

    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
