// Uses the Firebase "compat" SDK (loaded as plain <script> tags in index.html,
// not ES modules) so the corkboard still works when this file is opened
// directly from disk (file://) — module scripts are blocked cross-origin by
// the browser in that case, but classic scripts aren't.
const NOTE_COLORS = ['#fff59d', '#ffab91', '#a5d6a7', '#90caf9', '#f48fb1'];
const NOTE_EMOJIS = ['❤️', '😄', '👍', '🎉', '👏', '✨'];
const NAME_MAX = 40;
const ROLE_MAX = 60;
const MESSAGE_MAX = 100;
const COOLDOWN_MS = 30000;
const COOLDOWN_KEY = 'corkboardLastPin';

let db = null;
try {
  firebase.initializeApp(window.CORKBOARD_FIREBASE_CONFIG || {});
  db = firebase.firestore();
} catch (err) {
  console.error('Corkboard: Firebase failed to initialize — check firebase-config.js.', err);
}

function hashSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function hashRotation(seed) {
  return (hashSeed(seed) % 1200) / 100 - 6;
}

function createNoteElement(data, x, y, isPlacing, id) {
  const note = document.createElement('div');
  note.className = `corkboard-note${data.isEmoji ? ' is-emoji' : ''}${isPlacing ? ' is-placing' : ''}`;
  note.style.left = `${x}%`;
  note.style.top = `${y}%`;
  const seedBase = id || `${data.name}-${x}-${y}`;
  const rotDeg = isPlacing ? 0 : hashRotation(seedBase);
  note.style.setProperty('--rot', `${rotDeg.toFixed(1)}deg`);
  if (id) note.dataset.noteId = id;

  const message = document.createElement('div');
  message.className = 'corkboard-note-message';
  message.textContent = data.message || '';
  note.appendChild(message);

  const meta = document.createElement('div');
  meta.className = 'corkboard-note-meta';
  const nameEl = document.createElement('span');
  nameEl.className = 'corkboard-note-name';
  nameEl.textContent = data.name || '';
  meta.appendChild(nameEl);
  if (data.role) {
    const roleEl = document.createElement('span');
    roleEl.className = 'corkboard-note-role';
    roleEl.textContent = data.role;
    meta.appendChild(roleEl);
  }
  note.appendChild(meta);

  // Emoji notes drop the card background entirely (see corkboard.css) — the
  // chosen color shows up on the little name tag instead.
  if (data.isEmoji) {
    meta.style.background = data.color || NOTE_COLORS[0];
  } else {
    note.style.background = data.color || NOTE_COLORS[0];
  }

  return note;
}

document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('corkboardFab');
  const modal = document.getElementById('corkboardModal');
  const board = document.getElementById('corkboardBoard');
  const emptyEl = document.getElementById('corkboardEmpty');
  if (!fab || !modal || !board) return;

  const editor = document.getElementById('corkboardEditor');
  const nameInput = document.getElementById('corkboardName');
  const roleInput = document.getElementById('corkboardRole');
  const messageInput = document.getElementById('corkboardMessage');
  const messageCount = document.getElementById('corkboardMessageCount');
  const emojiRow = document.getElementById('corkboardEmojiRow');
  const colorRow = document.getElementById('corkboardColorRow');
  const errorEl = document.getElementById('corkboardError');
  const pinBtn = document.getElementById('corkboardPinBtn');
  const closeBtn = modal.querySelector('.corkboard-modal-close');
  const resetBtn = document.getElementById('corkboardResetBtn');

  let selectedColor = NOTE_COLORS[0];
  let selectedEmoji = null;

  // Local-only rearranging: any visitor can drag an already-pinned note to
  // de-clutter an overlapping board, but it's purely a view-layer override on
  // this one page load — never written to Firestore, so the pinner's actual
  // saved x/y (and everyone else's view of it) is untouched. Keyed by note
  // id, reapplied every time a live snapshot re-renders the board.
  const localOverrides = new Map();
  let lastDocs = [];

  colorRow.innerHTML = NOTE_COLORS.map((c, i) =>
    `<button type="button" class="corkboard-color-dot${i === 0 ? ' is-selected' : ''}" style="background:${c}" data-color="${c}" aria-label="Choose note color"></button>`
  ).join('');

  emojiRow.innerHTML = NOTE_EMOJIS.map((e) =>
    `<button type="button" class="corkboard-emoji-btn" data-emoji="${e}" aria-label="React with ${e}">${e}</button>`
  ).join('');

  editor.style.background = selectedColor;

  colorRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.corkboard-color-dot');
    if (!btn) return;
    selectedColor = btn.dataset.color;
    colorRow.querySelectorAll('.corkboard-color-dot').forEach((d) => d.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    editor.style.background = selectedColor;
  });

  emojiRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.corkboard-emoji-btn');
    if (!btn || btn.disabled) return;
    const emoji = btn.dataset.emoji;
    const wasSelected = selectedEmoji === emoji;
    emojiRow.querySelectorAll('.corkboard-emoji-btn').forEach((b) => b.classList.remove('is-selected'));
    selectedEmoji = wasSelected ? null : emoji;
    if (selectedEmoji) {
      btn.classList.add('is-selected');
      messageInput.value = '';
    }
    updateExclusivity();
  });

  // Live "0/40"-style counters so visitors see the limit before they hit it,
  // instead of just being cut off silently by the input's maxlength.
  function updateCharCount(input, counterEl, max) {
    const len = input.value.length;
    counterEl.textContent = `${len}/${max}`;
    counterEl.classList.toggle('is-at-limit', len >= max);
  }

  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim() && selectedEmoji) {
      selectedEmoji = null;
      emojiRow.querySelectorAll('.corkboard-emoji-btn').forEach((b) => b.classList.remove('is-selected'));
    }
    updateCharCount(messageInput, messageCount, MESSAGE_MAX);
    updateExclusivity();
  });

  // Text and a reaction are alternatives, not additive — picking one locks out
  // the other so it's never ambiguous which one actually gets saved.
  function updateExclusivity() {
    const hasText = messageInput.value.trim().length > 0;
    emojiRow.querySelectorAll('.corkboard-emoji-btn').forEach((b) => {
      b.disabled = hasText;
    });
    messageInput.disabled = !!selectedEmoji;
  }

  function remainingCooldownMs() {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, COOLDOWN_MS - (Date.now() - last));
  }

  function resetForm() {
    nameInput.value = '';
    roleInput.value = '';
    messageInput.value = '';
    messageInput.disabled = false;
    updateCharCount(messageInput, messageCount, MESSAGE_MAX);
    selectedEmoji = null;
    emojiRow.querySelectorAll('.corkboard-emoji-btn').forEach((b) => {
      b.classList.remove('is-selected');
      b.disabled = false;
    });
    errorEl.textContent = '';
  }

  function openModal() {
    const remaining = remainingCooldownMs();
    if (remaining > 0) {
      errorEl.textContent = `You can pin another note in ${Math.ceil(remaining / 1000)}s.`;
    } else {
      errorEl.textContent = '';
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('corkboard-modal-open');
    nameInput.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.body.classList.remove('corkboard-modal-open');
  }

  fab.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  pinBtn.addEventListener('click', () => {
    if (remainingCooldownMs() > 0) return;

    const name = nameInput.value.trim().slice(0, NAME_MAX);
    const role = roleInput.value.trim().slice(0, ROLE_MAX);
    const message = messageInput.value.trim().slice(0, MESSAGE_MAX);

    if (!name) {
      errorEl.textContent = 'Please tell us your name.';
      nameInput.focus();
      return;
    }
    if (!message && !selectedEmoji) {
      errorEl.textContent = 'Write a message or pick a reaction.';
      return;
    }

    const draft = {
      name,
      role,
      message: message || selectedEmoji,
      isEmoji: !message && !!selectedEmoji,
      color: selectedColor,
    };

    closeModal();
    resetForm();
    startPlacement(draft);
  });

  // Notes have a fixed pixel size (see corkboard.css/breakpoints.css) but the
  // board itself is a fluid percentage width, so a placement range that's a
  // safe margin on a wide desktop board can push a note half off the edge on
  // a narrow phone-width board. This measures the note's actual current
  // rendered size (a throwaway, invisible probe) to compute a safe margin
  // that adapts to whatever width the current breakpoint's CSS gives it.
  function getSafeNoteMargin(axis) {
    const probe = document.createElement('div');
    probe.className = 'corkboard-note';
    probe.style.visibility = 'hidden';
    board.appendChild(probe);
    const noteRect = probe.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    probe.remove();
    const sizePx = axis === 'x' ? noteRect.width : noteRect.height;
    const boardSizePx = axis === 'x' ? boardRect.width : boardRect.height;
    if (!boardSizePx) return 15;
    return Math.min(45, Math.max(4, (sizePx / 2 / boardSizePx) * 100));
  }

  function startPlacement(draft) {
    // Touch screens: the site's custom scroll-jacking hijacks touchmove globally,
    // which would fight a touch-drag on the note. Skip straight to a placed spot.
    if (window.matchMedia('(pointer: coarse)').matches) {
      const marginX = getSafeNoteMargin('x');
      const marginY = getSafeNoteMargin('y');
      const x = marginX + Math.random() * (100 - marginX * 2);
      const y = marginY + Math.random() * (100 - marginY * 2);
      savePin({ ...draft, x, y }).then((ok) => {
        if (!ok) showBoardMessage("Couldn't save your note — please try again.");
      });
      return;
    }

    let finalized = false;
    let dragging = false;
    let x = 50;
    let y = 50;
    let grabOffsetX = 0;
    let grabOffsetY = 0;

    const note = createNoteElement(draft, x, y, true);
    const hint = document.createElement('div');
    hint.className = 'corkboard-placing-hint';
    hint.textContent = 'Drag and drop to pin — or click the board to place it';
    board.appendChild(note);
    board.appendChild(hint);

    function clampPercent(v, margin) {
      return Math.min(100 - margin, Math.max(margin, v));
    }

    function updateFromClient(clientX, clientY) {
      const rect = board.getBoundingClientRect();
      const noteRect = note.getBoundingClientRect();
      const marginX = rect.width ? Math.min(45, Math.max(4, (noteRect.width / 2 / rect.width) * 100)) : 4;
      const marginY = rect.height ? Math.min(45, Math.max(4, (noteRect.height / 2 / rect.height) * 100)) : 4;
      x = clampPercent(((clientX - rect.left) / rect.width) * 100, marginX);
      y = clampPercent(((clientY - rect.top) / rect.height) * 100, marginY);
      note.style.left = `${x}%`;
      note.style.top = `${y}%`;
    }

    function onNotePointerDown(e) {
      dragging = true;
      // Preserve exactly where on the note the pointer grabbed it — without
      // this, the first move would re-center the note under the cursor,
      // snapping it sideways if the grab wasn't dead-center.
      const noteRect = note.getBoundingClientRect();
      grabOffsetX = e.clientX - (noteRect.left + noteRect.width / 2);
      grabOffsetY = e.clientY - (noteRect.top + noteRect.height / 2);
      note.setPointerCapture(e.pointerId);
    }
    function onNotePointerMove(e) {
      if (!dragging) return;
      updateFromClient(e.clientX - grabOffsetX, e.clientY - grabOffsetY);
    }
    function onNotePointerUp() {
      // Releasing the drag pins it right there — true drag-and-drop, no
      // separate click needed afterward. A plain click on the note itself
      // (no movement in between) lands here too and just pins it in place.
      dragging = false;
      finalize();
    }
    function onBoardClick(e) {
      // Fallback for people who don't want to drag at all — click anywhere
      // on the board and the note jumps straight there and pins.
      if (dragging) return;
      updateFromClient(e.clientX, e.clientY);
      finalize();
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') cancel();
    }

    function cleanupListeners() {
      note.removeEventListener('pointerdown', onNotePointerDown);
      note.removeEventListener('pointermove', onNotePointerMove);
      note.removeEventListener('pointerup', onNotePointerUp);
      board.removeEventListener('click', onBoardClick);
      document.removeEventListener('keydown', onKeyDown);
    }

    async function finalize() {
      if (finalized) return;
      finalized = true;
      cleanupListeners();
      hint.remove();
      note.classList.add('is-saving');
      const ok = await savePin({ ...draft, x, y });
      note.remove();
      if (!ok) {
        showBoardMessage("Couldn't save your note — please try again.");
      }
    }

    function cancel() {
      if (finalized) return;
      finalized = true;
      cleanupListeners();
      hint.remove();
      note.remove();
    }

    note.addEventListener('pointerdown', onNotePointerDown);
    note.addEventListener('pointermove', onNotePointerMove);
    note.addEventListener('pointerup', onNotePointerUp);
    board.addEventListener('click', onBoardClick);
    document.addEventListener('keydown', onKeyDown);
  }

  async function savePin(note, attempt) {
    attempt = attempt || 0;
    if (!db) {
      console.error('Corkboard: Firestore is not initialized — check firebase-config.js.');
      return;
    }
    try {
      await db.collection('corkboardNotes').add({
        name: note.name,
        role: note.role || '',
        message: note.message,
        isEmoji: !!note.isEmoji,
        color: note.color,
        x: note.x,
        y: note.y,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      return true;
    } catch (err) {
      // Same brand-new-client handshake race as the realtime listener below —
      // retry a couple of times before actually giving up on the visitor's note.
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return savePin(note, attempt + 1);
      }
      console.error('Corkboard: failed to save note.', err);
      return false;
    }
  }

  function showBoardMessage(text) {
    const toast = document.createElement('div');
    toast.className = 'corkboard-placing-hint corkboard-toast';
    toast.textContent = text;
    board.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function renderNotes(docs) {
    lastDocs = docs;
    board.querySelectorAll('.corkboard-note:not(.is-placing)').forEach((n) => n.remove());
    if (emptyEl) emptyEl.style.display = docs.length === 0 ? 'block' : 'none';
    docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (typeof data.x !== 'number' || typeof data.y !== 'number') return;
      const override = localOverrides.get(docSnap.id);
      const x = override ? override.x : data.x;
      const y = override ? override.y : data.y;
      const note = createNoteElement(data, x, y, false, docSnap.id);
      board.appendChild(note);
      makeNoteDraggable(note, docSnap.id);
    });
    updateResetBtnVisibility();
  }

  // Drag-to-rearrange for already-pinned notes — separate from startPlacement
  // above, which only handles a brand-new note before it's saved. Reuses the
  // same clamped-percent math so a rearranged note can't be dragged off the
  // board either.
  function makeNoteDraggable(note, id) {
    let dragging = false;
    let moved = false;
    let startClientX = 0;
    let startClientY = 0;
    let grabOffsetX = 0;
    let grabOffsetY = 0;

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      moved = false;
      startClientX = e.clientX;
      startClientY = e.clientY;
      // Preserve exactly where on the note the pointer grabbed it — without
      // this, the first move would re-center the note under the cursor,
      // snapping it sideways if the grab wasn't dead-center. Measured before
      // .is-dragging (below) can apply its scale-up, so it reflects the
      // note's resting size.
      const noteRect = note.getBoundingClientRect();
      grabOffsetX = e.clientX - (noteRect.left + noteRect.width / 2);
      grabOffsetY = e.clientY - (noteRect.top + noteRect.height / 2);
      // Belt-and-suspenders against a "Reset Layout" transition (see below)
      // that's still mid-flight or never got cleaned up: .is-resetting's
      // eased transition would otherwise outrank .is-dragging's transition:
      // none (same specificity, declared later in corkboard.css), making
      // this drag feel laggy instead of tracking the pointer 1:1.
      note.classList.remove('is-resetting');
      // Same escape hatch the composer modal uses (see openModal/closeModal
      // above) to stop the site's custom touch-scroll-jacking in script.js
      // from fighting this drag on touch devices. Added before the capture
      // call below so a capture failure can never leave it stuck off.
      document.body.classList.add('corkboard-dragging');
      try {
        note.setPointerCapture(e.pointerId);
      } catch (err) {
        // Capture is a nice-to-have (keeps move/up events on this element
        // even if the pointer strays off it); the drag still works via the
        // bubbling listeners below without it.
      }
    }

    function onPointerMove(e) {
      if (!dragging) return;
      if (!moved) {
        if (Math.hypot(e.clientX - startClientX, e.clientY - startClientY) < 4) return;
        moved = true;
        note.classList.add('is-dragging');
      }
      const rect = board.getBoundingClientRect();
      const noteRect = note.getBoundingClientRect();
      const marginX = rect.width ? Math.min(45, Math.max(4, (noteRect.width / 2 / rect.width) * 100)) : 4;
      const marginY = rect.height ? Math.min(45, Math.max(4, (noteRect.height / 2 / rect.height) * 100)) : 4;
      const targetCenterX = e.clientX - grabOffsetX;
      const targetCenterY = e.clientY - grabOffsetY;
      const x = Math.min(100 - marginX, Math.max(marginX, ((targetCenterX - rect.left) / rect.width) * 100));
      const y = Math.min(100 - marginY, Math.max(marginY, ((targetCenterY - rect.top) / rect.height) * 100));
      note.style.left = `${x}%`;
      note.style.top = `${y}%`;
      note.dataset.dragX = x;
      note.dataset.dragY = y;
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('corkboard-dragging');
      note.classList.remove('is-dragging');
      if (moved && note.dataset.dragX && note.dataset.dragY) {
        localOverrides.set(id, { x: parseFloat(note.dataset.dragX), y: parseFloat(note.dataset.dragY) });
        updateResetBtnVisibility();
      }
    }

    note.addEventListener('pointerdown', onPointerDown);
    note.addEventListener('pointermove', onPointerMove);
    note.addEventListener('pointerup', endDrag);
    note.addEventListener('pointercancel', endDrag);
  }

  function updateResetBtnVisibility() {
    if (!resetBtn) return;
    resetBtn.classList.toggle('is-visible', localOverrides.size > 0);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (localOverrides.size === 0) return;
      const resetIds = new Set(localOverrides.keys());
      localOverrides.clear();
      updateResetBtnVisibility();

      // Ease the existing elements back to their real Firestore position
      // instead of going through renderNotes (which tears down and rebuilds
      // every note from scratch — fine for live data changes, but a
      // destroy/recreate can't animate, it can only snap).
      resetIds.forEach((id) => {
        const note = board.querySelector(`.corkboard-note[data-note-id="${id}"]`);
        const docSnap = lastDocs.find((d) => d.id === id);
        if (!note || !docSnap) return;
        const data = docSnap.data();
        if (typeof data.x !== 'number' || typeof data.y !== 'number') return;
        note.classList.add('is-resetting');
        note.style.left = `${data.x}%`;
        note.style.top = `${data.y}%`;
        const clearResetting = () => note.classList.remove('is-resetting');
        note.addEventListener('transitionend', clearResetting, { once: true });
        // Fallback in case transitionend never fires (e.g. a live Firestore
        // update tears this element down mid-transition) — onPointerDown
        // above also clears it defensively before any future drag.
        setTimeout(clearResetting, 550);
      });
    });
  }

  // A brand-new Firestore client's very first onSnapshot call can race the SDK's
  // internal handshake and come back permission-denied even with open rules —
  // retrying a couple of times a beat later clears it without the visitor noticing.
  function subscribeToNotes(attempt) {
    db.collection('corkboardNotes').orderBy('createdAt', 'asc').onSnapshot(
      (snapshot) => renderNotes(snapshot.docs),
      (err) => {
        if (attempt < 3) {
          setTimeout(() => subscribeToNotes(attempt + 1), 800);
        } else {
          console.error('Corkboard: realtime listener error.', err);
        }
      }
    );
  }

  if (db) {
    subscribeToNotes(0);
  }
});
