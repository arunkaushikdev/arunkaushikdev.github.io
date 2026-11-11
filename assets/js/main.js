(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* Scroll progress + nav state */
  var bar = $('#progress'), nav = $('#nav');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', h.scrollTop > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal on scroll. After it finishes, the reveal classes are removed so
     they never interfere with hover effects. */
  var items = $$('.reveal');
  function finish(el) {
    setTimeout(function () {
      el.classList.remove('reveal', 'in', 'd1', 'd2', 'd3', 'd4');
    }, 1100);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); finish(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.remove('reveal'); });
  }

  /* Count-up stats */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1200;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(countUp);
  }

  /* Typed rotating words. The heading box has a fixed height, so the layout
     never shifts while the text changes. */
  var words = ['Android apps', 'desktop apps', 'web apps', 'backends & APIs', 'college projects'];
  var rot = $('#rot');
  if (reduce) {
    rot.textContent = words[0];
  } else {
    var wi = 0, ci = 0, del = false;
    (function tick() {
      var w = words[wi];
      rot.textContent = w.slice(0, ci);
      var delay = del ? 40 : 80;
      if (!del && ci === w.length) { del = true; delay = 1600; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; delay = 400; }
      ci += del ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }

  /* Typesider mini demo: Tyzaps -> Typoints */
  var tz = $('#tz'), tzbar = $('#tzbar'), pts = $('#pts');
  var count = 0, points = 0;
  if (reduce) {
    tz.textContent = '64'; tzbar.style.width = '64%'; pts.textContent = '12';
  } else {
    setInterval(function () {
      count += 1 + Math.floor(Math.random() * 3);
      if (count >= 100) { count -= 100; points += 1; pts.textContent = points; }
      tz.textContent = count;
      tzbar.style.width = count + '%';
    }, 110);
  }

  /* Copy email */
  var copy = $('#copy');
  copy.addEventListener('click', function () {
    var email = 'arun.idevs@gmail.com';
    function done() {
      copy.textContent = 'Copied ✓'; copy.classList.add('done');
      setTimeout(function () { copy.textContent = 'Copy'; copy.classList.remove('done'); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, done);
    } else { done(); }
  });
})();
