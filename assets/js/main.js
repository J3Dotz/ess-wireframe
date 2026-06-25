'use strict';

// ─── SCROLL REVEAL ────────────────────────────────────────────────
(function() {
  var els = document.querySelectorAll('.reveal');
  if (!els.length || typeof IntersectionObserver === 'undefined') {
    els.forEach(function(el) { el.classList.add('is-visible'); });
    return;
  }
  // Snap scroll on homepage handles transitions — show all reveals immediately
  if (document.getElementById('snap-home')) {
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

// ─── SNAP SCROLL + DOT NAV (homepage only) ────────────────────────
if (document.getElementById('snap-home')) {
  var _snapSetActive; // shared between dot IIFE and keyboard handler

  (function() {
    var container  = document.getElementById('snap-home');
    var sections   = Array.prototype.slice.call(document.querySelectorAll('.snap-section'));
    var dotNav     = document.getElementById('dot-nav');
    var labels     = ['Hero', 'Values', 'Services', 'Definitions', 'Clients', 'Logos', 'Contact', 'Footer'];
    var darkSlides = ['slide-hero', 'slide-footer'];

    sections.forEach(function(section, i) {
      var btn = document.createElement('button');
      btn.className = 'dot';
      btn.setAttribute('aria-label', labels[i] || ('Section ' + (i + 1)));
      btn.addEventListener('click', function() {
        section.scrollIntoView({ behavior: 'instant', block: 'start' });
        setActive(i);
      });
      dotNav.appendChild(btn);
    });

    var dots = Array.prototype.slice.call(dotNav.querySelectorAll('.dot'));

    function setActive(index) {
      dots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
      var slideId = sections[index] ? sections[index].id : '';
      dotNav.classList.toggle('dot-nav--light', darkSlides.indexOf(slideId) !== -1);
    }

    _snapSetActive = setActive;

    // IO as fallback for wheel/touch scroll
    if (typeof IntersectionObserver !== 'undefined') {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var idx = sections.indexOf(entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      }, { root: container, threshold: 0.5 });
      sections.forEach(function(s) { io.observe(s); });
    }

    setActive(0);
  })();

  document.addEventListener('keydown', function(e) {
    var container = document.getElementById('snap-home');
    if (!container) return;
    var h        = container.clientHeight;
    var current  = Math.round(container.scrollTop / h);
    var sections = Array.prototype.slice.call(document.querySelectorAll('.snap-section'));
    var total    = sections.length;
    if (e.key === 'ArrowDown' && current < total - 1) {
      sections[current + 1].scrollIntoView({ behavior: 'instant', block: 'start' });
      if (_snapSetActive) _snapSetActive(current + 1);
    }
    if (e.key === 'ArrowUp' && current > 0) {
      sections[current - 1].scrollIntoView({ behavior: 'instant', block: 'start' });
      if (_snapSetActive) _snapSetActive(current - 1);
    }
  });

  // ─── TESTIMONIAL CAROUSEL ─────────────────────────────────────────
  var track = document.querySelector('.testimonial-track');
  var slides = document.querySelectorAll('.testimonial-slide');
  var tDots = document.querySelectorAll('.t-dot');
  var prevBtn = document.querySelector('.t-prev');
  var nextBtn = document.querySelector('.t-next');
  var currentSlide = 0;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    tDots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
  }

  prevBtn.addEventListener('click', function() {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  });

  nextBtn.addEventListener('click', function() {
    goToSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  });

  tDots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { goToSlide(i); });
  });

  // ─── AUTO-ROTATION ────────────────────────────────────────────────
  var autoRotateDelay = 5000;
  var autoRotateTimer;

  function startAutoRotate() {
    clearInterval(autoRotateTimer);
    autoRotateTimer = setInterval(function() {
      goToSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
    }, autoRotateDelay);
  }

  function stopAutoRotate() {
    clearInterval(autoRotateTimer);
  }

  startAutoRotate();

  [prevBtn, nextBtn].concat(Array.prototype.slice.call(tDots)).forEach(function(el) {
    el.addEventListener('click', function() {
      stopAutoRotate();
      clearTimeout(window.resumeTimer);
      window.resumeTimer = setTimeout(startAutoRotate, 8000);
    });
  });

  var clientsSlide = document.getElementById('slide-clients');
  if (clientsSlide && typeof IntersectionObserver !== 'undefined') {
    var carouselObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { startAutoRotate(); } else { stopAutoRotate(); }
      });
    }, { threshold: 0.5 });
    carouselObserver.observe(clientsSlide);
  }

  // ─── SWIPE (TOUCH) ────────────────────────────────────────────────
  var touchStartX = 0;
  var swipeThreshold = 50;

  track.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoRotate();
  }, { passive: true });

  track.addEventListener('touchend', function(e) {
    var delta = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(delta) > swipeThreshold) {
      goToSlide(delta > 0
        ? (currentSlide === slides.length - 1 ? 0 : currentSlide + 1)
        : (currentSlide === 0 ? slides.length - 1 : currentSlide - 1));
    }
    clearTimeout(window.resumeTimer);
    window.resumeTimer = setTimeout(startAutoRotate, 8000);
  }, { passive: true });
}

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
