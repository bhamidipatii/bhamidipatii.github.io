/* =========================================================
   Aditya Bhamidipati — Portfolio v2 interactions
   GSAP (+ScrollTrigger, MotionPath) · Lenis smooth scroll
   ========================================================= */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
  del: (k) => { try { sessionStorage.removeItem(k); } catch (e) {} },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- Slide-in menu (built from the nav links, so every page gets it) ---------- */
const navLinks = $(".nav__links");
if (navLinks) {
  const html = document.documentElement;
  html.classList.add("has-menu");
  const items = $$("a", navLinks).map((a) => ({
    href: a.getAttribute("href"),
    newTab: a.target === "_blank",   // Work / About / Off the clock / B-Roll open as their own pages in a new tab
    label: a.textContent.replace(/ /g, " ").trim().replace(/^Off clock$/, "Off the clock"),
  }));
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "menu-btn"; btn.dataset.magnetic = "";
  btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "site-menu"); btn.setAttribute("aria-label", "Open menu");
  btn.innerHTML = '<span class="menu-btn__icon" aria-hidden="true"><i></i><i></i><i></i></span>';
  navLinks.after(btn);

  const shade = document.createElement("div");
  shade.className = "menu-shade";
  const panel = document.createElement("aside");
  panel.className = "menu"; panel.id = "site-menu"; panel.setAttribute("aria-label", "Site menu"); panel.inert = true;
  panel.innerHTML = `
    <div class="menu__wash"></div>
    <div class="menu__inner">
      <div class="menu__top mono"><span>Navigate</span><span>(${String(items.length).padStart(2, "0")})</span></div>
      <nav class="menu__list">
        ${items.map((it, i) => `<a class="menu__item" href="${it.href}"${it.newTab ? ' target="_blank" rel="noopener"' : ""}><span class="menu__num mono">0${i + 1}</span><span class="menu__mask"><span class="menu__label">${it.label}</span></span><span class="menu__arrow" aria-hidden="true">↗</span></a>`).join("")}
      </nav>
      <div class="menu__foot">
        <span class="mono menu__kicker">Say hello</span>
        <a class="menu__mail" href="mailto:abhamidipatii@gmail.com">abhamidipatii@gmail.com</a>
        <div class="menu__socials mono">
          <a href="https://www.linkedin.com/in/bhamidipatiii/" target="_blank" rel="noopener">LinkedIn ↗</a>
          <a href="https://www.instagram.com/bhamidipati_" target="_blank" rel="noopener">Instagram ↗</a>
          <a href="https://vsco.co/bhamidipati-" target="_blank" rel="noopener">VSCO ↗</a>
        </div>
        <div class="menu__clocks mono">BOM <b data-clock="Asia/Kolkata">--</b> · SFO <b data-clock="America/Los_Angeles">--</b></div>
      </div>
    </div>`;
  document.body.append(shade, panel);

  const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
    .set(panel, { visibility: "visible" })
    .to(shade, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0)
    .fromTo($(".menu__wash", panel), { xPercent: 101 }, { xPercent: 0, duration: 0.75, ease: "expo.inOut" }, 0)
    .fromTo($(".menu__inner", panel), { xPercent: 101 }, { xPercent: 0, duration: 0.85, ease: "expo.inOut" }, 0.09)
    .fromTo($$(".menu__label", panel), { yPercent: 115, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.06 }, 0.42)
    .fromTo($$(".menu__top, .menu__num, .menu__foot > *", panel), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.035 }, 0.55);

  let open = false;
  const setOpen = (v) => {
    open = v;
    html.classList.toggle("menu-open", v);
    btn.setAttribute("aria-expanded", String(v));
    btn.setAttribute("aria-label", v ? "Close menu" : "Open menu");
    panel.inert = !v;
    if (v) { lenis && lenis.stop(); tl.timeScale(1).play(); }
    else { lenis && lenis.start(); tl.timeScale(1.7).reverse(); }
    if (reduceMotion) tl.progress(v ? 1 : 0);
  };
  btn.addEventListener("click", () => setOpen(!open));
  shade.addEventListener("click", () => setOpen(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { setOpen(false); btn.focus(); } });
  // same-page links: close first (restarts smooth scroll), then the anchor handler below scrolls
  $$(".menu__item", panel).forEach((a) => a.addEventListener("click", () => { if (a.getAttribute("href").startsWith("#") || a.target === "_blank") setOpen(false); }));
}

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.4, offset: -10 }) : target.scrollIntoView({ behavior: "smooth" });
  });
});

/* ---------- Nav turns solid after the hero ---------- */
const nav = $(".nav");
if (nav && !nav.classList.contains("is-solid")) {
  const navCheck = () => nav.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", navCheck, { passive: true }); navCheck();
}

/* ---------- Split helpers ---------- */
function walkText(root, make) {
  [...root.childNodes].forEach((child) => {
    if (child.nodeType === 3) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
        else frag.appendChild(make(part));
      });
      child.replaceWith(frag);
    } else if (child.nodeType === 1 && !(child instanceof SVGElement) && child.tagName !== "BR") {
      walkText(child, make);
    }
  });
}
function splitWords(el) {
  walkText(el, (word) => { const w = document.createElement("span"); w.className = "w"; w.innerHTML = `<span>${word}</span>`; return w; });
  return $$(".w > span", el);
}
function splitFill(el) {
  walkText(el, (word) => { const w = document.createElement("span"); w.className = "fw"; w.textContent = word; return w; });
  return $$(".fw", el);
}
$$("[data-split]").forEach(splitWords);

/* ---------- Hero intro ---------- */
function heroIn(opts = {}) {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from($$('[data-split="hero"] .w > span'), { yPercent: 110, duration: 1.3, stagger: 0.045 })
    .from(".morph", { scale: 0, duration: 1, ease: "back.out(2)" }, 0.3)
    .from(opts.skipPass ? ".hero [data-fade]:not(.pass-wrap)" : ".hero [data-fade], .pass-wrap", { opacity: 0, y: 24, duration: 1.1, stagger: 0.08 }, 0.35);
  // (no 3D entrance rotation: keeps the pass shadow steady in every browser)
  const sp = $(".scribble-path");
  if (sp) {
    const len = sp.getTotalLength();
    // hidden until it draws: a round line-cap on an "empty" dash still paints a small lime dot
    gsap.set(sp, { strokeDasharray: len, strokeDashoffset: len, visibility: "hidden" });
    tl.set(sp, { visibility: "visible" }, 0.9)
      .to(sp, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 0.9);
  }
  return tl;
}

function runIntro() {
  if (document.body.dataset.page !== "home" || reduceMotion) return;
  const loader = $(".loader");
  if (document.documentElement.classList.contains("no-loader")) { heroIn(); return; }
  lenis && lenis.stop();

  /* Boarding-pass pile: passes from places Aditya has travelled drop onto a stack,
     then the real SFO → BOM pass lands on top and flies into its spot in the hero. */
  const pile = $(".pile", loader), countEl = $(".count", loader), phase = $(".phase", loader);

  /* ---- Optional sound (off until the visitor clicks "unmute"; browsers block audio before a click) ----
     Everything is synthesised with Web Audio: no audio files. */
  const unmuteBtn = $("[data-unmute]", loader);
  let actx = null, soundOn = false, noiseBuf = null;
  const ensureAudio = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      actx = new AC();
      noiseBuf = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.25), actx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  };
  const burst = (t0, { freq = 1200, q = 0.9, gain = 0.25, decay = 0.09, type = "bandpass" }) => {
    const src = actx.createBufferSource(); src.buffer = noiseBuf;
    const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    src.connect(f).connect(g).connect(actx.destination); src.start(t0); src.stop(t0 + decay + 0.02);
  };
  const thump = (t0, { from = 140, to = 60, gain = 0.25, dur = 0.12 }) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(from, t0); o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  };
  // a paper pass landing on the pile: filtered noise "thwap" + a soft body thump, varied each time
  const sfxLand = (strength = 1) => {
    if (!soundOn || !actx || actx.state !== "running") return;
    const t0 = actx.currentTime + 0.005;
    burst(t0, { freq: 900 + Math.random() * 900, q: 0.7 + Math.random() * 0.5, gain: 0.16 * strength, decay: 0.07 + Math.random() * 0.04 });
    thump(t0, { from: 150 + Math.random() * 40, to: 70, gain: 0.07 * strength, dur: 0.08 });
  };
  // the ARRIVED rubber stamp: a low, solid thunk with a dull knock
  const sfxStamp = () => {
    if (!soundOn || !actx || actx.state !== "running") return;
    const t0 = actx.currentTime + 0.005;
    thump(t0, { from: 110, to: 45, gain: 0.5, dur: 0.22 });
    burst(t0, { freq: 500, q: 0.6, gain: 0.25, decay: 0.12, type: "lowpass" });
  };
  const setSound = (on) => {
    soundOn = on;
    unmuteBtn.setAttribute("aria-pressed", String(on));
    unmuteBtn.textContent = on ? `Sound on · ${canHover ? "click" : "tap"} to mute` : `${canHover ? "Click" : "Tap"} to unmute`;
    try { localStorage.setItem("pass-sound", on ? "1" : "0"); } catch (e) {}
  };
  unmuteBtn.textContent = (canHover ? "Click" : "Tap") + " to unmute";
  unmuteBtn.addEventListener("click", (e) => {
    e.stopPropagation();                       // unmuting must not skip the loader
    if (!soundOn) { if (ensureAudio()) { setSound(true); sfxLand(0.8); } } else setSound(false);
  });
  // returning visitor who unmuted before: try to start sound right away (works where the browser allows it)
  try { if (localStorage.getItem("pass-sound") === "1" && ensureAudio() && actx.state === "running") setSound(true); } catch (e) {}

  // first FAST trips flick in quickly, then the rest land at the slower, readable pace
  const FAST = 9;
  const trips = [
    ["HYD", "Hyderabad", "DEL", "Delhi"], ["DEL", "Delhi", "JAI", "Jaipur"], ["BOM", "Mumbai", "UDR", "Udaipur"],
    ["DEL", "Delhi", "KUU", "Manali"], ["BOM", "Mumbai", "COK", "Munnar"], ["CLT", "Charlotte", "ATL", "Atlanta"],
    ["BNA", "Nashville", "DTW", "Detroit"], ["AUS", "Austin", "DFW", "Dallas"], ["MSP", "Minneapolis", "STL", "St. Louis"],
    ["BOM", "Mumbai", "GOI", "Goa"], ["DEL", "Delhi", "IXL", "Leh, Ladakh"], ["CCU", "Kolkata", "IXZ", "Andamans"],
    ["BOM", "Mumbai", "SIN", "Singapore"], ["SIN", "Singapore", "DPS", "Bali"], ["BKK", "Bangkok", "TPE", "Taipei"],
    ["AMS", "Amsterdam", "JFK", "New York"], ["JFK", "New York", "MIA", "Miami"], ["SFO", "San Francisco", "HNL", "Hawaii"],
    ["LAS", "Las Vegas", "SEA", "Seattle"], ["DEN", "Denver", "BOS", "Boston"],
  ];
  const colors = ["#d4ff3a", "#3d2bff", "#e5484d", "#121212", "#ff9a3d", "#19a974"];
  const mw = Math.min(300, innerWidth * 0.72);
  pile.style.setProperty("--mw", mw + "px");
  // phones: sit the whole pile a little lower so there is less empty space under the unmute line
  const shiftY = innerWidth <= 600 ? Math.round(innerHeight * 0.015) : 0;
  pile.style.top = `calc(50% + ${shiftY}px)`;
  const minis = trips.map(([fc, fcity, tc, tcity], i) => {
    const el = document.createElement("div");
    const wear = [i % 3 === 0 && "is-punch", i % 4 === 1 && "is-crease", i % 5 === 2 && "is-corner", i % 7 === 4 && i % 3 !== 0 && "is-dogear"].filter(Boolean);
    el.className = ["mini", ...wear].join(" "); el.style.setProperty("--c", colors[i % colors.length]);
    if (i % 5 === 2) el.style.setProperty("--corner", ["0% 0%", "100% 100%", "0% 100%", "100% 0%"][i % 4]);
    el.innerHTML = `<div class="mini__main"><div class="mini__head mono"><span>Boarding pass</span><span>AB ${String(101 + i * 37).padStart(4, "0")}</span></div>
      <div class="mini__route"><b>${fc}</b><i>✈</i><b>${tc}</b></div><div class="mini__cities mono"><span>${fcity}</span><span>${tcity}</span></div></div>
      <div class="mini__stub"><span class="mono">${tc}</span><em></em></div><i class="wear"></i>`;
    pile.appendChild(el); return el;
  });
  gsap.set(minis, { xPercent: -50, yPercent: -50, opacity: 0 });

  // the real hero pass: clone it, start it above the screen, land it on the pile, then fly it home
  const real = $(".hero .pass"), r0 = real.getBoundingClientRect();
  const fly = real.cloneNode(true);
  fly.classList.add("pass--flying"); fly.removeAttribute("data-tilt");
  Object.assign(fly.style, { position: "fixed", left: r0.left + "px", top: r0.top + "px", width: r0.width + "px", margin: 0, zIndex: 1001 });
  document.body.appendChild(fly);
  gsap.set(real, { opacity: 0 }); real.parentNode.classList.add("is-waiting");   // hide its shadow too until it lands
  const s = Math.min(1, (mw * 1.25) / r0.width);
  const dx = innerWidth / 2 - (r0.left + r0.width / 2), dy = innerHeight / 2 + shiftY - (r0.top + r0.height / 2);
  gsap.set(fly, { x: dx, y: dy - innerHeight, scale: s * 1.25, rotate: -16 });
  const stamp = $(".arrived-stamp", fly);
  gsap.set(stamp, { opacity: 0 });

  const tl = gsap.timeline();
  tl.from(".loader .cabin, .loader .unmute", { opacity: 0, y: 10, duration: 0.4, stagger: 0.08 }, 0);
  // scheduled by *landing* time, so landings flow straight from fast into normal pace with no gap
  let hit = 0, lastHit = 0;
  minis.forEach((m, i) => {
    const fast = i < FAST, fall = fast ? 0.3 : 0.5;          // timed so the whole intro ends at ~3.8s
    hit = i === 0 ? 0.15 + fall : hit + (fast ? 0.045 : i === FAST ? 0.08 : 0.115);
    const start = Math.max(0.05, hit - fall);
    const rot = gsap.utils.random(-15, 15), ox = gsap.utils.random(-30, 30), oy = gsap.utils.random(-22, 22);
    tl.fromTo(m, { x: ox + gsap.utils.random(-140, 140), y: -innerHeight * 0.8, rotate: rot + gsap.utils.random(-45, 45), opacity: 1,
                   scale: 1.28, boxShadow: "0 70px 60px -24px rgba(0,0,0,.22)" },
                 { x: ox, y: oy, rotate: rot, scale: 1, boxShadow: "0 22px 34px -14px rgba(0,0,0,.65)", duration: hit - start, ease: "power3.in" }, start)
      .to(m, { scale: 0.97, duration: 0.05, yoyo: true, repeat: 1, ease: "power1.out" }, hit)
      .add(() => { countEl.textContent = String(i + 1).padStart(2, "0"); sfxLand(fast ? 0.6 : 1); }, hit);
    lastHit = hit;
  });
  const land = lastHit - 0.03;   // SFO → BOM starts falling as the last pass lands
  tl.add(() => (phase.textContent = "Final boarding · SFO → BOM"), land - 0.15)
    .to(fly, { y: dy, rotate: -3, scale: s, duration: 0.55, ease: "power3.in" }, land)
    .to(fly, { scale: s * 0.96, duration: 0.06, yoyo: true, repeat: 1 }, land + 0.55)
    .add(() => sfxLand(1.4), land + 0.55)
    // finale: the ARRIVED stamp thumps down with a little shake (pile stays fully lit)
    .fromTo(stamp, { opacity: 0, scale: 2.4, rotate: -24 }, { opacity: 0.85, scale: 1, rotate: -11, duration: 0.14, ease: "power4.in" }, land + 0.58)
    .add(sfxStamp, land + 0.72)
    .to(fly, { x: "+=3", duration: 0.035, yoyo: true, repeat: 3, ease: "none" }, land + 0.72)
    .addLabel("reveal", land + 0.85)
    // re-measure the target in case fonts shifted the layout, without a visible jump
    .add(() => {
      const r = real.getBoundingClientRect();
      const ddx = r.left - parseFloat(fly.style.left), ddy = r.top - parseFloat(fly.style.top);
      Object.assign(fly.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px" });
      gsap.set(fly, { x: "-=" + ddx, y: "-=" + ddy });
    }, "reveal")
    .to(loader, { backgroundColor: "rgba(18,18,18,0)", duration: 0.6, ease: "power2.out" }, "reveal")
    .to(".loader .cabin, .loader .unmute", { opacity: 0, duration: 0.25 }, "reveal")
    .to(minis, { y: "+=" + innerHeight, rotate: () => gsap.utils.random(-60, 60), opacity: 0, duration: 0.75, ease: "power2.in", stagger: 0.015 }, "reveal")
    .to(fly, { x: 0, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: "expo.inOut" }, "reveal+=0.05")
    .add(() => { gsap.set(real, { opacity: 1 }); real.parentNode.classList.remove("is-waiting"); fly.parentNode && fly.parentNode.removeChild(fly); loader.style.display = "none"; lenis && lenis.start(); })
    .add(heroIn({ skipPass: true }), "reveal+=0.3");

  // a click/tap anywhere on the loading screen turns the sound on (it no longer skips)
  loader.addEventListener("click", () => { if (!soundOn && ensureAudio()) { setSound(true); sfxLand(0.8); } });
}

/* ---------- Page transitions ---------- */
function pageArrive() {
  if (!document.documentElement.classList.contains("is-arriving")) return Promise.resolve();
  store.del("pt");
  return new Promise((res) => {
    gsap.to(".curtain", {
      scaleY: 0, duration: 0.8, ease: "expo.inOut", delay: 0.05,
      onComplete: () => { document.documentElement.classList.remove("is-arriving"); gsap.set(".curtain", { clearProps: "all" }); res(); },
    });
  });
}
$$("a[href]").forEach((a) => {
  const href = a.getAttribute("href");
  const internal = href && !href.startsWith("#") && !href.startsWith("mailto:") && !a.target && /\.html($|#|\?)/.test(href);
  if (!internal || reduceMotion) return;
  a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    store.set("pt", "1");
    gsap.fromTo(".curtain", { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, duration: 0.6, ease: "expo.inOut", onComplete: () => (location.href = href) });
  });
});
window.addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(".curtain", { scaleY: 0 }); });

/* ---------- Cursor ---------- */
if (canHover && !reduceMotion) {
  const cursor = $(".cursor"), label = $("span", cursor);
  // Figma-style arrow: tip sits exactly on the pointer; hover labels show as a multiplayer-style name tag
  cursor.insertAdjacentHTML("afterbegin", '<svg class="cursor__arrow" viewBox="0 0 24 25" aria-hidden="true"><path d="M2 2 L20.3 10.8 L11.8 13.4 L5.9 21.9 Z"/></svg>');
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.08, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.08, ease: "power3" });
  window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener("pointerover", (e) => {
    const big = e.target.closest("[data-cursor]");
    const draw = e.target.closest("[data-pad] canvas");
    const link = e.target.closest("a, button, .globe-canvas, [data-tilt]");
    cursor.classList.toggle("is-big", !!big);
    cursor.classList.toggle("is-draw", !!draw);
    cursor.classList.toggle("is-link", !big && !draw && !!link);
    if (big) label.textContent = big.dataset.cursor;
  });
  document.addEventListener("pointerleave", () => gsap.to(cursor, { opacity: 0 }));
  document.addEventListener("pointerenter", () => gsap.to(cursor, { opacity: 1 }));
} else { $(".cursor")?.remove(); }

/* ---------- Magnetic ---------- */
if (canHover && !reduceMotion) {
  $$("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" });
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.25); });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

/* ---------- Boarding pass: 3D tilt + barcode ---------- */
$$("[data-barcode]").forEach((bc) => {
  const s = bc.dataset.barcode;
  let seed = [...s].reduce((a, c) => a + c.charCodeAt(0) * 31, 7);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 34; i++) {
    const b = document.createElement("i");
    const t = 1 + Math.round(rnd() * 3);
    b.style.flex = `0 0 ${t}px`;
    b.style.opacity = rnd() > 0.15 ? 1 : 0;
    bc.appendChild(b);
  }
});
if (canHover && !reduceMotion) {
  $$("[data-tilt]").forEach((card) => {
    // tilt the frame around the pass, not the pass itself: browsers drop the pass's shadow
    // (a CSS filter) while that same element has a 3D tilt applied
    const frame = card.closest(".pass-wrap") || card;
    gsap.set(frame, { transformPerspective: 1200 });
    const rx = gsap.quickTo(frame, "rotationX", { duration: 0.8, ease: "power3" });
    const ry = gsap.quickTo(frame, "rotationY", { duration: 0.8, ease: "power3" });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 14);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
    });
    card.addEventListener("pointerleave", () => { rx(0); ry(0); });
  });
}
// touch screens: tap the boarding pass to tear the stub off, tap again to put it back
if (!canHover) {
  $$(".pass").forEach((pass) => {
    pass.setAttribute("role", "button");
    pass.setAttribute("aria-pressed", "false");
    pass.addEventListener("click", () => {
      const torn = pass.classList.toggle("is-torn");
      pass.setAttribute("aria-pressed", String(torn));
      if (navigator.vibrate) navigator.vibrate(torn ? 12 : 6);   // tiny haptic "rip" where supported
    });
  });
}

/* ---------- Ticker ---------- */
$$(".ticker__track").forEach((track) => {
  track.innerHTML += track.innerHTML;
  if (reduceMotion) return;
  let x = 0, dir = -1, boost = 0;
  if (lenis) lenis.on("scroll", ({ velocity }) => { boost = Math.min(Math.abs(velocity) * 0.4, 10); if (velocity) dir = velocity > 0 ? -1 : 1; });
  const band = track.closest(".ticker");
  let w = track.scrollWidth / 2;
  addEventListener("resize", () => (w = track.scrollWidth / 2));
  gsap.ticker.add(() => {
    if (band.classList.contains("is-offscreen")) return;   // rest when not visible
    x += dir * (0.6 + boost); boost *= 0.92;
    if (x <= -w) x += w; if (x > 0) x -= w;
    gsap.set(track, { x });
  });
});

/* ---------- Reveals ---------- */
if (!reduceMotion) {
  $$("[data-split]:not([data-split='hero'])").forEach((el) => {
    gsap.from($$(".w > span", el), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 92%",
    onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, overwrite: true }),
    once: true,
  });
  $$("[data-fill]").forEach((el) => {
    gsap.to(splitFill(el), { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 55%", scrub: true } });
  });
  $$("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count), pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = pre + Math.round(o.v).toLocaleString("en-US") + suf) });
  });
} else {
  $$("[data-fill]").forEach((el) => splitFill(el).forEach((w) => (w.style.opacity = 1)));
}

/* ---------- Flight log: scroll flies the plane ---------- */
// two maps ship in the HTML: wide (desktop) and stacked (phones). Keep the one that fits this screen.
{
  const phone = matchMedia("(max-width: 640px)").matches;
  const drop = $(phone ? ".log__map--d" : ".log__map--m");
  if (drop && $(phone ? ".log__map--m" : ".log__map--d")) drop.remove();
}
const route = $("#route");
if (route) {
  const len = route.getTotalLength();
  const pins = $$(".log__map .pin"), stops = $$(".stop"), status = $(".log__status");
  const names = ["Departed: HYD", "Landed: Ithaca", "Landed: New York", "Landed: Charlotte", "Landed: Boise", "Landed: San Francisco", "Home: Mumbai"];
  // find where along the path each pin sits (fraction 0–1)
  const marks = pins.map((p) => {
    const m = p.getAttribute("transform").match(/translate\(([\d.]+)[ ,]+([\d.]+)\)/);
    const px = +m[1], py = +m[2];
    let best = 0, bestD = Infinity;
    for (let i = 0; i <= 600; i++) {
      const pt = route.getPointAtLength((i / 600) * len);
      const d = (pt.x - px) ** 2 + (pt.y - py) ** 2;
      if (d < bestD) { bestD = d; best = i / 600; }
    }
    return best;
  });
  marks[0] = 0; marks[marks.length - 1] = 1;
  const cardsRow = $(".log__cards");
  let lastCur = -1;
  const setActive = (p) => {
    let cur = 0;
    marks.forEach((m, i) => {
      const on = p >= m - 0.015;
      pins[i].classList.toggle("is-on", on);
      if (on) cur = i;
    });
    // a card can cover several pins (Boise + SF share one): it lights up at its first pin
    let curCard = stops[0];
    stops.forEach((card) => {
      const on = +card.dataset.stop <= cur;
      card.classList.toggle("is-on", on);
      if (on) curCard = card;
    });
    // on phones the cards are a sideways strip: keep the current stop in view
    if (cur !== lastCur && cardsRow && cardsRow.scrollWidth > cardsRow.clientWidth + 4) {
      cardsRow.scrollTo({ left: curCard.offsetLeft - cardsRow.offsetLeft, behavior: "smooth" });
    }
    lastCur = cur;
    if (status) status.textContent = p >= 0.995 ? "Arrived home. Building." : names[cur] + " · cruising";
  };
  gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set("#plane", { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: true, end: 0 } });
  setActive(0);

  if (reduceMotion) {
    gsap.set(route, { strokeDashoffset: 0 }); setActive(1);
  } else {
    const tl = gsap.timeline({ defaults: { ease: "none" } })
      .to(route, { strokeDashoffset: 0 }, 0)
      .to("#plane", { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: true } }, 0);
    ScrollTrigger.create({
      trigger: ".log__pin", pin: true, start: "top top", end: () => "+=" + Math.round(innerHeight * 1.8),
      scrub: 0.8, animation: tl, anticipatePin: 1,
      onUpdate: (s) => setActive(s.progress),
    });
  }
}

/* ---------- Micron wafer dies ---------- */
$$("[data-wafer]").forEach((g) => {
  const cx = 150, cy = 100, R = 70, s = 12, gap = 2;
  let html = "";
  for (let y = cy - R; y < cy + R; y += s + gap) {
    for (let x = cx - R; x < cx + R; x += s + gap) {
      const mx = x + s / 2, my = y + s / 2, d = Math.hypot(mx - cx, my - cy);
      if (d + s * 0.7 > R) continue;
      const lit = Math.random() > 0.35 ? " lit" : "";
      html += `<rect class="die${lit}" x="${x}" y="${y}" width="${s}" height="${s}" rx="1.5" style="--d:${(d / R * 1.6).toFixed(2)}s"/>`;
    }
  }
  g.innerHTML = html;
});

/* ---------- Decision loop runner ---------- */
const runner = $("#runner");
if (runner) {
  const nodes = $$(".loop .node");
  const tween = gsap.to(runner, {
    motionPath: { path: "#loopPath", align: "#loopPath", alignOrigin: [0.5, 0.5] },
    duration: 7, ease: "none", repeat: -1,
    onUpdate() {
      const p = this.progress();
      const idx = [0.03, 0.27, 0.52, 0.77].findIndex((m) => Math.abs(p - m) < 0.07 || Math.abs(p - m - 1) < 0.07);
      nodes.forEach((n, i) => n.classList.toggle("hot", i === idx));
    },
  });
  if (reduceMotion) tween.pause(0);
  else {
    const box = runner.closest(".cell");
    box.addEventListener("offscreen", () => tween.pause());
    box.addEventListener("onscreen", () => tween.resume());
  }
}

/* ---------- Ritual AI: voice-logging demo ---------- */
const ritual = $("[data-transcript]");
if (ritual) {
  const wave = $("[data-wave]"), parsed = $("[data-parsed]"), mic = $("[data-mic]");
  for (let i = 0; i < 28; i++) wave.appendChild(document.createElement("i"));
  const bars = $$("i", wave);
  const lines = [
    { say: "Bench press, three sets of eight.", tags: ["Chest", "Triceps", "Front delts"], next: "Next: incline DB press" },
    { say: "Pull-ups, four sets to failure.", tags: ["Lats", "Biceps", "Rear delts"], next: "Next: barbell rows" },
    { say: "Squats, five by five. Felt heavy.", tags: ["Quads", "Glutes", "Core"], next: "Next: Romanian deadlifts" },
  ];
  let i = 0, run = 0, waveTimer = null;
  const waveOn = (on) => {
    wave.classList.toggle("on", on);
    clearInterval(waveTimer);
    if (on) waveTimer = setInterval(() => bars.forEach((b) => (b.style.height = 4 + Math.random() * 24 + "px")), 110);
    else bars.forEach((b) => (b.style.height = "4px"));
  };
  async function play() {
    const id = ++run, line = lines[i++ % lines.length];
    ritual.textContent = ""; parsed.innerHTML = "";
    waveOn(true);
    for (const ch of line.say) { if (id !== run) return; ritual.textContent += ch; await sleep(38); }
    waveOn(false); await sleep(300);
    for (const t of [...line.tags, line.next]) {
      if (id !== run) return;
      const s = document.createElement("span"); s.textContent = t; if (t === line.next) s.className = "next";
      parsed.appendChild(s); gsap.from(s, { y: 8, opacity: 0, duration: 0.4, ease: "back.out(2)" });
      await sleep(220);
    }
    await sleep(2600);
    if (id === run && auto) play();
  }
  let auto = false;
  ScrollTrigger.create({ trigger: ritual, start: "top 90%", end: "bottom top", onToggle: (s) => { auto = s.isActive; if (auto) play(); else { run++; waveOn(false); } } });
  mic.addEventListener("click", () => { auto = true; play(); });
}

/* ---------- Doodle pad ---------- */
$$("[data-pad]").forEach((pad) => {
  const canvas = $("canvas", pad), ctx = canvas.getContext("2d");
  let color = "#121212", drawing = false, last = null, saved = null;
  const size = () => {
    const r = pad.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width) saved = canvas.toDataURL();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (saved) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height); img.src = saved; }
  };
  size(); new ResizeObserver(size).observe(pad);
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener("pointerdown", (e) => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); pad.classList.add("used"); });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = color; ctx.lineWidth = 2.6 + Math.min(Math.hypot(p.x - last.x, p.y - last.y) * 0.05, 2);
    ctx.beginPath(); ctx.moveTo(last.x, last.y);
    ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p;
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => canvas.addEventListener(ev, () => (drawing = false)));
  $$("[data-color]", pad).forEach((b) => b.addEventListener("click", () => { color = b.dataset.color; $$("[data-color]", pad).forEach((x) => x.classList.toggle("is-on", x === b)); }));
  $("[data-clear]", pad).addEventListener("click", () => { ctx.clearRect(0, 0, canvas.width, canvas.height); pad.classList.remove("used"); saved = null; });
});

/* ---------- Fitness: what it gave me ---------- */
const fitWord = $("[data-fit-word]"), fitRing = $("[data-fit-ring]");
if (fitWord) {
  const words = ["discipline", "an identity", "confidence", "peace of mind", "clarity", "my escape"];
  let k = 0;
  const cycle = () => {
    gsap.fromTo(fitRing, { strokeDashoffset: 201 }, { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut" });
    gsap.delayedCall(2.4, () => {
      k = (k + 1) % words.length;
      gsap.to(fitWord, { yPercent: -60, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: () => {
        fitWord.textContent = words[k];
        gsap.fromTo(fitWord, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "back.out(2)" });
        cycle();
      } });
    });
  };
  if (!reduceMotion) cycle(); else gsap.set(fitRing, { strokeDashoffset: 0 });
}

/* ---------- Watch ticks ---------- */
$$(".watch .ticks").forEach((g) => {
  g.innerHTML = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, r1 = i % 3 ? 38 : 34;
    return `<line class="tick" x1="${50 + Math.sin(a) * r1}" y1="${50 - Math.cos(a) * r1}" x2="${50 + Math.sin(a) * 41}" y2="${50 - Math.cos(a) * 41}"/>`;
  }).join("");
});

/* ---------- Camera shutter flash ---------- */
$$(".c-photo").forEach((c) => c.addEventListener("pointerenter", () => gsap.fromTo($(".flash", c), { opacity: 0.9 }, { opacity: 0, duration: 0.6, ease: "power2.out" })));

/* ---------- Split-flap departure board ---------- */
$$("[data-board]").forEach((board) => {
  const text = board.dataset.board, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const flaps = [...text].map((ch) => {
    const f = document.createElement("span");
    f.className = "flap" + (ch === " " ? " space" : ""); f.textContent = ch === " " ? "" : ch; board.appendChild(f);
    return { f, ch };
  });
  const flip = () => flaps.forEach(({ f, ch }, i) => {
    if (ch === " ") return;
    let n = 0; const total = 8 + i * 2;
    const t = setInterval(() => { f.textContent = n++ >= total ? ch : chars[Math.floor(Math.random() * chars.length)]; if (n > total) clearInterval(t); }, 45);
  });
  if (!reduceMotion) ScrollTrigger.create({ trigger: board, start: "top 90%", onEnter: flip, onEnterBack: flip });
});

/* ---------- Copy email ---------- */
$$("[data-copy]").forEach((el) => el.addEventListener("click", async (e) => {
  try {
    await navigator.clipboard.writeText(el.dataset.copy); e.preventDefault();
    const t = $(".toast"); t.classList.add("is-on"); setTimeout(() => t.classList.remove("is-on"), 2200);
  } catch (err) {}
}));

/* ---------- Clocks ---------- */
const clocks = $$("[data-clock]");
const tick = () => clocks.forEach((c) => (c.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: c.dataset.clock })));
tick(); setInterval(tick, 15000);

/* ---------- Performance: animations rest while they're off-screen ---------- */
const offscreenIO = new IntersectionObserver((entries) => entries.forEach((e) => {
  const el = e.target, on = e.isIntersecting;
  el.classList.toggle("is-offscreen", !on);                         // CSS pauses keyframe animations
  $$("svg", el).forEach((s) => { try { on ? s.unpauseAnimations() : s.pauseAnimations(); } catch (_) {} });  // SMIL
  el.dispatchEvent(new Event(on ? "onscreen" : "offscreen"));
}), { rootMargin: "120px 0px" });
$$(".hero, .ticker, .case, .cell, .log__map, .nav__logo").forEach((el) => offscreenIO.observe(el));

const lazyIO = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  lazyIO.unobserve(e.target); e.target._load && e.target._load();
}), { rootMargin: "900px 0px" });

/* ---------- Image slots: data-src="images/name" tries .jpg/.jpeg/.png/.webp ---------- */
$$("[data-src]").forEach((slot) => {
  const base = slot.dataset.src;
  const exts = /\.[a-z0-9]+$/i.test(base) ? [""] : [".jpg", ".jpeg", ".png", ".webp"];
  const tryNext = (i) => {
    if (i >= exts.length) return;
    const img = new Image();
    img.alt = slot.dataset.alt || ""; img.decoding = "async";
    if (slot.dataset.pos) img.style.objectPosition = slot.dataset.pos;
    if (slot.dataset.fit) img.style.objectFit = slot.dataset.fit;
    img.onload = () => {
      slot.prepend(img); slot.classList.add("has-img");
      // logos shown with data-fit="contain": paint the box in the logo's own edge colour so it fills the frame
      if (slot.dataset.fit === "contain") {
        try {
          const c = document.createElement("canvas"); c.width = c.height = 1;
          const g = c.getContext("2d"); g.drawImage(img, 2, 2, 1, 1, 0, 0, 1, 1);
          const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
          slot.style.background = `rgb(${r}, ${gr}, ${b})`;
        } catch (e) {}
      }
    };
    img.onerror = () => tryNext(i + 1);
    img.src = base + exts[i];
  };
  // photos already written into the HTML (case pages) load natively; just finish their styling
  const pre = slot.querySelector(":scope > img");
  if (pre) {
    const done = () => {
      slot.classList.add("has-img");
      if (slot.dataset.fit === "contain") {
        try {
          const c = document.createElement("canvas"); c.width = c.height = 1;
          const g = c.getContext("2d"); g.drawImage(pre, 2, 2, 1, 1, 0, 0, 1, 1);
          const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
          slot.style.background = `rgb(${r}, ${gr}, ${b})`;
        } catch (e) {}
      }
    };
    pre.complete && pre.naturalWidth ? done() : pre.addEventListener("load", done, { once: true });
    return;
  }
  // otherwise load each photo only when it's about a screen away, so the first paint stays light
  lazyIO.observe(slot); slot._load = () => tryNext(0);
});

/* ---------- Lightbox (case pages) ---------- */
const lb = $(".lightbox");
if (lb) {
  const img = $("img", lb), cap = $("p", lb);
  $$(".shot").forEach((s) => s.addEventListener("click", () => {
    const src = $("img", s)?.src; if (!src) return;
    img.src = src; cap.textContent = $("figcaption", s)?.textContent || "";
    lb.classList.add("is-on"); lenis && lenis.stop();
  }));
  const close = () => { lb.classList.remove("is-on"); lenis && lenis.start(); };
  lb.addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && close());
}

/* ---------- Go ---------- */
pageArrive().then(() => {
  if (document.body.dataset.page !== "home" && !reduceMotion) {
    gsap.from($$('[data-split="hero"] .w > span'), { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.04 });
  }
});
runIntro();
addEventListener("load", () => ScrollTrigger.refresh());
