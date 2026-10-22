/* Static layered composition. Page corners, not a cropped artboard, define
   the diagonals and spectrum. Circular image assets keep their proportions. */
(() => {
  const landing = document.querySelector('.landing');
  if (!landing) return;
  const display = landing.querySelector('.composite');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  const output = display.getContext('2d', { alpha: false });
  if (!ctx || !output) return;
  const assets = ['eclipse-upper.png', 'eclipse-left.png', 'eclipse-center.png', 'eclipse-right.png', 'eclipse-lower.png', 'spectrum.svg', 'circles.svg', 'wordmark.svg', 'enter.svg', 'noise-source.png', 'grain.png'];
  const images = {};
  const resolved = document.createElement('canvas');
  const resolvedCtx = resolved.getContext('2d');
  const group = document.createElement('canvas');
  const groupCtx = group.getContext('2d');
  const glyph = document.createElement('canvas');
  const glyphCtx = glyph.getContext('2d');
  const ink = document.createElement('canvas');
  const inkCtx = ink.getContext('2d');
  let ready = false, queued = false;

  function layout() {
    const { width, height } = landing.getBoundingClientRect();
    const geometry = window.eclipseGeometry(width, height);
    const typeScale = geometry.portrait ? Math.min(.32, Math.max(.26, width / 1400)) : Math.min(1, Math.max(.235, width / 3840));
    landing.style.setProperty('--type-scale', typeScale);
    for (const moon of geometry.moons) {
      const selectors = moon.name === 'center' ? '.center' : `.${moon.name}`;
      for (const image of landing.querySelectorAll(selectors)) {
        Object.assign(image.style, { left: `${moon.left}px`, top: `${moon.top}px`, width: `${moon.width}px`, height: `${moon.height}px` });
      }
    }
    const place = (selector, box) => Object.assign(landing.querySelector(selector).style,
      { left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px` });
    place('.spectrum', geometry.beam);
    place('.circles', geometry.circles);
    place('.crosshair', { x: 0, y: 0, width, height });
    if (ready) render(geometry, typeScale);
  }

  // Exact area integration, rather than four-point GPU interpolation, keeps
  // fine balanced grain quiet without blurring eclipse edges or diagonals.
  function resolveArt(width, height) {
    const w = Math.round(width), h = Math.round(height);
    resolved.width = w; resolved.height = h;
    const sw = canvas.width, sh = canvas.height;
    const source = ctx.getImageData(0, 0, sw, sh).data;
    const image = resolvedCtx.createImageData(w, h), dest = image.data;
    const sx = sw / w, sy = sh / h, area = sx * sy;
    for (let y = 0; y < h; y++) {
      const top = y * sy, bottom = (y + 1) * sy;
      const firstY = Math.floor(top), lastY = Math.min(sh, Math.ceil(bottom));
      for (let x = 0; x < w; x++) {
        const left = x * sx, right = (x + 1) * sx;
        const firstX = Math.floor(left), lastX = Math.min(sw, Math.ceil(right));
        let red = 0, green = 0, blue = 0;
        for (let yy = firstY; yy < lastY; yy++) {
          const wy = Math.min(bottom, yy + 1) - Math.max(top, yy);
          let index = (yy * sw + firstX) * 4;
          for (let xx = firstX; xx < lastX; xx++, index += 4) {
            const weight = wy * (Math.min(right, xx + 1) - Math.max(left, xx));
            red += source[index] * weight; green += source[index + 1] * weight; blue += source[index + 2] * weight;
          }
        }
        const index = (y * w + x) * 4;
        // A small, resolution-independent monochrome finish (±6/255).
        // This retains a fine texture after exact area averaging.
        let hash = Math.imul(x ^ Math.imul(y + 3975, 0x9e3779b1), 0x85ebca6b);
        hash ^= hash >>> 13;
        const grain = (hash >>> 0) % 13 - 6;
        dest[index] = red / area + grain; dest[index + 1] = green / area + grain; dest[index + 2] = blue / area + grain; dest[index + 3] = 255;
      }
    }
    resolvedCtx.putImageData(image, 0, 0);
  }

  function render(g, typeScale) {
    const { width, height, radius } = g;
    const ratio = Math.min(4, Math.sqrt(14000000 / (width * height)));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    group.width = canvas.width;
    group.height = canvas.height;
    ctx.fillStyle = ctx.createPattern(images['noise-source.png'], 'repeat');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const screen = c => {
      c.setTransform(ratio, 0, 0, ratio, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
    };
    screen(groupCtx);
    for (const moon of g.moons) groupCtx.drawImage(images[moon.asset], moon.left, moon.top, moon.width, moon.height);
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.globalAlpha = .5;
    ctx.drawImage(group, 0, 0);
    ctx.globalAlpha = 1;
    screen(ctx);
    const center = g.moons[2];
    ctx.drawImage(images[center.asset], center.left, center.top, center.width, center.height);
    const beam = g.beam;
    ctx.drawImage(images['spectrum.svg'], beam.x, beam.y, beam.width, beam.height);
    ctx.globalCompositeOperation = 'source-over';
    const circles = g.circles;
    ctx.drawImage(images['circles.svg'], circles.x, circles.y, circles.width, circles.height);
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = Math.max(.3, radius / 160);
    ctx.beginPath();
    for (const [x1, y1, x2, y2] of g.diagonals) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
    ctx.stroke();
    for (const blur of [6, 15]) {
      ctx.save();
      ctx.filter = `blur(${blur * radius / 160}px)`;
      ctx.fillStyle = '#d9d9d9';
      ctx.beginPath(); ctx.arc(g.center.x, g.center.y, radius / 10, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    const displayRatio = Math.min(window.devicePixelRatio || 1, 2);
    display.width = Math.round(width * displayRatio); display.height = Math.round(height * displayRatio);
    output.imageSmoothingEnabled = true; output.imageSmoothingQuality = 'high';
    resolveArt(width, height);
    output.drawImage(resolved, 0, 0, display.width, display.height);
    output.setTransform(displayRatio, 0, 0, displayRatio, 0, 0);
    const origin = landing.getBoundingClientRect();
    const localBox = selector => {
      const box = landing.querySelector(selector).getBoundingClientRect();
      return { x: box.x - origin.x, y: box.y - origin.y, width: box.width, height: box.height };
    };
    /* Color-dodge each glyph on an identical grain-only backdrop, then mask
       to the glyph. Underlying circles and spectrum cannot change its ink. */
    function typography(box, paint) {
      glyph.width = Math.max(1, Math.ceil(box.width * ratio));
      glyph.height = Math.max(1, Math.ceil(box.height * ratio));
      ink.width = glyph.width; ink.height = glyph.height;
      screen(glyphCtx); paint(glyphCtx);
      inkCtx.fillStyle = inkCtx.createPattern(images['grain.png'], 'repeat');
      inkCtx.fillRect(0, 0, ink.width, ink.height);
      inkCtx.globalCompositeOperation = 'color-dodge';
      inkCtx.drawImage(glyph, 0, 0);
      inkCtx.globalCompositeOperation = 'destination-in';
      inkCtx.drawImage(glyph, 0, 0);
      output.globalAlpha = .65;
      output.drawImage(ink, box.x, box.y, ink.width / ratio, ink.height / ratio);
      output.globalAlpha = 1;
    }
    const title = localBox('.wordmark');
    typography({ x: title.x - 50 * typeScale, y: title.y - 50 * typeScale, width: 846 * typeScale, height: 201 * typeScale },
      c => c.drawImage(images['wordmark.svg'], 0, 0, 846 * typeScale, 201 * typeScale));
    const entry = localBox('.enter');
    typography({ x: entry.x, y: entry.y + (entry.height - 101 * typeScale) / 2, width: 541 * typeScale, height: 101 * typeScale },
      c => c.drawImage(images['enter.svg'], 0, 0, 541 * typeScale, 101 * typeScale));
    const style = getComputedStyle(landing.querySelector('.license'));
    for (const selector of ['.license-prefix', '.license a']) {
      const element = landing.querySelector(selector), box = localBox(selector);
      typography(box, c => {
        c.fillStyle = '#fff';
        c.font = `${style.fontSize} "Sarasa Gothic SC", sans-serif`;
        c.textBaseline = 'alphabetic';
        if ('letterSpacing' in c) c.letterSpacing = style.letterSpacing;
        const metrics = c.measureText(element.textContent);
        const ascent = metrics.fontBoundingBoxAscent || parseFloat(style.fontSize) * .88;
        const descent = metrics.fontBoundingBoxDescent || parseFloat(style.fontSize) * .2;
        const align = getComputedStyle(element).textAlign;
        c.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
        const x = c.textAlign === 'center' ? box.width / 2 : c.textAlign === 'right' ? box.width : 0;
        c.fillText(element.textContent, x, (box.height - ascent - descent) / 2 + ascent);
      });
    }
    const pixels = output.getImageData(8, 8, 64, 64).data;
    let sum = 0, squared = 0;
    for (let i = 0; i < pixels.length; i += 4) { sum += pixels[i]; squared += pixels[i] ** 2; }
    display.dataset.grain = JSON.stringify({ mean: sum / 4096, deviation: Math.sqrt(squared / 4096 - (sum / 4096) ** 2) });
    landing.classList.add('rendered');
    display.dataset.composite = 'color-dodge';
    display.dataset.geometry = JSON.stringify({ center: g.center, radius, moons: g.moons.map(m => [m.x, m.y]), diagonals: g.diagonals, beamCorner: [width, height], typography: 'isolated' });
    display.dataset.resolution = `${canvas.width}x${canvas.height}`;
  }
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; layout(); });
  };
  layout(); new ResizeObserver(schedule).observe(landing);
  Promise.all(assets.map(name => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => { images[name] = image; resolve(); };
    image.onerror = () => reject(new Error(`Unable to load ${name}`)); image.src = `assets/${name}?v=2`;
  }))).then(() => document.fonts.ready).then(() => { ready = true; layout(); })
    .catch(error => console.warn('Using accessible HTML/CSS fallback:', error.message));
})();
