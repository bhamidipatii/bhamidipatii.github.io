/* =========================================================
   Travel globe (cobe: tiny WebGL globe)
   ✏️  ADD A PLACE: append { name, note, lat, lng, region, type } below.
       region: "india" | "usa" | "world"
       type:   "home" (home base) | "lived" (lived / worked) | "travel"
   ========================================================= */
import createGlobe from "https://cdn.jsdelivr.net/npm/cobe@0.6.3/+esm";

const PLACES = [
  // ---- India ----
  { name: "Hyderabad", note: "Home base", lat: 17.385, lng: 78.4867, region: "india", type: "home" },
  { name: "Mumbai", note: "Now", lat: 19.076, lng: 72.8777, region: "india", type: "lived" },
  { name: "Delhi", note: "Capital", lat: 28.6139, lng: 77.209, region: "india" },
  { name: "Ladakh", note: "Leh", lat: 34.1526, lng: 77.5771, region: "india" },
  { name: "Manali", note: "Himachal", lat: 32.2432, lng: 77.1892, region: "india" },
  { name: "Shimla", note: "Himachal", lat: 31.1048, lng: 77.1734, region: "india" },
  { name: "Jaipur", note: "Rajasthan", lat: 26.9124, lng: 75.7873, region: "india" },
  { name: "Udaipur", note: "Rajasthan", lat: 24.5854, lng: 73.7125, region: "india" },
  { name: "Kolkata", note: "West Bengal", lat: 22.5726, lng: 88.3639, region: "india" },
  { name: "Lonavala", note: "Maharashtra", lat: 18.7546, lng: 73.4062, region: "india" },
  { name: "Goa", note: "Goa", lat: 15.2993, lng: 74.124, region: "india" },
  { name: "Munnar", note: "Kerala", lat: 10.0889, lng: 77.0595, region: "india" },
  { name: "Andaman", note: "Islands", lat: 11.6234, lng: 92.7265, region: "india" },

  // ---- USA ----
  { name: "Ithaca", note: "Cornell", lat: 42.444, lng: -76.5019, region: "usa", type: "lived" },
  { name: "Charlotte", note: "Lowe’s", lat: 35.2271, lng: -80.8431, region: "usa", type: "lived" },
  { name: "Boise", note: "Micron", lat: 43.615, lng: -116.2023, region: "usa", type: "lived" },
  { name: "San Francisco", note: "CA", lat: 37.7749, lng: -122.4194, region: "usa" },
  { name: "New York City", note: "NY", lat: 40.7128, lng: -74.006, region: "usa" },
  { name: "Syracuse", note: "NY", lat: 43.0481, lng: -76.1474, region: "usa" },
  { name: "Boston", note: "MA", lat: 42.3601, lng: -71.0589, region: "usa" },
  { name: "Maine", note: "ME", lat: 43.6591, lng: -70.2568, region: "usa" },
  { name: "Newark", note: "NJ", lat: 40.7357, lng: -74.1724, region: "usa" },
  { name: "Philadelphia", note: "PA", lat: 39.9526, lng: -75.1652, region: "usa" },
  { name: "Baltimore", note: "MD", lat: 39.2904, lng: -76.6122, region: "usa" },
  { name: "Washington, DC", note: "DC", lat: 38.9072, lng: -77.0369, region: "usa" },
  { name: "Durham", note: "NC", lat: 35.994, lng: -78.8986, region: "usa" },
  { name: "Outer Banks", note: "NC", lat: 35.5585, lng: -75.4665, region: "usa" },
  { name: "Asheville", note: "NC", lat: 35.5951, lng: -82.5515, region: "usa" },
  { name: "Atlanta", note: "GA", lat: 33.749, lng: -84.388, region: "usa" },
  { name: "Jacksonville", note: "FL", lat: 30.3322, lng: -81.6557, region: "usa" },
  { name: "Miami", note: "FL", lat: 25.7617, lng: -80.1918, region: "usa" },
  { name: "Fort Lauderdale", note: "FL", lat: 26.1224, lng: -80.1373, region: "usa" },
  { name: "Knoxville", note: "TN", lat: 35.9606, lng: -83.9207, region: "usa" },
  { name: "Nashville", note: "TN", lat: 36.1627, lng: -86.7816, region: "usa" },
  { name: "Detroit", note: "MI", lat: 42.3314, lng: -83.0458, region: "usa" },
  { name: "Minneapolis", note: "MN", lat: 44.9778, lng: -93.265, region: "usa" },
  { name: "St. Louis", note: "MO", lat: 38.627, lng: -90.1994, region: "usa" },
  { name: "Dallas", note: "TX", lat: 32.7767, lng: -96.797, region: "usa" },
  { name: "Austin", note: "TX", lat: 30.2672, lng: -97.7431, region: "usa" },
  { name: "San Antonio", note: "TX", lat: 29.4241, lng: -98.4936, region: "usa" },
  { name: "Oklahoma City", note: "OK", lat: 35.4676, lng: -97.5164, region: "usa" },
  { name: "Denver", note: "CO", lat: 39.7392, lng: -104.9903, region: "usa" },
  { name: "Yellowstone", note: "National Park", lat: 44.428, lng: -110.5885, region: "usa" },
  { name: "Grand Tetons", note: "National Park", lat: 43.7904, lng: -110.6818, region: "usa" },
  { name: "Phoenix", note: "AZ", lat: 33.4484, lng: -112.074, region: "usa" },
  { name: "Grand Canyon", note: "National Park", lat: 36.1069, lng: -112.1129, region: "usa" },
  { name: "Zion", note: "National Park", lat: 37.2982, lng: -113.0263, region: "usa" },
  { name: "Las Vegas", note: "NV", lat: 36.1699, lng: -115.1398, region: "usa" },
  { name: "Los Angeles", note: "CA", lat: 34.0522, lng: -118.2437, region: "usa" },
  { name: "San Diego", note: "CA", lat: 32.7157, lng: -117.1611, region: "usa" },
  { name: "Portland", note: "OR", lat: 45.5152, lng: -122.6784, region: "usa" },
  { name: "Cannon Beach", note: "OR", lat: 45.8918, lng: -123.9615, region: "usa" },
  { name: "Seattle", note: "WA", lat: 47.6062, lng: -122.3321, region: "usa" },
  { name: "Hawaii", note: "HI", lat: 21.3069, lng: -157.8583, region: "usa" },

  // ---- Rest of the world ----
  { name: "Taipei", note: "Taiwan", lat: 25.033, lng: 121.5654, region: "world" },
  { name: "Singapore", note: "Singapore", lat: 1.3521, lng: 103.8198, region: "world" },
  { name: "Bangkok", note: "Thailand", lat: 13.7563, lng: 100.5018, region: "world" },
  { name: "Bali", note: "Indonesia", lat: -8.3405, lng: 115.092, region: "world" },
  { name: "Amsterdam", note: "Netherlands", lat: 52.3676, lng: 4.9041, region: "world" },
];

const REGIONS = [
  { id: "usa", label: "USA", center: [38, -98] },
  { id: "world", label: "World", center: [15, 100] },
  { id: "india", label: "India", center: [22, 80] },
];

const canvas = document.querySelector(".globe-canvas");
const list = document.querySelector("[data-places]");
const tabs = document.querySelector("[data-tabs]");
const stats = document.querySelector("[data-stats]");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const toAngles = (lat, lng) => [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
  let phi = toAngles(38, -98)[0], theta = 0.45;  // start facing the USA
  let focus = null, resumeAt = 0, dragX = null, velocity = 0;
  let width = canvas.offsetWidth;
  const flyTo = (lat, lng, hold = 6000) => { focus = toAngles(lat, lng); resumeAt = performance.now() + hold; };

  // stats line
  const count = (r) => PLACES.filter((p) => p.region === r).length;
  const countries = 2 + new Set(PLACES.filter((p) => p.region === "world").map((p) => p.note)).size;
  if (stats) stats.innerHTML = `<b>${countries}</b> countries · <b>${count("usa")}</b> US stops · <b>${count("india")}</b> in India`;

  // region tabs + place list
  const renderList = (region) => {
    list.innerHTML = "";
    PLACES.filter((p) => p.region === region).forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `<button type="button" class="${p.type === "home" || p.type === "lived" ? "is-lived" : ""}"><span>${p.name}</span><small>${p.note}</small></button>`;
      li.querySelector("button").addEventListener("click", (e) => {
        flyTo(p.lat, p.lng);
        list.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === e.currentTarget));
      });
      list.appendChild(li);
    });
    list.scrollTop = 0;
  };
  REGIONS.forEach((r, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `${r.label} <small>${count(r.id)}</small>`;
    b.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
      renderList(r.id); flyTo(...r.center, 8000);
    });
    if (i === 0) b.classList.add("is-on");
    tabs.appendChild(b);
  });
  renderList("usa");

  // world pins are lonelier, so they get a bigger dot to stay visible
const size = (p) => (p.type === "home" ? 0.1 : p.type === "lived" ? 0.075 : p.region === "world" ? 0.08 : 0.045);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const globe = createGlobe(canvas, {
    devicePixelRatio: dpr, width: width * dpr, height: width * dpr,
    phi, theta, dark: 1, diffuse: 1.3, mapSamples: 14000, mapBrightness: 5.5,
    baseColor: [0.32, 0.32, 0.34], markerColor: [0.83, 1, 0.23], glowColor: [0.18, 0.18, 0.2],
    markers: PLACES.map((p) => ({ location: [p.lat, p.lng], size: size(p) })),
    onRender(state) {
      if (focus) {
        const [fp, ft] = focus, TAU = Math.PI * 2;
        const pos = ((fp - phi) % TAU + TAU) % TAU, neg = ((phi - fp) % TAU + TAU) % TAU;
        phi += pos < neg ? pos * 0.07 : -neg * 0.07;
        theta = theta * 0.92 + ft * 0.08;
        if (performance.now() > resumeAt) focus = null;
      } else if (dragX === null) {
        phi += reduceMotion ? 0 : 0.0026 + velocity;
        velocity *= 0.95;
        theta = theta * 0.985 + 0.35 * 0.015;
      }
      state.phi = phi; state.theta = theta;
      state.width = width * dpr; state.height = width * dpr;
    },
  });
  requestAnimationFrame(() => canvas.classList.add("ready"));
  // stop drawing the 3D globe while it's scrolled out of view (biggest smoothness win)
  if (typeof globe.toggle === "function") {
    new IntersectionObserver(([e]) => globe.toggle(e.isIntersecting), { rootMargin: "200px 0px" }).observe(canvas);
  }

  canvas.addEventListener("pointerdown", (e) => { dragX = e.clientX; focus = null; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (dragX === null) return;
    const d = e.clientX - dragX; dragX = e.clientX;
    phi += d / 180; velocity = d / 4000;
  });
  const up = () => (dragX = null);
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  new ResizeObserver(() => (width = canvas.offsetWidth)).observe(canvas);
}
