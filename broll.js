/* =========================================================
   B-Roll: an endless wall of photos you can move in every direction.
   Scroll (or trackpad) moves it up/down and sideways, drag or swipe it anywhere,
   arrow keys work too. Columns glide at slightly different speeds so the wall
   feels alive. Click a photo to open it.
   Uses the globals from main.js: gsap, lenis, $, $$, reduceMotion, canHover.
   ========================================================= */
(() => {
  // id, width, height
  const PHOTOS = [
    ["b01", 1100, 618], ["b02", 1100, 618],
    ["b03", 734, 1100], ["b04", 1100, 733],
    ["b05", 733, 1100], ["b06", 733, 1100],
    ["b07", 1100, 733], ["b08", 733, 1100],
    ["b09", 733, 1100], ["b10", 1100, 733],
    ["b11", 733, 1100], ["b12", 619, 1100],
    ["b13", 1100, 733], ["b14", 1100, 733],
    ["b15", 733, 1100], ["b16", 826, 1100],
    ["b17", 619, 1100], ["b18", 733, 1100],
    ["b19", 733, 1100], ["b20", 733, 1100],
    ["b21", 733, 1100], ["b22", 1100, 733],
    ["b23", 1100, 826], ["b24", 1100, 733],
    ["b25", 1100, 733], ["b26", 1100, 733],
    ["b27", 1100, 733], ["b28", 825, 1100],
    ["b29", 1100, 733], ["b30", 1100, 733],
    ["b31", 1100, 733], ["b32", 1100, 826],
    ["b33", 1100, 733], ["b34", 1100, 826],
    ["b35", 1100, 826], ["b36", 826, 1100],
    ["b37", 1100, 826], ["b38", 1100, 826],
    ["b39", 1100, 733], ["b40", 733, 1100],
    ["b41", 1100, 733], ["b42", 1100, 733],
    ["b43", 1100, 733], ["b44", 1100, 733],
    ["b45", 1100, 733], ["b46", 1100, 733],
    ["b47", 1100, 733], ["b48", 1100, 733],
    ["b49", 1100, 826], ["b50", 733, 1100],
    ["b51", 1100, 733], ["b52", 1100, 733],
    ["b53", 1100, 733], ["b54", 1100, 733],
    ["b55", 1100, 826], ["b56", 733, 1100],
  ].map(([id, w, h], i) => ({ id, w, h, n: i + 1 }));

  const nn = (n) => String(n).padStart(2, "0");
  const src = (p, size) => `images/broll/${p.id}${size === "s" ? "-s" : size === "l" ? "@2x" : ""}.jpg`;
  const mod = (a, n) => ((a % n) + n) % n;

  // a fixed shuffle, so neighbours on the wall come from different trips
  const ORDER = (() => {
    const a = PHOTOS.map((_, i) => i); let s = 7;
    for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  })();
  const SPEED = [1, 1.1, 0.93];   // columns glide at slightly different speeds

  const wall = $("[data-wall]"), track = $("[data-wall-track]"), hint = $("[data-wall-hint]");
  lenis && lenis.stop();
  if (!canHover && hint) hint.firstElementChild.textContent = "Swipe in any direction";

  /* ---------- layout: masonry columns, the same gap everywhere ---------- */
  // every photo sits directly under the one above it, so the space between photos is always `gap`
  let tileW, gap, cellW, maxH, cols, margin;
  const prefixCache = new Map();
  const active = new Map(), free = [];
  const layout = () => {
    const phone = innerWidth < 700;
    tileW = phone ? Math.round(innerWidth * 0.62) : Math.round(Math.min(440, Math.max(240, innerWidth * 0.235)));
    gap = Math.round(tileW * (phone ? 0.12 : 0.2));
    cellW = tileW + gap;
    maxH = Math.round(tileW * 1.25);               // very tall portraits are cropped to 4:5
    cols = Math.ceil(innerWidth / cellW) + 2;
    margin = maxH;
    track.style.setProperty("--tw", tileW + "px");
    prefixCache.clear();
    active.forEach((sl) => { sl.idx = -1; release(sl); }); active.clear();
  };
  const tileH = (p) => Math.min(maxH, Math.round(tileW * (p.h / p.w)));
  // each column runs through all the photos from its own starting point
  const phaseOf = (col) => mod(col * 13, PHOTOS.length);
  const prefix = (phase) => {
    let c = prefixCache.get(phase);
    if (!c) {
      const P = [0];
      for (let k = 0; k < PHOTOS.length; k++) P.push(P[k] + tileH(PHOTOS[ORDER[mod(phase + k, PHOTOS.length)]]) + gap);
      c = { P, T: P[PHOTOS.length] }; prefixCache.set(phase, c);
    }
    return c;
  };

  /* ---------- tile pool: each on-screen photo keeps its own element while it is visible ---------- */
  const make = () => {
    const el = document.createElement("button");
    el.type = "button"; el.className = "wtile"; el.dataset.cursor = "View";
    el.innerHTML = `<span class="wtile__in"><img alt="" decoding="async" draggable="false" /></span>`;
    track.appendChild(el);
    return { el, img: el.querySelector("img"), box: el.querySelector(".wtile__in"), idx: -1 };
  };
  const take = () => { const sl = free.pop() || make(); sl.el.hidden = false; return sl; };
  const release = (sl) => { sl.el.hidden = true; free.push(sl); };
  const fill = (sl, idx) => {
    if (sl.idx === idx) return;
    sl.idx = idx;
    const p = PHOTOS[idx];
    sl.img.src = src(p, "s");
    sl.img.alt = "Photo by Aditya";
    sl.el.dataset.open = idx;
    sl.el.setAttribute("aria-label", `Open photo ${p.n} of ${PHOTOS.length}`);
    sl.box.style.height = tileH(p) + "px";
  };

  /* ---------- motion state ---------- */
  let x = 0, y = 0, tx = 0, ty = 0, vx = 0, vy = 0, lastInput = -1e9, hovering = false, paused = false;
  const touch = () => { lastInput = performance.now(); if (hint && !hint.classList.contains("is-gone")) hint.classList.add("is-gone"); };

  const render = () => {
    const ease = reduceMotion ? 1 : 0.085;
    // gentle drift when nobody is touching it
    if (!reduceMotion && !paused && !hovering && performance.now() - lastInput > 2600) { tx -= 0.35; ty -= 0.5; }
    const px = x, py = y;
    x += (tx - x) * ease; y += (ty - y) * ease;
    vx = x - px; vy = y - py;
    const speed = Math.min(1, Math.hypot(vx, vy) / 60);
    track.style.setProperty("--squash", (1 - speed * 0.06).toFixed(3));

    const N = PHOTOS.length, seen = new Set();
    const c0 = Math.floor(-x / cellW) - 1;
    for (let i = 0; i < cols; i++) {
      const col = c0 + i, phase = phaseOf(col), { P, T } = prefix(phase);
      const cy = y * SPEED[mod(col, 3)] - (mod(col, 2) ? tileW * 0.55 : 0);   // neighbouring columns are staggered
      const left = col * cellW + x + gap / 2;
      const start = -cy - margin;
      let m = Math.floor(start / T);
      const rem = start - m * T;
      let lo = 0, hi = N - 1;                         // last k with P[k] <= rem
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (P[mid] <= rem) lo = mid; else hi = mid - 1; }
      let k = lo;
      for (let top = m * T + P[k] + cy; top < innerHeight + margin; top = m * T + P[k] + cy) {
        const key = col + "|" + (m * N + k);
        let sl = active.get(key);
        if (!sl) { sl = take(); active.set(key, sl); }
        fill(sl, ORDER[mod(phase + k, N)]);
        sl.el.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
        seen.add(key);
        if (++k === N) { k = 0; m++; }
      }
    }
    active.forEach((sl, key) => { if (!seen.has(key)) { release(sl); active.delete(key); } });
  };

  layout();
  // start with the wall centred so photos sit on every side
  x = tx = -cellW * 0.35; y = ty = -maxH * 0.2;
  render();
  gsap.ticker.add(render);
  addEventListener("resize", () => { layout(); render(); });

  // arrival: photos rise in from the centre outward
  if (!reduceMotion) {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const ins = [...active.values()].map((sl) => sl.box);
    gsap.from(ins, {
      opacity: 0, scale: 0.6, y: 60, duration: 1.3, ease: "expo.out",
      delay: (i) => { const r = ins[i].getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) / 2200; },
      clearProps: "transform,opacity",
    });
  }

  /* ---------- input: wheel / trackpad (both axes) ---------- */
  wall.addEventListener("wheel", (e) => {
    e.preventDefault();
    const m = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    let dx = e.deltaX * m, dy = e.deltaY * m;
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }       // shift + wheel = sideways on a mouse
    tx -= dx; ty -= dy; touch();
  }, { passive: false });

  /* ---------- input: drag / swipe ---------- */
  let drag = null, moved = 0;
  wall.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY, t: performance.now(), vx: 0, vy: 0 };
    moved = 0; wall.classList.add("is-grabbing"); touch();
  });
  addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly, now = performance.now(), dt = Math.max(1, now - drag.t);
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6 && !wall.hasPointerCapture(e.pointerId)) wall.setPointerCapture(e.pointerId);
    tx += dx * 1.15; ty += dy * 1.15;
    drag.vx = dx / dt; drag.vy = dy / dt; drag.lx = e.clientX; drag.ly = e.clientY; drag.t = now;
    touch();
  });
  const endDrag = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    tx += drag.vx * 260; ty += drag.vy * 260;        // fling
    drag = null; wall.classList.remove("is-grabbing");
  };
  addEventListener("pointerup", endDrag); addEventListener("pointercancel", endDrag);

  /* ---------- input: keyboard ---------- */
  addEventListener("keydown", (e) => {
    if (!lb.hidden || document.documentElement.classList.contains("menu-open")) return;
    const step = { ArrowUp: [0, maxH], ArrowDown: [0, -maxH], ArrowLeft: [cellW, 0], ArrowRight: [-cellW, 0] }[e.key];
    if (step) { e.preventDefault(); tx += step[0]; ty += step[1]; touch(); }
  });

  wall.addEventListener("pointerover", (e) => { hovering = !!e.target.closest(".wtile"); });
  wall.addEventListener("pointerleave", () => (hovering = false));

  /* ---------- viewer ---------- */
  const lb = $("[data-br-lb]"), lbImg = $("img", lb), lbNum = $("[data-lb-num]", lb);
  let cur = 0, lastFocus = null;
  const preload = (i) => { const im = new Image(); im.src = src(PHOTOS[mod(i, PHOTOS.length)], "l"); };
  const show = (i, dir = 0) => {
    cur = mod(i, PHOTOS.length);
    const p = PHOTOS[cur];
    lbImg.src = src(p);
    const big = new Image(); big.onload = () => { if (PHOTOS[cur] === p) lbImg.src = big.src; }; big.src = src(p, "l");
    lbImg.alt = "Photo by Aditya";
    lbNum.textContent = `${nn(p.n)} / ${PHOTOS.length}`;
    if (!reduceMotion && dir) gsap.fromTo(lbImg, { x: dir * 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
    preload(cur + 1); preload(cur - 1);
  };
  const open = (i) => {
    lastFocus = document.activeElement; paused = true;
    lb.hidden = false;
    show(i);
    if (!reduceMotion) { gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.35 }); gsap.fromTo(lbImg, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: "expo.out" }); }
    $("[data-lb-close]", lb).focus({ preventScroll: true });
  };
  const close = () => { lb.hidden = true; paused = false; lastInput = performance.now(); lastFocus && lastFocus.focus({ preventScroll: true }); };

  track.addEventListener("click", (e) => {
    const t = e.target.closest(".wtile");
    if (!t || moved > 6) return;                      // a drag is not a click
    open(+t.dataset.open);
  });
  $("[data-lb-prev]", lb).addEventListener("click", () => show(cur - 1, -1));
  $("[data-lb-next]", lb).addEventListener("click", () => show(cur + 1, 1));
  $("[data-lb-close]", lb).addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("br-lb__fig")) close(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(cur + 1, 1);
    if (e.key === "ArrowLeft") show(cur - 1, -1);
  });
  let sx = null;
  lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
})();
