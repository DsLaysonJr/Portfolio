// Generic fake-scroll rig shared by the standalone pages (Recent Works,
// Project detail) — same lerp/translate3d technique as script.js's
// homepage-specific SmoothScroll class, but with no dependency on
// homepage-only elements (parallax, footer, sidebar). Sidebar handling stays
// optional so this also works on pages that don't have one.
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

class SmoothScroll {
  constructor(el) {
    this.el = el;
    this.currentY = 0;
    this.targetY = 0;
    this.maxScrollY = 0;
    this.sidebar = document.querySelector('.sidebar');
    this.recalculate();
    this.setup();
    this.onWindowResize();
    this.animate();
  }

  recalculate() {
    this.maxScrollY = Math.max(0, this.el.scrollHeight - window.innerHeight);
    document.body.style.height = `${this.el.scrollHeight}px`;
    this.targetY = Math.min(this.targetY, this.maxScrollY);
  }

  setup() {
    window.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touchEndY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchEndY) * 2; // Multiply for more sensitivity
      this.targetY = Math.min(Math.max(this.targetY + deltaY, 0), this.maxScrollY);
      touchStartY = touchEndY;
    }, { passive: false });
  }

  onScroll() {
    window.scrollTo(0, 0); // Keep the body scroll position at the top
  }

  onWheel(e) {
    e.preventDefault();
    this.targetY = Math.min(Math.max(this.targetY + e.deltaY, 0), this.maxScrollY);
  }

  onWindowResize() {
    window.addEventListener('resize', () => this.recalculate());
  }

  animate() {
    const previousY = this.currentY;
    this.currentY = lerp(this.currentY, this.targetY, 0.075);
    this.currentY = Math.min(Math.max(this.currentY, 0), this.maxScrollY);
    this.el.style.transform = `translate3d(0, -${this.currentY}px, 0)`;

    // See script.js's identical comment: suspend hit-testing while content is
    // still sliding under a stationary pointer, so hover states don't flicker.
    const isAnimating = Math.abs(this.currentY - previousY) > 0.05;
    document.body.classList.toggle('is-scrolling', isAnimating);

    if (this.sidebar) {
      if (this.currentY >= 100 && window.innerWidth < 992) {
        this.sidebar.classList.add('show');
      } else {
        this.sidebar.classList.remove('show');
      }
      this.sidebar.style.transform = `translateY(${this.currentY}px)`;
    }

    this.updateFooterParallax();

    requestAnimationFrame(this.animate.bind(this));
  }

  // Same technique as script.js's identical method: .footer-parallax is fixed
  // and always fills the viewport, so .footer-reveal-spacer (the last thing
  // in .smooth-scroll, see works.html/project.html) is what actually scrolls
  // to uncover it — tracked here to drift the logo/tagline inside it slightly
  // as it reveals. No-op on pages without a footer.
  updateFooterParallax() {
    if (this._footerInner === undefined) {
      this._footerSpacer = document.querySelector('.footer-reveal-spacer');
      this._footerInner = document.querySelector('.footer-parallax-inner');
    }
    if (!this._footerSpacer || !this._footerInner) return;

    const rect = this._footerSpacer.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const raw = (viewportH - rect.top) / (viewportH + rect.height);
    const progress = Math.min(Math.max(raw, 0), 1);

    const driftPx = (1 - progress) * 40;
    this._footerInner.style.transform = `translateY(${driftPx}px)`;
  }
}

// One-time letter-cascade reveal, triggered once when the element scrolls
// into view — same mechanism as script.js's identical helper, reused here so
// the Contact section's heading (copied onto these pages from the homepage)
// animates identically. Optional `delay` (ms) holds off adding the trigger
// class after the element becomes visible — for short text (few
// letters/words), the whole cascade finishes almost instantly, so on a page
// that opens behind its own load transition (see page-transition.js) it can
// be entirely over before that wipe even clears, making it look like it
// never animated at all. A delay lets it play out in the clear instead.
function setupOneTimeLetterReveal(selector, delay) {
  const el = document.querySelector(selector);
  if (!el) return;
  const letterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (delay) {
          setTimeout(() => entry.target.classList.add('reveal-letters'), delay);
        } else {
          entry.target.classList.add('reveal-letters');
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  letterObserver.observe(el);
}

// Splits an element's text into individually-masked letters (space runs get
// a plain width-only mask instead of a letter). Same technique script.js
// uses for the homepage's work-list category/year labels — reused here for
// project.html's title and section headings, whose text is set dynamically
// so it can't just be hand-authored as static markup like the Contact
// section's heading is.
function wrapLettersInMask(el) {
  const words = el.textContent.split(' ');
  el.textContent = '';
  let i = 0;
  words.forEach((word, wordIndex) => {
    if (wordIndex > 0) {
      const spaceMask = document.createElement('span');
      spaceMask.className = 'letter-mask space';
      spaceMask.style.setProperty('--i', i);
      spaceMask.innerHTML = '&nbsp;';
      el.appendChild(spaceMask);
      i++;
    }
    // Each word's letters live inside their own inline-block wrapper —
    // otherwise adjacent .letter-mask spans (each an inline-block in its
    // own right) are valid line-break points by default, so a long title
    // can wrap mid-word ("CA-MPUS") instead of only at the real spaces.
    const wordWrap = document.createElement('span');
    wordWrap.className = 'letter-mask-word';
    for (const ch of word) {
      const mask = document.createElement('span');
      mask.className = 'letter-mask';
      mask.style.setProperty('--i', i);
      const letter = document.createElement('span');
      letter.className = 'letter';
      letter.textContent = ch;
      mask.appendChild(letter);
      wordWrap.appendChild(mask);
      i++;
    }
    el.appendChild(wordWrap);
  });
}

// Same masked-reveal idea, but per word instead of per letter — each word
// climbs up out of its own mask, staggered by --i. Also copied from script.js
// for the Contact section's copy paragraph.
function wrapWordsInMask(el) {
  const words = el.textContent.split(' ');
  el.textContent = '';
  words.forEach((word, i) => {
    if (i > 0) el.appendChild(document.createTextNode(' '));
    const mask = document.createElement('span');
    mask.className = 'word-mask';
    mask.style.setProperty('--i', i);
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.textContent = word;
    mask.appendChild(wordEl);
    el.appendChild(mask);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('.smooth-scroll');
  if (el) window.pageSmoothScroll = new SmoothScroll(el);

  // Scroll-reveal fade for elements marked .hidden (same mechanism as
  // script.js). .btn-reveal buttons get their own one-time observer below
  // instead, so scrolling back up doesn't replay their entrance animation.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('show', entry.isIntersecting);
    });
  });
  document.querySelectorAll('.hidden:not(.btn-reveal)').forEach((hiddenEl) => revealObserver.observe(hiddenEl));

  const buttonRevealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  });
  document.querySelectorAll('.btn-reveal').forEach((btnEl) => buttonRevealObserver.observe(btnEl));

  setupOneTimeLetterReveal('.contact-title');

  const contactCopyEl = document.querySelector('.contact-copy');
  if (contactCopyEl) {
    wrapWordsInMask(contactCopyEl);
    setupOneTimeLetterReveal('.contact-copy');
  }
});

// Images/video metadata and any page-specific script that reflows content
// (filters, injected project details, etc.) can change scrollHeight after
// DOMContentLoaded — resync once everything has settled.
window.addEventListener('load', () => {
  if (window.pageSmoothScroll) window.pageSmoothScroll.recalculate();
});
