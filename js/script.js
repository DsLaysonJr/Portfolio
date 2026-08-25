function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

class SmoothScroll {
  constructor(el) {
    this.el = el;
    this.currentY = 0;
    this.targetY = 0;
    this.maxScrollY = this.el.scrollHeight - window.innerHeight; // Calculate the maximum scroll value dynamically
    this.sidebar = document.querySelector('.sidebar');
    this.leftSection = document.querySelector('.left_section');
    this.setup();
    this.onWindowResize();
    this.animate();
  }

  setup() {
    document.body.style.height = `${this.el.scrollHeight}px`;
    window.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false }); // Prevent default scroll behavior
    
    // Add touch support for mobile devices
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      e.preventDefault();
      // A modal is open, or a pinned note is being dragged to rearrange it —
      // don't let the page scroll-jack underneath either one. See
      // corkboard.js's openModal/closeModal and makeNoteDraggable.
      if (document.body.classList.contains('corkboard-modal-open') || document.body.classList.contains('corkboard-dragging')) return;
      touchEndY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchEndY) * 2; // Multiply for more sensitivity
      this.targetY += deltaY;
      this.targetY = Math.min(Math.max(this.targetY, 0), this.maxScrollY);
      touchStartY = touchEndY;
    }, { passive: false });
  }

  onScroll() {
    window.scrollTo(0, 0); // Keep the body scroll position at the top
  }

  onWheel(e) {
    e.preventDefault(); // Prevent default scroll behavior
    if (document.body.classList.contains('corkboard-modal-open') || document.body.classList.contains('corkboard-dragging')) return;
    this.targetY += e.deltaY;
    this.targetY = Math.min(Math.max(this.targetY, 0), this.maxScrollY); // Limit the targetY value
  }

  onWindowResize() {
    window.addEventListener('resize', () => {
      this.maxScrollY = this.el.scrollHeight - window.innerHeight; // Recalculate the maximum scroll value on resize
      document.body.style.height = `${this.el.scrollHeight}px`;
    });
  }

  animate() {
    const previousY = this.currentY;
    this.currentY = lerp(this.currentY, this.targetY, 0.075);
    this.currentY = Math.min(Math.max(this.currentY, 0), this.maxScrollY); // Limit the translate3d value
    this.el.style.transform = `translate3d(0, -${this.currentY}px, 0)`;

    // Content keeps sliding under a mouse that hasn't actually moved, which makes the
    // browser fire spurious mouseover/mouseout as targets pass beneath the pointer
    // (seen as the custom cursor / nav underline / work preview flickering while scrolling).
    // Muting pointer-events while the transform is still animating stops that hit-testing.
    const isAnimating = Math.abs(this.currentY - previousY) > 0.05;
    document.body.classList.toggle('is-scrolling', isAnimating);

    // Show or hide the sidebar based on scroll position and screen size
    // Only show sidebar if not in preloader and on mobile screens
    if (this.currentY >= 100 && window.innerWidth < 992 && !document.body.classList.contains('preload-active')) {
      this.sidebar.classList.add('show');
    } else if (window.innerWidth >= 992) {
      this.sidebar.classList.remove('show');
    } else {
      this.sidebar.classList.remove('show');
    }

    // Ensure the sidebar follows the screen
    this.sidebar.style.transform = `translateY(${this.currentY}px)`;

    // The logo itself lives outside .smooth-scroll now (see index.html) so it
    // stays put on its own — just swap it to black once it's scrolled onto
    // the white content background below the hero (a white logo disappears
    // on a white background otherwise).
    if (this.leftSection) {
      const heroHeight = window.innerHeight;
      this.leftSection.classList.toggle('on-light', this.currentY > heroHeight - 90);
    }

    // Parallax effect with enhanced scaling for mobile
    const parallax = document.querySelector('.parallax .bg');
    const hotspot = document.querySelector('.headset-hotspot');
    if (parallax) {
      parallax.style.transform = `translateX(-50%) translateY(${this.currentY * 0.3}px)`;
      if (hotspot) hotspot.style.transform = `translateY(${this.currentY * 0.3}px)`;
    }

    this.updateAboutWordReveal();
    this.updateFooterParallax();

    requestAnimationFrame(this.animate.bind(this));
  }

  // .footer-parallax is fixed (see index.html/footer.css) — it's always
  // filling the viewport, so its own getBoundingClientRect never moves.
  // .footer-reveal-spacer is what actually scrolls, uncovering it as it
  // passes through the viewport; we track the spacer's position for
  // progress, then drift the logo/tagline inside with the same
  // currentY-driven translateY technique as the hero's .parallax .bg,
  // scaled to this section's own reveal window.
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

  updateAboutWordReveal() {
    if (!this._revealWords) {
      this._revealWords = document.querySelectorAll('.reveal-word');
      this._aboutCopy = document.querySelector('.about-copy');
    }
    if (!this._aboutCopy || this._revealWords.length === 0) return;

    const rect = this._aboutCopy.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const sectionCenter = rect.top + rect.height / 2;
    const startY = viewportH;
    const endY = viewportH / 2;
    let progress = (startY - sectionCenter) / (startY - endY);
    progress = Math.min(Math.max(progress, 0), 1);

    const count = this._revealWords.length;
    this._revealWords.forEach((word, i) => {
      const wordProgress = Math.min(Math.max(progress * count - i, 0), 1);
      word.style.opacity = 0.2 + wordProgress * 0.8;
    });
  }

  smoothScrollToSection(targetId) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // rect.top is relative to the viewport, and the transform on .smooth-scroll
    // has already shifted everything up by currentY — adding currentY back
    // recovers the section's true offset within the untransformed content, so
    // this always matches the section's real position instead of a stale guess.
    const rect = targetEl.getBoundingClientRect();
    const targetPosition = Math.min(Math.max(rect.top + this.currentY, 0), this.maxScrollY);

    const startPosition = this.currentY;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1);
      const ease = t * (2 - t);
      this.targetY = startPosition + distance * ease;
      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        // Ensure the final position is set correctly
        this.targetY = targetPosition;
      }
    };

    requestAnimationFrame(step);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Add screen size warning - updated threshold for better mobile experience
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  // Preloader
  const preloaderEl = document.querySelector(".preload");
  const countEl = document.querySelector(".count");
  const preloaderDuration = 4200; // ms — how long the counter takes to reach 100%
  const HOME_NAV_FLAG = 'dlj_internal_nav'; // set by page-transition.js right before it navigates here

  function initSmoothScroll() {
    const smoothScroll = new SmoothScroll(document.querySelector('.smooth-scroll'));
    smoothScroll.setup();
    smoothScroll.onWindowResize();

    document.querySelectorAll('.sidebar__link, .right_section a, .footer-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#') || href.length < 2) return;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScroll.smoothScrollToSection(href.slice(1));
      });
    });

    // Arriving here with a #section already in the URL — e.g. the works/
    // project pages' footer links, which point at index.html#About etc. — the
    // fake-scroll rig's own onScroll handler resets native scroll to 0 every
    // frame, so the browser's native jump-to-anchor never sticks; drive it to
    // the right section ourselves instead.
    if (location.hash.length > 1) {
      smoothScroll.smoothScrollToSection(location.hash.slice(1));
    }
  }

  function getNavigationType() {
    try {
      const entries = performance.getEntriesByType('navigation');
      if (entries && entries[0]) return entries[0].type;
    } catch (e) {
      // Navigation Timing API unavailable — fall through to the default below.
    }
    return null;
  }

  // The counting preloader is a several-second animation meant to play on a
  // genuine fresh arrival (first visit, a typed URL, or an actual reload) —
  // not every time the homepage document loads, since that also happens when
  // the visitor just came back from another page via the logo/nav links
  // (which navigate here rather than being a same-page SPA route) or the
  // browser's own back/forward. This check runs as soon as the DOM is ready
  // (not gated behind `load`, which can be delayed by slow external
  // resources) so the wipe-layer show/hide call below never has to wait
  // long enough to flash.
  const cameFromInternalNav = sessionStorage.getItem(HOME_NAV_FLAG) === '1';
  sessionStorage.removeItem(HOME_NAV_FLAG); // one-shot — a reload right after must not also skip
  const skipPreloader = cameFromInternalNav || getNavigationType() === 'back_forward';

  if (skipPreloader) {
    preloaderEl.style.display = 'none';
    if (window.pageWipeReveal) window.pageWipeReveal();
    initSmoothScroll();
  } else {
    if (window.pageWipeForceHidden) window.pageWipeForceHidden();

    window.addEventListener("load", () => {
      document.body.classList.add('preload-active'); // Add class to prevent scrolling
      document.querySelector('.smooth-scroll').classList.add('preload-active'); // Add class to prevent scrolling

      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / preloaderDuration, 1);
        const num = Math.round(progress * 100);
        countEl.textContent = num;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          finishPreloader();
        }
      }
      requestAnimationFrame(tick);

      function finishPreloader() {
        preloaderEl.classList.add('is-done'); // triggers the slide-up exit + fade

        setTimeout(() => {
          document.body.classList.remove('preload-active');
          document.querySelector('.smooth-scroll').classList.remove('preload-active');
          preloaderEl.style.display = 'none';
        }, 1000); // matches the CSS exit transition duration

        initSmoothScroll();
      }
    });
  }

  // Disable scrolling during preloader phase
  window.addEventListener('scroll', (e) => {
    if (document.body.classList.contains('preload-active')) {
      e.preventDefault();
      window.scrollTo(0, 0);
    }
  });

  // Navbar hover effect - only on desktop
  if (window.innerWidth >= 992) {
    const navLinks = document.querySelectorAll('.right_section a');

    navLinks.forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        link.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        link.style.transition = 'transform 0.1s ease'; // Smooth transition while moving
      });

      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translate(0, 0)';
        link.style.transition = 'transform 0.5s ease'; // Smooth transition back to original place
      });
    });

    // Logo hover effect - only on desktop
    const logo = document.querySelector('.logo');
    const logoText = document.querySelector('.logo-text');

    logo.addEventListener('mousemove', (e) => {
      const rect = logo.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      logo.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      logo.style.transition = 'transform 0.1s ease'; // Smooth transition while moving
      logoText.style.transform = `translate(${10 + x * 0.1}px, -50%)`; // Move the text with the logo
    });

    logo.addEventListener('mouseleave', () => {
      logo.style.transform = 'translate(0, 0)';
      logo.style.transition = 'transform 0.5s ease'; // Smooth transition back to original place
      logoText.style.transform = 'translate(10px, -50%)'; // Reset the text position
    });

    logoText.addEventListener('mousemove', (e) => {
      e.stopPropagation(); // Prevent the hover effect on the text itself
    });
  }

  // Make the logo clickable to reload the page
  const logoLink = document.querySelector('.logo-link');
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.pageTransitionNavigate) window.pageTransitionNavigate('index.html');
    else window.location.reload();
  });
});

function checkScreenSize() {
  const warning = document.getElementById('screen-warning');
  // Removed the screen size warning as we're now making it responsive
  if (warning) {
    warning.remove();
  }
}

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
});

// Buttons (.btn-reveal) get their own observer further down that reveals once
// and then stops watching, so scrolling back up doesn't replay the animation.
const hiddenElements = document.querySelectorAll('.hidden:not(.btn-reveal)');
hiddenElements.forEach((el) => observer.observe(el));

const buttonRevealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      obs.unobserve(entry.target);
    }
  });
});
document.querySelectorAll('.btn-reveal').forEach((el) => buttonRevealObserver.observe(el));

// One-time letter-cascade reveal, triggered once when the element scrolls into
// view — shared by the "ABOUT ME" header and the "RECENT WORKS" title so both
// animate identically.
function setupOneTimeLetterReveal(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const letterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-letters');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  letterObserver.observe(el);
}

setupOneTimeLetterReveal('.about-header');
setupOneTimeLetterReveal('.works-title');
setupOneTimeLetterReveal('.corkboard-title');
setupOneTimeLetterReveal('.contact-title');

// Split work-list category/year labels into letter-mask spans, reusing the same
// reveal mechanism as "ABOUT ME" — triggered by .work-row:hover in CSS instead.
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

document.querySelectorAll('.work-category, .work-year').forEach(wrapLettersInMask);

// Same masked-reveal idea as wrapLettersInMask, but per word instead of per
// letter — each word climbs up out of its own mask, staggered by --i.
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

const contactCopyEl = document.querySelector('.contact-copy');
if (contactCopyEl) {
  wrapWordsInMask(contactCopyEl);
  setupOneTimeLetterReveal('.contact-copy');
}

// Clicking a work row opens its dedicated project page — unconditional (not
// gated behind the fine-pointer/hover check above) so it also works on touch.
document.querySelectorAll('.work-row').forEach((row) => {
  row.addEventListener('click', () => {
    const media = row.querySelector('img, video');
    const projectId = media && media.dataset.projectId;
    if (!projectId) return;
    const url = `project.html?id=${projectId}`;
    if (window.pageTransitionNavigate) window.pageTransitionNavigate(url);
    else window.location.href = url;
  });
});

// Below this width .work-row switches to a plain stacked layout (see
// breakpoints.css) instead of the desktop hover trick, so fitWorkTitles'
// shrink-to-fit + absolute label-offset math below (tuned for wide,
// single-line rows) is skipped there rather than producing offscreen labels.
const WORK_ROW_MOBILE_BREAKPOINT = 768;

// A few titles are long enough that even wrapped text feels cramped in a
// narrow row — data-short (set in HTML) swaps those for a short label below
// phone width, and back to the full title above it.
const shortTitleQuery = window.matchMedia('(max-width: 480px)');
function applyShortTitles() {
  document.querySelectorAll('.work-title-fit[data-short]').forEach((fit) => {
    if (!fit.dataset.full) fit.dataset.full = fit.textContent;
    fit.textContent = shortTitleQuery.matches ? fit.dataset.short : fit.dataset.full;
  });
}
applyShortTitles();
shortTitleQuery.addEventListener('change', () => {
  applyShortTitles();
  fitWorkTitles();
});

// Shrink work-titles (uniformly, never stretched) just enough that the longest
// one still fits on one line within its row — every title shares the same
// font-size, so shorter titles stay proportional instead of being stretched wide.
// Also ties row height and the category/year label positions to that same
// computed size, so rows sit close together and the labels hug the title
// instead of sitting at fixed, title-length-agnostic offsets.
function fitWorkTitles() {
  applyShortTitles();
  const fits = document.querySelectorAll('.work-title-fit');
  if (!fits.length) return;

  fits.forEach((fit) => { fit.style.fontSize = ''; });

  if (window.innerWidth <= WORK_ROW_MOBILE_BREAKPOINT) {
    document.querySelectorAll('.work-row').forEach((row) => {
      row.style.height = '';
      const category = row.querySelector('.work-category');
      const year = row.querySelector('.work-year');
      if (category) category.style.right = '';
      if (year) year.style.left = '';
    });
    return;
  }

  let minRatio = 1;
  fits.forEach((fit) => {
    const container = fit.closest('.work-title');
    const containerWidth = container.clientWidth;
    const naturalWidth = fit.getBoundingClientRect().width;
    if (naturalWidth > containerWidth) {
      const ratio = containerWidth / naturalWidth;
      if (ratio < minRatio) minRatio = ratio;
    }
  });

  const baseFontSize = parseFloat(getComputedStyle(fits[0]).fontSize);
  const fittedFontSize = baseFontSize * minRatio;

  if (minRatio < 1) {
    fits.forEach((fit) => { fit.style.fontSize = `${fittedFontSize}px`; });
  }

  const rowHeight = Math.max(fittedFontSize * 1.7, 60);
  const labelGap = 60;

  fits.forEach((fit) => {
    const row = fit.closest('.work-row');
    row.style.height = `${rowHeight}px`;

    const category = row.querySelector('.work-category');
    const year = row.querySelector('.work-year');
    const rowWidth = row.clientWidth;
    const titleWidth = fit.getBoundingClientRect().width;
    const offset = rowWidth / 2 + titleWidth / 2 + labelGap;
    if (category) category.style.right = `${offset}px`;
    if (year) year.style.left = `${offset}px`;
  });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(fitWorkTitles);
} else {
  fitWorkTitles();
}
window.addEventListener('resize', fitWorkTitles);

// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.location.reload();
  }, 500);
});

// Optimize performance for mobile devices
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  // Reduce animation complexity on mobile
  document.documentElement.style.setProperty('--animation-duration', '0.5s');
  
  // Disable parallax on mobile for better performance
  const parallaxElements = document.querySelectorAll('.parallax');
  parallaxElements.forEach(el => {
    el.style.transform = 'none';
  });
}

// Custom square cursor — desktop (fine pointer) only, so touch devices keep native tap behavior
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cursor = document.querySelector('.custom-cursor');

  if (cursor) {
    document.body.classList.add('custom-cursor-active');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let cursorX = targetX;
    let cursorY = targetY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursor.classList.add('is-visible');
    });

    function renderCursor() {
      cursorX += (targetX - cursorX) * 0.2;
      cursorY += (targetY - cursorY) * 0.2;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
    });

    // Pinned notes ([data-note-id]) are locally draggable now too (see
    // corkboard.js's makeNoteDraggable), same as the one being actively
    // placed (.is-placing) — the square cursor hides for both, letting the
    // note's native grab/grabbing icon (see corkboard.css) show through.
    const clickableSelector = 'a, button, input, textarea, select, [role="button"], .link_nav, .sidebar__link, .work-row, .corkboard-note.is-placing, .corkboard-note[data-note-id]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(clickableSelector)) {
        cursor.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const leftClickable = e.target.closest(clickableSelector);
      const enteredClickable = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(clickableSelector);
      if (leftClickable && !enteredClickable) {
        cursor.classList.remove('is-hovering');
      }
    });

    const musicHotspot = document.querySelector('.headset-hotspot');
    const audio = document.getElementById('bg-music');

    if (musicHotspot && audio) {
      musicHotspot.addEventListener('mouseenter', () => {
        cursor.classList.remove('is-hovering');
        cursor.classList.add('is-music-hover');
      });

      musicHotspot.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-music-hover');
      });

      musicHotspot.addEventListener('click', () => {
        if (audio.paused) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      });
    }

    const workPreview = document.querySelector('.work-preview');
    const workPreviewImg = document.querySelector('.work-preview-img');
    const workRows = document.querySelectorAll('.work-row');

    if (workPreview && workPreviewImg && workRows.length) {
      // Pixel-mosaic reveal: build the tile grid once. Each tile is a small
      // <canvas> painted with its own slice of the current row's media —
      // photo or video, cropped the same way object-fit: cover would — and
      // pops in at its own randomized delay, so the media assembles out of
      // scattered squares. Video tiles are repainted every frame so the
      // mosaic shows live, moving footage instead of a single frozen frame.
      const previewTiles = workPreview.querySelector('.work-preview-tiles');
      const previewVideo = workPreview.querySelector('.work-preview-video');
      const previewCols = 8;
      const previewRows = 6;
      const previewTileEls = [];
      const previewTileCtx = [];
      let paintTiles = null;

      if (previewTiles) {
        const previewRect = workPreview.getBoundingClientRect();
        const tileW = Math.max(1, Math.round(previewRect.width / previewCols)) || 30;
        const tileH = Math.max(1, Math.round(previewRect.height / previewRows)) || 50;
        const previewAspect = (previewRect.width || tileW * previewCols) / (previewRect.height || tileH * previewRows);

        for (let row = 0; row < previewRows; row++) {
          for (let col = 0; col < previewCols; col++) {
            const tile = document.createElement('canvas');
            tile.className = 'work-preview-tile';
            tile.width = tileW;
            tile.height = tileH;
            tile.dataset.col = col;
            tile.dataset.row = row;
            tile.style.setProperty('--delay', `${(Math.random() * 1.4).toFixed(2)}s`);
            previewTiles.appendChild(tile);
            previewTileEls.push(tile);
            previewTileCtx.push(tile.getContext('2d'));
          }
        }

        // Paints every tile with its slice of `source` (an <img> or <video>),
        // cropped from the center the same way CSS object-fit: cover would.
        paintTiles = function (source, naturalW, naturalH) {
          if (!naturalW || !naturalH) return;
          const mediaAspect = naturalW / naturalH;
          let cropW, cropH, offsetX, offsetY;
          if (mediaAspect > previewAspect) {
            cropH = naturalH;
            cropW = naturalH * previewAspect;
            offsetX = (naturalW - cropW) / 2;
            offsetY = 0;
          } else {
            cropW = naturalW;
            cropH = naturalW / previewAspect;
            offsetX = 0;
            offsetY = (naturalH - cropH) / 2;
          }
          const sliceW = cropW / previewCols;
          const sliceH = cropH / previewRows;

          previewTileEls.forEach((tile, i) => {
            const col = Number(tile.dataset.col);
            const row = Number(tile.dataset.row);
            previewTileCtx[i].drawImage(
              source,
              offsetX + col * sliceW, offsetY + row * sliceH, sliceW, sliceH,
              0, 0, tile.width, tile.height
            );
          });
        };
      }

      let previewTargetX = 0;
      let previewTargetY = 0;
      let previewX = 0;
      let previewY = 0;

      window.addEventListener('mousemove', (e) => {
        previewTargetX = e.clientX;
        previewTargetY = e.clientY;
      });

      let activeRow = null;
      let videoDrawRAF = null;

      function stopVideoDraw() {
        if (videoDrawRAF !== null) {
          cancelAnimationFrame(videoDrawRAF);
          videoDrawRAF = null;
        }
      }

      function startVideoDraw() {
        stopVideoDraw();
        function draw() {
          if (previewVideo.readyState >= 2) {
            paintTiles(previewVideo, previewVideo.videoWidth, previewVideo.videoHeight);
          }
          videoDrawRAF = requestAnimationFrame(draw);
        }
        videoDrawRAF = requestAnimationFrame(draw);
      }

      function showRowPreview(row) {
        const media = row.querySelector('img, video');
        if (!media || !paintTiles) return;
        activeRow = row;

        const isVideo = media.tagName === 'VIDEO';

        if (isVideo && previewVideo) {
          stopVideoDraw();
          if (previewVideo.getAttribute('src') !== media.currentSrc) {
            previewVideo.src = media.currentSrc;
          }
          previewVideo.currentTime = 0;
          previewVideo.play().catch(() => {});
          if (previewVideo.readyState >= 1) {
            startVideoDraw();
          } else {
            previewVideo.addEventListener('loadedmetadata', startVideoDraw, { once: true });
          }
        } else {
          stopVideoDraw();
          if (previewVideo) previewVideo.pause();
          workPreviewImg.src = media.src;
          if (workPreviewImg.complete && workPreviewImg.naturalWidth) {
            paintTiles(workPreviewImg, workPreviewImg.naturalWidth, workPreviewImg.naturalHeight);
          } else {
            workPreviewImg.addEventListener('load', () => {
              paintTiles(workPreviewImg, workPreviewImg.naturalWidth, workPreviewImg.naturalHeight);
            }, { once: true });
          }
        }

        // Drop is-visible first so the tiles snap back to hidden (transition:
        // none at rest), then re-add on the next frame so the staggered pop-in
        // plays again from scratch — otherwise switching rows mid-reveal (or
        // re-syncing after a scroll, below) would leave it just sitting "shown".
        workPreview.classList.remove('is-visible');
        void workPreview.offsetWidth;
        workPreview.classList.add('is-visible');
      }

      function hideRowPreview() {
        activeRow = null;
        workPreview.classList.remove('is-visible');
        if (previewVideo) previewVideo.pause();
        stopVideoDraw();
      }

      workRows.forEach((row) => {
        row.addEventListener('mouseenter', () => showRowPreview(row));
        row.addEventListener('mouseleave', () => {
          if (activeRow === row) hideRowPreview();
        });
      });

      // The fake-scroll (smoothscroll.js) slides rows underneath a mouse that
      // never actually moved, which is why pointer-events get suspended during
      // it (see body.is-scrolling in main.css) — but that also means whatever
      // row was hovered when scrolling started just sits there, stale, with no
      // mouseleave/mouseenter to update it. Once scrolling settles, re-check
      // what's actually under the cursor now and sync the preview to match.
      let wasScrolling = false;

      function renderWorkPreview() {
        previewX += (previewTargetX - previewX) * 0.15;
        previewY += (previewTargetY - previewY) * 0.15;
        workPreview.style.transform = `translate(${previewX}px, ${previewY}px)`;

        const isScrolling = document.body.classList.contains('is-scrolling');
        if (isScrolling && !wasScrolling) {
          hideRowPreview();
        } else if (!isScrolling && wasScrolling) {
          const el = document.elementFromPoint(previewTargetX, previewTargetY);
          const row = el ? el.closest('.work-row') : null;
          if (row) {
            showRowPreview(row);
          } else {
            hideRowPreview();
          }
        }
        wasScrolling = isScrolling;

        requestAnimationFrame(renderWorkPreview);
      }
      requestAnimationFrame(renderWorkPreview);
    }
  }
}