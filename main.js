/* ════════════════════════════════════════════════════════════════
   SALLY ADAMS – AUTRICE  |  main.js
   ════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Header: add .scrolled class when user scrolls ─────────── */
  const header = document.getElementById('site-header');

  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ── Mobile hamburger ──────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav when a link is clicked
    mainNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Mobile: toggle sub-dropdown with the parent link
    mainNav.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        const li = toggle.closest('.has-dropdown');
        if (window.innerWidth <= 720) {
          e.preventDefault();
          li.classList.toggle('open');
          toggle.setAttribute('aria-expanded', String(li.classList.contains('open')));
        }
      });
    });

    /* ── Close mobile menu on outside click / overlay tap ────── */
    document.addEventListener('click', function (e) {
      if (mainNav.classList.contains('open')) {
        if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
          mainNav.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
    });
  }

  /* ── Keyboard accessibility: close dropdown on Escape ──────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (mainNav && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
  });

  /* ── Intersection Observer: fade-in sections ───────────────── */
  var fadeTargets = document.querySelectorAll(
    '.book-card, .section-header, .about-inner, .social-list, .novita-card, .event-card'
  );

  if ('IntersectionObserver' in window && fadeTargets.length) {
    // Set initial state
    fadeTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger cards slightly
            var delay = entry.target.closest('.books-grid, .novita-grid, .event-grid')
              ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 70
              : 0;

            setTimeout(function () {
              entry.target.style.opacity  = '1';
              entry.target.style.transform = 'translateY(0)';
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeTargets.forEach(function (el) { observer.observe(el); });

    // Fallback: show all after 3s if IntersectionObserver didn't trigger
    setTimeout(function () {
      fadeTargets.forEach(function (el) {
        if (el.style.opacity === '0') {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, 3000);
  }

  /* ── Series badges: scale-in on entry ──────────────────────── */
  var badges = document.querySelectorAll('.series-order-badge');
  if ('IntersectionObserver' in window && badges.length) {
    badges.forEach(function (b) {
      b.style.transform = 'scale(0)';
      b.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });

    var badgeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.transform = 'scale(1)';
          badgeObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    badges.forEach(function (b) { badgeObs.observe(b); });
  }

  /* ── Back-to-top button (created via JS) ───────────────────── */
  (function () {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Torna su');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    function toggleBtn() {
      btn.classList.toggle('visible', window.scrollY > 400);
    }
    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

})();
