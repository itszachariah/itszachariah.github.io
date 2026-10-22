# Zachariah

A static, responsive personal landing page based on the owner's Figma design:
[Frame 2](https://www.figma.com/design/CfsioegxyeHbV7QICvNBCn/?node-id=3-64).

Open `index.html` through a static web server. For example:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

No build process, package installation, backend, analytics or runtime asset service is required. GitHub Pages serves this repository directly. `home.html` is the owner-approved temporary destination for the entry link; change its `href` in `index.html` when the next page is ready.

## Artwork and rendering

The original eclipse images and SVG exports live in `assets/`. The Figma file is unchanged, and source image proportions and SVG paths remain intact. `geometry.js` computes each layout from the current viewport, then `layout.js` composites the layers:

1. Black backdrop with monochrome grain.
2. Five-image eclipse group, color-dodge at 50% group opacity.
3. Repeated central eclipse, color-dodge at 100% opacity.
4. Color-dodge spectrum, with its original exported blur.
5. Two translucent circles, viewport-corner diagonals and blurred central light.
6. Wordmark, entry lettering and license text, color-dodged against a uniform isolated backdrop before being composited over the scene.

Canvas 2D uses real `color-dodge` composition on the separate source images. Balanced subpixel grain participates before composition; exact area integration then reduces it without blurring image edges. A subtle monochrome finish is limited to ±6/255. Typography has its own uniform backdrop, preventing a circle or rainbow underneath a sentence from changing part of its brightness.

`geometry.js` gives the five physical moon centers one common straight line, correcting the offset between each source image's canvas center and the actual lunar disc. Image sizes fit inside the viewport. Portrait spacing also leaves room for the entry link. Both crosshair diagonals connect the actual viewport corners and intersect at its center; the original spectrum's outer ray maps to the actual bottom-right corner, with independent horizontal/vertical scaling of the fan. Circular photos are never stretched.

The composition uses the window's current width and height, including ordinary non-fullscreen windows. It does not cover-scale or crop a fixed artboard. Large decorative circles retain their circular shape and their original vertical relationship. A resize triggers a single redraw; there is no animation loop. Working canvas buffers are capped at 14 million pixels. HTML retains the heading, focus outlines and keyboard-operable links; a layered CSS fallback remains available.

## Typography

The original Cinzel wordmark and Noto Serif SC entry lettering are preserved as Figma-exported outlines. The footer and temporary destination use self-hosted Sarasa Gothic SC Regular, sourced from the owner's specified [ZeoSeven distribution](https://fonts.zeoseven.com/items/161/). Only font chunks covering this page's text are included (about 530 KB). If you add copy, supply font coverage for the additional characters.

Font notices and OFL copies are under `assets/fonts/`; see `THIRD_PARTY.md`.

## Known visual limits

Figma and browsers use different rasterizers, so noise samples, antialiasing and tiny blurred edges can differ. Portrait composition is intentionally adapted. Verification covers the connected Chromium browser; Safari and Firefox require separate device/browser checks. No Figma source objects were edited.
