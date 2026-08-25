// Shared three-layer page-transition wipe for internal navigation, included
// on every page. Exit sequence: dark #2E2D32 wipes up from the bottom to
// cover, then blue #147CD1 (with the logo centered) wipes up on top of that,
// then dark #2E2D32 wipes up once more — that final dark layer is what's on
// screen the instant the browser actually navigates, and the new page starts
// already covered by it (see page-transition.css) so there's no flash at the
// handoff. index.html has its own counting .preload panel (script.js) that
// sometimes needs to play instead of this wipe's own reveal — for that page
// only, this file exposes pageWipeReveal/pageWipeForceHidden and lets
// script.js decide which one to call, rather than auto-revealing itself.
(function () {
  const STEP = 350; // ms between each layer's cover-start during an exit
  const LAYER_DURATION = 800; // ms — keep in sync with page-transition.css
  const NAV_FLAG = 'dlj_internal_nav';

  document.addEventListener('DOMContentLoaded', () => {
    const layers = [...document.querySelectorAll('.wipe-layer')];
    if (!layers.length) return;

    function forceHidden() {
      layers.forEach((layer) => {
        layer.classList.add('is-instant');
        layer.classList.remove('is-below');
        layer.classList.add('is-out');
      });
      void layers[0].offsetWidth; // force the instant jump to commit
      layers.forEach((layer) => layer.classList.remove('is-instant'));
    }

    function reveal() {
      layers.forEach((layer) => layer.classList.remove('is-below'));
      // Give the page one paint at "covering" before animating away, so the
      // reveal always plays instead of a transition-less snap.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          layers.forEach((layer) => layer.classList.add('is-out'));
        });
      });
    }

    window.pageWipeForceHidden = forceHidden;
    window.pageWipeReveal = reveal;

    // index.html's own counting preloader sometimes plays instead of this
    // wipe's entrance — script.js decides and calls reveal()/forceHidden()
    // itself in that case. Every other page just reveals immediately.
    const hasOwnPreloader = !!document.querySelector('.preload');
    if (!hasOwnPreloader) {
      reveal();
    }

    function fadeOutMusic(duration) {
      const audio = document.getElementById('bg-music');
      if (!audio || audio.paused) return;

      const startVolume = audio.volume;
      const startTime = performance.now();

      function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        audio.volume = startVolume * (1 - t);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          audio.pause();
          audio.volume = startVolume;
        }
      }
      requestAnimationFrame(step);
    }

    function navigateWithWipe(href) {
      // Snap every layer to "waiting just below the viewport" instantly —
      // they're currently parked off the *top* (from the entrance reveal, or
      // however this page arrived) — so the exit can wipe up from the
      // bottom instead of falling in from the top.
      layers.forEach((layer) => {
        layer.classList.add('is-instant');
        layer.classList.remove('is-out');
        layer.classList.add('is-below');
      });
      void layers[0].offsetWidth; // force the instant jump to commit
      layers.forEach((layer) => layer.classList.remove('is-instant'));

      // Then wipe each one up into place in sequence: dark, blue+logo, dark.
      layers.forEach((layer, i) => {
        setTimeout(() => layer.classList.remove('is-below'), i * STEP);
      });

      // Flag the very next index.html load as "arrived via our own nav" so
      // its preloader-once gate (script.js) knows to skip the counting
      // intro and just let this wipe finish the transition instead. Scoped
      // to index.html specifically so a stray flag can't skip the preloader
      // on some unrelated later visit.
      const target = href.split('?')[0].split('#')[0];
      if (target === 'index.html' || target === '' || target === './') {
        sessionStorage.setItem(NAV_FLAG, '1');
      }

      const totalDuration = (layers.length - 1) * STEP + LAYER_DURATION;
      fadeOutMusic(totalDuration);
      setTimeout(() => {
        window.location.href = href;
      }, totalDuration);
    }
    window.pageTransitionNavigate = navigateWithWipe;

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      const link = e.target.closest('a');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:\/\//i.test(href)) {
        return;
      }

      e.preventDefault();
      navigateWithWipe(href);
    });

    // Bfcache restores (Safari/Firefox back/forward) fire `pageshow` again
    // with persisted=true but skip re-running scripts — without this the
    // layers could be left stuck mid-wipe from the exit that ran right
    // before the user navigated away.
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) forceHidden();
    });
  });
})();
