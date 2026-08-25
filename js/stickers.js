// Cursor sticker trail — active only while the preloader (.preload,
// body.preload-active) is on screen. As the mouse moves, drops a random
// sticker at that spot (throttled by distance traveled, not raw mousemove
// frequency, so it reads as a trail rather than a flood). Stickers stay put
// once placed; a rolling cap of 6 on screen at once is enforced — spawning a
// 7th fades out and removes the oldest. Once the preloader finishes, any
// remaining stickers fade out with it instead of lingering into the site.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.sticker-trail');
    if (!container) return;

    const stickerSources = [
      'stickers/DSLJ LOGO 4 [Vectorized].png',
      'stickers/Group 1079 1.png',
      'stickers/Group 1293.png',
      'stickers/Group 1294.png',
      'stickers/Group 1295.png',
      'stickers/Group 1296.png',
      'stickers/Group 1297.png',
      'stickers/Group 1298.png',
      'stickers/Group 9.png',
      'stickers/HariSticker 1.png',
      'stickers/Pixel Art Generator.png',
      'stickers/Pixel Art Generator-1.png',
      'stickers/Pixel Art Generator-2.png',
      'stickers/Pixel Art Generator-3.png',
      'stickers/Pixel Art Generator-4.png',
      'stickers/Pixel Art Generator-5.png',
      'stickers/campus-leader-white 1.png',
      'stickers/image 9 [Vectorized].png'
    ];

    const MAX_STICKERS = 6;
    const MIN_DISTANCE = 140; // px the mouse must travel before the next sticker drops

    const active = [];
    let lastX = null;
    let lastY = null;

    // Shuffle-bag: every sticker gets used once before any repeat, instead of
    // plain random picks which can land on the same one several times in a row.
    let stickerBag = [];
    let lastStickerSrc = null;

    function refillStickerBag() {
      stickerBag = stickerSources.slice();
      for (let i = stickerBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stickerBag[i], stickerBag[j]] = [stickerBag[j], stickerBag[i]];
      }
      // Avoid the same sticker landing back-to-back across a bag refill.
      if (stickerBag.length > 1 && stickerBag[stickerBag.length - 1] === lastStickerSrc) {
        const swapIndex = Math.floor(Math.random() * (stickerBag.length - 1));
        [stickerBag[stickerBag.length - 1], stickerBag[swapIndex]] = [stickerBag[swapIndex], stickerBag[stickerBag.length - 1]];
      }
    }

    function nextStickerSrc() {
      if (stickerBag.length === 0) refillStickerBag();
      lastStickerSrc = stickerBag.pop();
      return lastStickerSrc;
    }

    function isPreloading() {
      return document.body.classList.contains('preload-active');
    }

    function spawnSticker(x, y) {
      const img = document.createElement('img');
      img.className = 'sticker-trail-item';
      const path = nextStickerSrc();
      // Encode each path segment individually — encodeURI leaves "[" and "]"
      // (used in a couple of these filenames) un-escaped, which some servers 404 on.
      img.src = path.split('/').map(encodeURIComponent).join('/');
      img.alt = '';
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.setProperty('--rotate', `${(Math.random() * 30 - 15).toFixed(1)}deg`);
      container.appendChild(img);
      active.push(img);

      // Double rAF, not single — a single frame can get coalesced with the
      // insert itself (no committed "before" state for the transition to
      // animate from), which is what made the pop-in intermittently skip
      // straight to its end state instead of animating smoothly.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => img.classList.add('is-visible'));
      });

      if (active.length > MAX_STICKERS) {
        const oldest = active.shift();
        oldest.classList.add('is-leaving');
        oldest.addEventListener('transitionend', () => oldest.remove(), { once: true });
      }
    }

    function clearStickers() {
      active.forEach((img) => {
        img.classList.add('is-leaving');
        img.addEventListener('transitionend', () => img.remove(), { once: true });
      });
      active.length = 0;
      lastX = null;
      lastY = null;
    }

    window.addEventListener('mousemove', (e) => {
      if (!isPreloading()) return;

      if (lastX === null) {
        lastX = e.clientX;
        lastY = e.clientY;
        spawnSticker(e.clientX, e.clientY);
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.sqrt(dx * dx + dy * dy) >= MIN_DISTANCE) {
        lastX = e.clientX;
        lastY = e.clientY;
        spawnSticker(e.clientX, e.clientY);
      }
    });

    // The preloader removes body.preload-active once it's done (see
    // script.js) — when that happens, clear out any stickers left over so
    // they don't linger into the revealed site.
    new MutationObserver(() => {
      if (!isPreloading() && active.length) {
        clearStickers();
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  });
}
