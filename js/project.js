// Dedicated project detail page — reads ?id= from the URL and renders that
// project's data (from projects.js) into the page. Replaces the old
// click-to-open modal so each project has its own shareable/bookmarkable URL.
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const projectIndex = projects.findIndex((p) => p.id === id);
  const project = projects[projectIndex];

  if (!project) {
    document.querySelector('.project-main').innerHTML = '<p class="project-not-found">Project not found.</p>';
    document.getElementById('nextProjectSection')?.remove();
    return;
  }

  document.title = `${project.title} — Dennis Layson Jr.`;

  // Category/year text is dynamic, so it's wrapped here rather than
  // hand-authored in HTML. Word-mask, not letter-mask — some categories
  // ("UI / UX / Frontend / Branding") are long enough to wrap onto a second
  // line, and letter-mask's fixed per-letter height clips wrapped lines.
  // Delayed ~900ms (past the page-transition wipe's own ~800ms reveal — see
  // page-transition.css) so the cascade actually plays somewhere visible
  // instead of finishing while the wipe still covers the page.
  const categoryEl = document.getElementById('projectCategory');
  categoryEl.textContent = project.category;
  wrapWordsInMask(categoryEl);
  setupOneTimeLetterReveal('#projectCategory', 900);

  const yearEl = document.getElementById('projectYear');
  yearEl.textContent = project.year;
  wrapWordsInMask(yearEl);
  setupOneTimeLetterReveal('#projectYear', 900);

  document.getElementById('projectDescription').textContent = project.description;

  // `details` is authored as multiple paragraphs separated by a blank line
  // (see projects.js) — split and render as separate <p> tags instead of one
  // block so long case-study copy isn't a single dense wall of text.
  const detailsEl = document.getElementById('projectDetails');
  project.details.split('\n\n').forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    detailsEl.appendChild(p);
  });

  // Title text is dynamic (comes from projects.js), so it's wrapped in
  // letter-mask spans here rather than hand-authored in HTML like the
  // Contact section's heading — same one-time scroll-reveal as the rest of
  // the site's big headers (see main.css's .project-title.reveal-letters).
  const titleEl = document.getElementById('projectTitle');
  titleEl.textContent = project.title;
  wrapLettersInMask(titleEl);
  setupOneTimeLetterReveal('#projectTitle');

  // Overview, Technologies Used, and Key Achievements headings are all kept
  // plain (no letter-reveal) — only the big project title animates in.
  const techList = document.getElementById('projectTechList');
  project.technologies.forEach((tech) => {
    const badge = document.createElement('span');
    badge.className = 'project-tech-badge';
    badge.textContent = tech;
    techList.appendChild(badge);
  });

  const achievementsList = document.getElementById('projectAchievements');
  project.achievements.forEach((achievement) => {
    const li = document.createElement('li');
    li.textContent = achievement;
    achievementsList.appendChild(li);
  });

  // Right column: 3 stacked media items (falls back to repeating the single
  // `image` field for older project entries that don't define `images`), each
  // wired up with its own pixel-tile entrance that plays once scrolled into
  // view rather than immediately on load.
  const mediaCol = document.getElementById('projectMediaCol');
  const mediaSources = project.images && project.images.length
    ? project.images
    : [project.image, project.image, project.image];

  // The 2nd/3rd slots point at each project's works/<name>/2.* and 3.* files
  // (see projects.js) — placeholders for photos that haven't been dropped in
  // yet. `mediaSources[0]` is passed as a fallback so a missing 2nd/3rd file
  // quietly falls back to the main picture instead of showing a broken image.
  mediaSources.forEach((src) => {
    mediaCol.appendChild(buildPixelRevealMedia(src, project.title, 'project-hero', mediaSources[0]));
  });

  // Bottom-of-page "next project" prompt — wraps around to the first project
  // after the last one, so it's always available as a way to keep browsing.
  const nextProject = projects[(projectIndex + 1) % projects.length];
  const nextSection = document.getElementById('nextProjectSection');
  if (nextProject && nextSection) {
    document.getElementById('nextProjectLink').href = `project.html?id=${nextProject.id}`;

    const nextTitleEl = document.getElementById('nextProjectTitle');
    nextTitleEl.textContent = nextProject.title;

    document.getElementById('nextProjectDesc').textContent = nextProject.description;

    const nextMediaEl = document.getElementById('nextProjectMedia');
    const nextImg = document.getElementById('nextProjectImg');
    const nextVideo = document.getElementById('nextProjectVideo');
    const nextTiles = document.getElementById('nextProjectTiles');
    const nextSrc = (nextProject.images && nextProject.images[0]) || nextProject.image;
    setupMediaPixelReveal(nextMediaEl, nextImg, nextVideo, nextTiles, nextProject.title, nextSrc);
  } else if (nextSection) {
    nextSection.remove();
  }
});

// Builds one `.project-hero`-style block (img + video + tile-canvas layer)
// for the given media src and wires up its pixel reveal — used to fill in
// the right column's 3 media items from projects.js's `images` array.
function buildPixelRevealMedia(src, title, className, fallbackSrc) {
  const wrap = document.createElement('div');
  wrap.className = className;

  const img = document.createElement('img');
  img.className = `${className}-img`;
  const video = document.createElement('video');
  video.className = `${className}-video`;
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;

  const tiles = document.createElement('div');
  tiles.className = `${className}-tiles`;
  tiles.setAttribute('aria-hidden', 'true');

  wrap.append(img, video, tiles);
  setupMediaPixelReveal(wrap, img, video, tiles, title, src, fallbackSrc);
  return wrap;
}

// Wires up a single media block's pixel-mosaic entrance: paints tiles from
// the image/video as soon as it's decoded, but only pops them in (and hands
// off to the real element) once the block scrolls into view — same grid
// size, delay range, and tile-painting technique as script.js/works.js's
// work-list hover preview, adapted into a scroll-triggered "assemble when
// seen" effect instead of an eager one that plays immediately on load. Tiles
// are transparent canvases until painted with the real image, and stay
// invisible (opacity: 0) until popped in — so nothing ever shows the
// placeholder background, only ever the real media or nothing. Once every
// tile has popped in, the tile grid fades out and the real <img>/<video>
// (kept invisible until now — see project.css) fades in to take over, so
// video keeps playing normally afterward instead of staying frozen on a
// canvas-painted frame.
function setupMediaPixelReveal(heroEl, imgEl, videoEl, tilesContainer, title, src, fallbackSrc) {
  if (!tilesContainer) return;

  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  let mediaEl;
  if (isVideo) {
    videoEl.src = src;
    imgEl.remove();
    mediaEl = videoEl;
  } else {
    imgEl.src = src;
    imgEl.alt = title;
    videoEl.remove();
    mediaEl = imgEl;
    // Slots 2/3 point at a per-project folder (works/<name>/2.*, 3.*) meant
    // for photos that may not have been dropped in yet — fall back to the
    // main picture instead of showing a broken image until they are.
    if (fallbackSrc && fallbackSrc !== src) {
      imgEl.addEventListener('error', () => {
        imgEl.src = fallbackSrc;
      }, { once: true });
    }
  }

  const cols = 8;
  const rows = 6;
  const tiles = [];
  const ctxs = [];
  const maxDelay = 1400; // ms — matches works.js's Math.random() * 1.4 range

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = document.createElement('canvas');
      tile.className = `${tilesContainer.className.replace('-tiles', '-tile')}`;
      tile.dataset.col = col;
      tile.dataset.row = row;
      tile.style.setProperty('--delay', `${(Math.random() * (maxDelay / 1000)).toFixed(2)}s`);
      tilesContainer.appendChild(tile);
      tiles.push(tile);
      ctxs.push(tile.getContext('2d'));
    }
  }

  function sizeTiles() {
    const rect = heroEl.getBoundingClientRect();
    const tileW = Math.max(1, Math.round(rect.width / cols)) || 1;
    const tileH = Math.max(1, Math.round(rect.height / rows)) || 1;
    tiles.forEach((tile) => {
      tile.width = tileW;
      tile.height = tileH;
    });
    return { rectW: rect.width || tileW * cols, rectH: rect.height || tileH * rows };
  }

  // Crops `source` from its center the same way CSS object-fit: cover would,
  // then slices that crop into the tile grid — identical math to
  // works.js/script.js's paintTiles.
  function paintTiles(source, naturalW, naturalH) {
    if (!naturalW || !naturalH) return;
    const { rectW, rectH } = sizeTiles();
    const containerAspect = rectW / rectH;
    const mediaAspect = naturalW / naturalH;
    let cropW, cropH, offsetX, offsetY;
    if (mediaAspect > containerAspect) {
      cropH = naturalH;
      cropW = naturalH * containerAspect;
      offsetX = (naturalW - cropW) / 2;
      offsetY = 0;
    } else {
      cropW = naturalW;
      cropH = naturalW / containerAspect;
      offsetX = 0;
      offsetY = (naturalH - cropH) / 2;
    }
    const sliceW = cropW / cols;
    const sliceH = cropH / rows;

    tiles.forEach((tile, i) => {
      const col = Number(tile.dataset.col);
      const row = Number(tile.dataset.row);
      try {
        ctxs[i].drawImage(
          source,
          offsetX + col * sliceW, offsetY + row * sliceH, sliceW, sliceH,
          0, 0, tile.width, tile.height
        );
      } catch (err) {
        // A single bad tile (e.g. a momentarily not-yet-decoded frame)
        // shouldn't abort painting the rest of the grid and leave them all
        // blank (showing the placeholder background through instead of the
        // image).
        console.error('Pixel reveal: failed to paint a tile.', err);
      }
    });
  }

  let isPainted = false;
  let isInView = false;
  let hasRevealed = false;

  function reveal() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => tilesContainer.classList.add('is-visible'));
    });
    setTimeout(() => {
      tilesContainer.classList.add('is-done');
      heroEl.classList.add('is-revealed');
    }, maxDelay + 400);
  }

  function tryReveal() {
    if (isPainted && isInView && !hasRevealed) {
      hasRevealed = true;
      reveal();
    }
  }

  const viewObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isInView = true;
        tryReveal();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  viewObserver.observe(heroEl);

  if (isVideo) {
    let videoDrawRAF = null;
    function drawVideoFrame() {
      if (mediaEl.readyState >= 2) paintTiles(mediaEl, mediaEl.videoWidth, mediaEl.videoHeight);
      videoDrawRAF = requestAnimationFrame(drawVideoFrame);
    }
    mediaEl.addEventListener('loadeddata', () => {
      drawVideoFrame();
      isPainted = true;
      tryReveal();
      // Stop repainting the canvas well after the handoff to the real
      // (still-playing) <video> element above it.
      setTimeout(() => cancelAnimationFrame(videoDrawRAF), maxDelay + 1200);
    }, { once: true });
  } else if (mediaEl.complete && mediaEl.naturalWidth) {
    paintTiles(mediaEl, mediaEl.naturalWidth, mediaEl.naturalHeight);
    isPainted = true;
    tryReveal();
  } else {
    mediaEl.addEventListener('load', () => {
      paintTiles(mediaEl, mediaEl.naturalWidth, mediaEl.naturalHeight);
      isPainted = true;
      tryReveal();
    }, { once: true });
  }
}
