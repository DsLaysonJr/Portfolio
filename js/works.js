// Recent Works listing page — uses the shared fake-scroll rig (smoothscroll.js)
// rather than script.js, since that file's DOMContentLoaded handler assumes
// homepage-only elements (preloader, parallax hero) that don't exist here.
// smoothscroll.js also covers the generic .hidden/.btn-reveal scroll-reveal
// fades shared with the homepage, so this file only needs its own filter/
// hover-preview logic. The custom cursor / hover-preview / title auto-fit
// pieces below are copied from script.js because they're self-contained and
// don't depend on the fake-scroll rig.

document.addEventListener('DOMContentLoaded', () => {
  // Category filter — a custom multi-select dropdown (checkboxes in a panel)
  // instead of a row of pill buttons. No selection = show everything;
  // otherwise a row shows if it matches ANY checked category.
  const filterMultiselect = document.getElementById('worksFilterMultiselect');
  const filterToggle = document.getElementById('worksFilterToggle');
  const filterPanel = document.getElementById('worksFilterPanel');
  const filterLabelBase = document.getElementById('worksFilterLabelBase');
  const filterLabelGhost = document.getElementById('worksFilterLabelGhost');
  const filterClear = document.getElementById('worksFilterClear');
  const rows = document.querySelectorAll('.work-row');

  if (filterMultiselect && filterToggle && filterPanel && filterLabelBase && filterLabelGhost) {
    const filterCheckboxes = [...filterPanel.querySelectorAll('input[type="checkbox"]')];

    function setLabel(text) {
      // .btn-pill's hover effect (see main.css) swaps between these two
      // spans, so both need the same text kept in sync.
      filterLabelBase.textContent = text;
      filterLabelGhost.textContent = text;
    }

    function applyFilter() {
      const checked = filterCheckboxes.filter((cb) => cb.checked);
      const checkedValues = checked.map((cb) => cb.value);

      rows.forEach((row) => {
        const tags = (row.dataset.tags || '').split(' ');
        const matches = checkedValues.length === 0 || checkedValues.some((v) => tags.includes(v));
        row.classList.toggle('is-filtered-out', !matches);
      });
      fitWorkTitles();
      // Filtering changes the page's total scrollable height — resync the
      // fake-scroll rig's max scroll so it doesn't still allow scrolling past
      // the now-shorter (or longer) list.
      if (window.pageSmoothScroll) window.pageSmoothScroll.recalculate();

      if (checked.length === 0) {
        setLabel('All');
      } else if (checked.length === 1) {
        setLabel(checked[0].nextElementSibling.textContent);
      } else {
        setLabel(`${checked.length} Selected`);
      }
    }

    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = filterMultiselect.classList.toggle('is-open');
      filterToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#worksFilterMultiselect')) {
        filterMultiselect.classList.remove('is-open');
        filterToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        filterMultiselect.classList.remove('is-open');
        filterToggle.setAttribute('aria-expanded', 'false');
      }
    });

    filterCheckboxes.forEach((cb) => cb.addEventListener('change', applyFilter));

    if (filterClear) {
      filterClear.addEventListener('click', () => {
        filterCheckboxes.forEach((cb) => { cb.checked = false; });
        applyFilter();
      });
    }
  }
});

// Split work-list category/year labels into letter-mask spans (hover reveal, CSS-driven)
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

// Clicking a work row opens its dedicated project page — unconditional (not
// gated behind the fine-pointer/hover check below) so it also works on touch.
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
// breakpoints.css) instead of the desktop hover trick — same reasoning as
// script.js's homepage copy of this constant/function.
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

// Shrink visible work-titles uniformly to fit their row (never stretched) —
// same behavior as script.js's homepage version, but scoped to rows the
// current filter hasn't hidden.
function fitWorkTitles() {
  applyShortTitles();
  document.querySelectorAll('.work-title-fit').forEach((fit) => { fit.style.fontSize = ''; });

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

  const fits = document.querySelectorAll('.work-row:not(.is-filtered-out) .work-title-fit');
  if (!fits.length) return;

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

// Custom square cursor — desktop (fine pointer) only (copied from script.js)
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

    const clickableSelector = 'a, button, input, textarea, select, [role="button"], .work-row';

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
        // plays again from scratch — otherwise switching rows mid-reveal would
        // leave it just sitting "shown" instead of replaying.
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

      workRows.forEach((row) => {
        row.addEventListener('mouseenter', () => showRowPreview(row));
        row.addEventListener('mouseleave', () => {
          if (activeRow === row) hideRowPreview();
        });
      });
    }
  }
}
