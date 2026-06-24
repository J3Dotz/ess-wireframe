'use strict';

// ─── SCROLL REVEAL ────────────────────────────────────────────────
(function() {
  var els = document.querySelectorAll('.reveal');
  if (!els.length || typeof IntersectionObserver === 'undefined') {
    // fallback: show all
    els.forEach(function(el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(function(el) { io.observe(el); });
})();

// ─── STATS COUNTER (homepage only) ───────────────────────────────
(function() {
  var counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  var done = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounters() {
    if (done) return;
    done = true;
    counters.forEach(function(el) {
      var target = parseFloat(el.dataset.target);
      var suffix = el.dataset.suffix || '';
      var start = performance.now();
      var duration = 1200;

      function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var value = Math.round(easeOut(progress) * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
    });
  }

  if (typeof IntersectionObserver === 'undefined') { runCounters(); return; }

  var sentinel = counters[0].closest('section') || counters[0];
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { runCounters(); io.disconnect(); }
    });
  }, { threshold: 0.3 });
  io.observe(sentinel);
})();

// ─── MOBILE NAV ───────────────────────────────────────────────────
(function() {
  var hamburger = document.querySelector('.nav__hamburger');
  var overlay   = document.querySelector('.nav__overlay');
  var closeBtn  = document.querySelector('.nav__overlay-close');

  if (!hamburger || !overlay) return;

  hamburger.addEventListener('click', function() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);

  overlay.querySelectorAll('.nav__overlay-link').forEach(function(link) {
    link.addEventListener('click', closeOverlay);
  });
})();

// ─── EXPERIENCE FILTER ────────────────────────────────────────────
(function() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var filter = btn.dataset.filter;
      var cards  = document.querySelectorAll('.project-card-wrap');

      cards.forEach(function(card) {
        if (filter === 'all' || card.dataset.sector === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();
