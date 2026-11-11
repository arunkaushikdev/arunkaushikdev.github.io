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

  /* Contact form (sent through FormSubmit, which emails the enquiry) */
  var form = $('#enquiry');
  if (form) {
    var ENDPOINT = 'https://formsubmit.co/ajax/arun.idevs@gmail.com';
    var send = $('#send'), status = $('#status');
    var body = $('#formBody'), success = $('#success');

    function setErr(name, msg) {
      var el = form.elements[name];
      var out = $('.err[data-for="' + name + '"]', form);
      if (!el || !out) return;
      out.textContent = msg || '';
      el.closest('.field').classList.toggle('invalid', !!msg);
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
    function validate() {
      var ok = true, first = null;
      function bad(name, msg) { setErr(name, msg); if (msg) { ok = false; if (!first) first = form.elements[name]; } }
      var name = form.elements.name.value.trim();
      bad('name', name.length < 2 ? 'Please enter your name.' : '');
      var digits = form.elements.mobile.value.replace(/\D/g, '');
      var mobileOk = /^[+\d][\d\s\-()]*$/.test(form.elements.mobile.value.trim()) && digits.length >= 10 && digits.length <= 15;
      bad('mobile', !form.elements.mobile.value.trim() ? 'Mobile number is required.' : (mobileOk ? '' : 'Enter a valid mobile number (10–15 digits).'));
      var email = form.elements.email.value.trim();
      bad('email', email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email or leave it blank.' : '');
      bad('project_type', !form.elements.project_type.value ? 'Please choose a project type.' : '');
      bad('message', form.elements.message.value.trim().length < 10 ? 'Please add a few details (at least 10 characters).' : '');
      if (first) first.focus();
      return ok;
    }
    ['name', 'mobile', 'email', 'project_type', 'message'].forEach(function (n) {
      form.elements[n].addEventListener('input', function () { setErr(n, ''); });
      form.elements[n].addEventListener('change', function () { setErr(n, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status'; status.textContent = '';
      if (form.elements._honey.value) return;
      if (!validate()) return;

      var data = {
        name: form.elements.name.value.trim(),
        mobile: form.elements.mobile.value.trim(),
        email: form.elements.email.value.trim(),
        project_type: form.elements.project_type.value,
        budget: form.elements.budget.value || 'Not specified',
        deadline: form.elements.deadline.value || 'Flexible',
        contact_preference: form.elements.contact_pref.value,
        message: form.elements.message.value.trim(),
        _subject: 'New project enquiry from your portfolio',
        _template: 'table',
        _captcha: 'false'
      };
      if (!data.email) delete data.email;

      var label = $('.btn-label', send);
      send.disabled = true; label.textContent = 'Sending…';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, j: j }; });
      }).then(function (res) {
        if (!res.ok || String(res.j.success) === 'false') throw new Error('failed');
        body.hidden = true; success.hidden = false;
        form.reset();
      }).catch(function () {
        status.className = 'form-status error';
        status.innerHTML = 'Could not send right now. Please email me at <a href="mailto:arun.idevs@gmail.com">arun.idevs@gmail.com</a>.';
      }).then(function () {
        send.disabled = false; label.textContent = 'Send enquiry';
      });
    });

    $('#again').addEventListener('click', function () {
      success.hidden = true; body.hidden = false; status.textContent = '';
    });
  }
})();
