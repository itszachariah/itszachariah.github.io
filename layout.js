/* The tiny binary grain participates in color-dodge BEFORE downsampling.
   Compositing at a higher resolution preserves Figma's speckled highlights;
   CSS blending after scaling would incorrectly turn them solid white.
   All artwork is drawn from the separate, unmodified Figma assets. */
(() => {
  const landing = document.querySelector('.landing');
  if (!landing) return;
  const display = landing.querySelector('.composite');
  const canvas = document.createElement('canvas');
  const output = display.getContext('2d', { alpha: false });
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return; // The HTML/CSS version remains fully usable.
  const assetNames = ['eclipse-upper.png', 'eclipse-left.png', 'eclipse-right.png', 'eclipse-lower.png', 'eclipse-center.png', 'spectrum.svg', 'circles.svg', 'crosshair.svg', 'wordmark.svg', 'enter.svg', 'noise-source.png'];
  const images = {};
  let ready = false;
  let queued = false;
  const group = document.createElement('canvas');
  const groupCtx = group.getContext('2d');

  const layout = () => {
    const { width, height } = landing.getBoundingClientRect();
    const scale = Math.max(width / 3840, height / 2560);
    const portrait = width / height < .8;
    const typeScale = portrait ? Math.min(.32, Math.max(.26, width / 1400)) : Math.min(1, Math.max(.235, width / 3840));
    landing.style.setProperty('--scene-scale', scale);
    landing.style.setProperty('--type-scale', typeScale);
    landing.style.setProperty('--grain-period', `${512 / scale}px`);
    if (ready) render(width, height, scale, typeScale, portrait);
  };

  function render(width, height, scale, typeScale, portrait) {
    // Bound memory on large screens while retaining supersampled grain.
    const ratio = Math.min(4, Math.sqrt(14000000 / (width * height)));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    group.width = canvas.width;
    group.height = canvas.height;
    ctx.fillStyle = ctx.createPattern(images['noise-source.png'], 'repeat');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const world = c => {
      c.setTransform(scale * ratio, 0, 0, scale * ratio,
        (width / 2 - 1920 * scale) * ratio,
        (height / 2 - 1280 * scale) * ratio);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
    };
    const draw = (c, name, x, y, w, h) => c.drawImage(images[name], x, y, w, h);
    const placements = portrait
      ? [[954, 110, 1272, 852], [1099, 550, 1218, 816], [1523, 1294, 1218, 816], [1615, 1669, 1218, 816], [1299, 874, 1218, 816]]
      : [[264, -170, 1272, 852], [799, 360, 1218, 816], [1823, 1384, 1218, 816], [2335, 1869, 1218, 816], [1299, 874, 1218, 816]];
    world(groupCtx);
    assetNames.slice(0, 5).forEach((name, i) => draw(groupCtx, name, ...placements[i]));
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.globalAlpha = .5;
    ctx.drawImage(group, 0, 0);
    ctx.globalAlpha = 1;
    world(ctx);
    draw(ctx, 'eclipse-center.png', 1299, 874, 1218, 816);
    draw(ctx, 'spectrum.svg', 1912, 1274, 1936, 1294);
    ctx.globalCompositeOperation = 'source-over';
    draw(ctx, 'circles.svg', 656, -717, 2527, 3994);
    draw(ctx, 'crosshair.svg', -.27, 0, 3840.55, 2563.42);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = 'color-dodge';
    const origin = landing.getBoundingClientRect();
    const localBox = selector => {
      const r = landing.querySelector(selector).getBoundingClientRect();
      return { x: r.x - origin.x, y: r.y - origin.y, width: r.width, height: r.height };
    };
    const title = localBox('.wordmark');
    draw(ctx, 'wordmark.svg', title.x - 50 * typeScale, title.y - 50 * typeScale, 846 * typeScale, 201 * typeScale);
    const enter = localBox('.enter');
    draw(ctx, 'enter.svg', enter.x, enter.y + (enter.height - 101 * typeScale) / 2, 541 * typeScale, 101 * typeScale);
    const footer = landing.querySelector('.license');
    const style = getComputedStyle(footer);
    ctx.fillStyle = '#fff';
    ctx.font = `${style.fontSize} "Sarasa Gothic SC", sans-serif`;
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing;
    for (const selector of ['.license-prefix', '.license a']) {
      const element = landing.querySelector(selector);
      const box = localBox(selector);
      const metrics = ctx.measureText(element.textContent);
      const ascent = metrics.fontBoundingBoxAscent || parseFloat(style.fontSize) * .88;
      const descent = metrics.fontBoundingBoxDescent || parseFloat(style.fontSize) * .2;
      const alignment = getComputedStyle(element).textAlign;
      ctx.textAlign = alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';
      const x = ctx.textAlign === 'center' ? box.x + box.width / 2 : ctx.textAlign === 'right' ? box.x + box.width : box.x;
      ctx.fillText(element.textContent, x, box.y + (box.height - ascent - descent) / 2 + ascent);
    }
    ctx.globalCompositeOperation = 'source-over';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    // Explicit high-quality area downsampling avoids compositor aliasing
    // of subpixel grain at non-integer desktop scale factors.
    const displayRatio = Math.min(window.devicePixelRatio || 1, 2);
    display.width = Math.round(width * displayRatio);
    display.height = Math.round(height * displayRatio);
    output.imageSmoothingEnabled = true;
    output.imageSmoothingQuality = 'high';
    output.drawImage(canvas, 0, 0, display.width, display.height);
    landing.classList.add('rendered');
    // Expose useful, non-sensitive render evidence for local verification.
    display.dataset.layers = 'five-eclipse-group@50%,central-repeat@100%,spectrum,circles,crosshair,wordmark,entry,license';
    display.dataset.composite = 'color-dodge';
    display.dataset.resolution = `${canvas.width}x${canvas.height}`;
  }

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; layout(); });
  };
  layout();
  new ResizeObserver(schedule).observe(landing);
  Promise.all(assetNames.map(name => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { images[name] = image; resolve(); };
    image.onerror = () => reject(new Error(`Unable to load ${name}`));
    image.src = `assets/${name}`;
  }))).then(() => document.fonts.ready).then(() => { ready = true; layout(); })
    .catch(error => console.warn('Using accessible HTML/CSS fallback:', error.message));
})();
