(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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

  /* Reveal on scroll */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Count-up stats */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
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

  /* Rotating typed words */
  var words = ['Android apps', 'Windows desktop apps', 'web apps', 'backends & APIs', 'your college project'];
  var rot = $('#rot');
  if (reduce) {
    rot.textContent = 'software you need';
  } else {
    var wi = 0, ci = 0, del = false;
    (function tick() {
      var w = words[wi];
      rot.textContent = w.slice(0, ci);
      var delay = del ? 35 : 75;
      if (!del && ci === w.length) { del = true; delay = 1500; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; delay = 350; }
      ci += del ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }

  /* Cursor glow */
  var glow = $('#glow');
  if (fine && !reduce) {
    window.addEventListener('mousemove', function (e) {
      glow.classList.add('on');
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
  }

  /* 3D tilt on cards */
  if (fine && !reduce) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) translateY(-3px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.25) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
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
    }, 90);
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
