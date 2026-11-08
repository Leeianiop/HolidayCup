(function () {
  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hdr = $("#hdr"), logo = $("#logo"), spacer = $("#logoSpacer");
  var LW = 980, LH = 635;
  var vw = 0, vh = 0, G = {};

  /* ---------- starfield (two parallax layers) ---------- */
  function drawStars(cv, density, rate) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = innerWidth, h = innerHeight + 700;
    cv.width = w * dpr; cv.height = h * dpr;
    var c = cv.getContext("2d"); c.scale(dpr, dpr); c.clearRect(0, 0, w, h);
    var n = Math.floor(w * h / density);
    for (var i = 0; i < n; i++) {
      var r = Math.random();
      var s = r < .85 ? .5 + Math.random() * 1.1 : 1.4 + Math.random() * 1.6;
      c.globalAlpha = .35 + Math.random() * .65;
      c.fillStyle = Math.random() < .7 ? "#8ea6d0" : "#dfe6f5";
      c.beginPath(); c.arc(Math.random() * w, Math.random() * h, s, 0, 6.283); c.fill();
    }
    cv._rate = rate;
  }
  var sA = $("#starsA"), sB = $("#starsB");
  function stars() { drawStars(sA, 2600, .04); drawStars(sB, 9000, .11); }

  /* ---------- logo geometry ---------- */
  function measure() {
    vw = innerWidth; vh = innerHeight;
    var mobile = vw < 720;
    var s0 = Math.min((mobile ? vw * .9 : vw * .64) / LW, (vh * (mobile ? .34 : .56)) / LH);
    $("#hero").style.setProperty("--lw", (LW * s0) + "px");
    spacer.style.width = (LW * s0) + "px"; spacer.style.height = (LH * s0) + "px";
    var r = spacer.getBoundingClientRect();
    var endW = mobile ? 100 : Math.max(96, Math.min(vw * .085, 190));
    var s1 = endW / LW;
    var hh = hdr.getBoundingClientRect().height, inset = parseFloat(getComputedStyle(hdr).paddingTop) || 0;
    G = {
      s0: s0, s1: s1,
      x0: r.left, y0: r.top + scrollY,
      x1: mobile ? Math.max(16, vw * .04) : vw * .06,
      y1: inset + Math.max(4, (hh - inset - LH * s1) * .3),
      range: Math.max(260, vh * .7)
    };
  }

  /* ---------- scroll-driven motion (smoothed) ---------- */
  var cur = -1, y = scrollY, tgt = scrollY;
  var stripes = $("#stripes"), hl = $("#hl"), div1 = $("#div1"), tag = $("#tag");
  var navT = $("#nav-tourney"), tourney = $("#tourney");
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function render(sy) {
    var p = Math.max(0, Math.min(1, sy / G.range)), e = ease(p);
    var x = G.x0 + (G.x1 - G.x0) * e, yy = G.y0 + (G.y1 - G.y0) * e, s = G.s0 + (G.s1 - G.s0) * e;
    logo.style.transform = "translate3d(" + x + "px," + yy + "px,0) scale(" + s + ")";
    hdr.style.setProperty("--hp", Math.min(1, p * 1.4));
    var f = Math.max(0, 1 - sy / (vh * .32));
    div1.style.opacity = f; tag.style.opacity = f;
    var q = Math.max(0, Math.min(1, sy / (vh * .62))), qe = q * q * (3 - 2 * q);
    hl.style.transform = "perspective(900px) translate3d(" + (qe * vw * .16) + "px," + (-qe * vh * .12) + "px,0) rotateY(" + (qe * -115) + "deg) rotateX(" + (qe * 30) + "deg) rotateZ(" + (qe * 28) + "deg) scale(" + (1 - qe * .25) + ")";
    hl.style.opacity = Math.max(0, 1 - Math.pow(q, 1.6));
    tag.style.transform = "translateY(" + (-sy * .12) + "px)";
    var L = vw * .515 + vh * .857;
    stripes.style.setProperty("--o", (L - (vw < 720 ? vh * .2 : Math.min(340, vh * .42)) - sy * .55).toFixed(1));
    sA.style.transform = "translate3d(0," + (-Math.min(sy * sA._rate, 690)) + "px,0)";
    sB.style.transform = "translate3d(0," + (-Math.min(sy * sB._rate, 690)) + "px,0)";
    var tTop = tourney.getBoundingClientRect().top;
    navT.classList.toggle("on", tTop < vh * .65);
  }
  function loop() {
    tgt = scrollY;
    y += (tgt - y) * (reduce ? 1 : .16);
    if (Math.abs(tgt - y) < .05) y = tgt;
    render(y);
    requestAnimationFrame(loop);
  }

  /* ---------- eased anchor scrolling ---------- */
  var anim = 0;
  function scrollToY(target, dur) {
    cancelAnimationFrame(anim);
    target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - vh));
    var from = scrollY, d = target - from, t0 = performance.now();
    dur = reduce ? 0 : (dur || Math.min(1500, 650 + Math.abs(d) * .45));
    if (!dur) { scrollTo(0, target); return; }
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur);
      scrollTo(0, from + d * ease(k));
      if (k < 1) anim = requestAnimationFrame(step);
    })(t0);
  }
  ["wheel", "touchstart", "keydown"].forEach(function (ev) { addEventListener(ev, function () { cancelAnimationFrame(anim); }, { passive: true }); });

  navT.addEventListener("click", function (e) { e.preventDefault(); scrollToY(tourney.offsetTop - 4); });
  logo.addEventListener("click", function (e) { e.preventDefault(); scrollToY(0); });

  var toast = $("#toast"), tt;
  document.querySelectorAll("[data-soon]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast.textContent = a.getAttribute("data-soon") + " is coming soon";
      toast.classList.add("show"); clearTimeout(tt);
      tt = setTimeout(function () { toast.classList.remove("show"); }, 2200);
    });
  });

  /* ---------- toggles ---------- */
  document.querySelectorAll(".pill").forEach(function (b) {
    b.addEventListener("click", function () {
      var panel = document.getElementById(b.getAttribute("aria-controls"));
      var open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open);
      panel.classList.toggle("open", open);
      if (open) setTimeout(function () {
        var r = panel.getBoundingClientRect();
        var over = r.bottom - (vh - 24);
        if (over > 0) scrollToY(scrollY + over + 16, 650);
      }, 380);
    });
  });

  /* ---------- reveal on scroll (visible by default; only below-fold items start hidden) ---------- */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    rv.forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) el.classList.add("pre");
      io.observe(el);
    });
  }

  /* ---------- init ---------- */
  var rt;
  function init() { stars(); measure(); }
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { init(); }, 120); });
  init();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); });
  y = scrollY;
  requestAnimationFrame(loop);
})();
