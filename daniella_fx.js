/* daniella_fx.js — GSAP + ScrollTrigger + Lenis (نسخة وحدة مشتركة لكل الصفحات) */
(function () {
  "use strict";
  var G = window.gsap, ST = window.ScrollTrigger;
  if (!G) return;
  if (ST) G.registerPlugin(ST);
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var inFrame = window.parent !== window; // نافذة المعاينة بلوحة التحكم
  var lenis = null;

  // ===== Lenis: نسخة وحدة فقط، مربوطة مع ScrollTrigger =====
  if (!reduce && !inFrame && window.Lenis && !window.__dnLenis) {
    lenis = window.__dnLenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (ST) lenis.on("scroll", ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
  }

  // وقف التمرير الناعم لما تنفتح أي نافذة منبثقة
  function lockCheck() {
    if (!lenis) return;
    if (document.querySelector(".modal-backdrop.show")) lenis.stop(); else lenis.start();
  }
  new MutationObserver(lockCheck).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
  document.querySelectorAll(".modal").forEach(function (m) { m.setAttribute("data-lenis-prevent", ""); });

  // روابط الأقسام داخل الصفحة
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var h = a.getAttribute("href");
    if (h.length < 2) return;
    var el = document.getElementById(h.slice(1));
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: -64, duration: 1.3 });
    history.replaceState(null, "", h);
  });

  // ===== شريط التقدم =====
  var bar = document.createElement("div");
  bar.id = "fxBar";
  document.body.appendChild(bar);
  var tick = 0;
  addEventListener("scroll", function () {
    if (tick) return;
    tick = requestAnimationFrame(function () {
      tick = 0;
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
    });
  }, { passive: true });

  // ===== ظهور العناصر عند التمرير (خفيف) =====
  function reveal(list) {
    if (reduce || !ST || !list.length) return;
    G.set(list, { opacity: 0, y: 30 });
    ST.batch(list, {
      start: "top 94%", once: true,
      onEnter: function (b) {
        G.to(b, { opacity: 1, y: 0, duration: .85, ease: "power3.out", stagger: .07, overwrite: true, clearProps: "opacity,transform" });
      }
    });
  }
  var arr = function (q) { return Array.prototype.slice.call(document.querySelectorAll(q)); };

  // حركة الغلاف: لحظة الدخول الرئيسية بالصفحة
  if (!reduce && document.querySelector(".hero")) {
    G.from(".hero .eyebrow, .hero h1, .hero p, .hero .primary", {
      y: 44, opacity: 0, duration: 1.1, ease: "power3.out", stagger: .13, delay: .1, clearProps: "opacity,transform"
    });
  }
  reveal(arr(".section-head, .benefit, .step, .contact-strip h2, .contact-strip p, .contact-strip .contact-btns"));

  // الشبكات بتنملي من قاعدة البيانات: بنحرّك بس لما يتغير عدد العناصر (مو عند اختيار لون)
  ["categories", "products", "sewingPreview", "galleryGrid", "sewingList", "ringList", "liningList", "midGrid", "sideGrid"].forEach(function (id) {
    var el = document.getElementById(id), last = 0, t;
    if (!el) return;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var k = el.children.length;
        if (k && k !== last) reveal(Array.prototype.slice.call(el.children));
        last = k;
        if (ST) ST.refresh();
      }, 60);
    }).observe(el, { childList: true });
  });

  // ===== ضوء البطاقات يتبع المؤشر =====
  var SP = ".product,.sw-card,.category,.step,.gallery figure,.cp-card", raf = 0;
  document.addEventListener("pointermove", function (e) {
    var c = e.target.closest && e.target.closest(SP);
    if (!c || raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }, { passive: true });

  addEventListener("load", function () { if (ST) ST.refresh(); });
})();
