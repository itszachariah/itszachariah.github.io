# Zachariah

A static, responsive personal landing page based on the owner's Figma design:
[Frame 2](https://www.figma.com/design/CfsioegxyeHbV7QICvNBCn/?node-id=3-64).

Open `index.html` through a static web server. For example:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

No build process, package installation, backend, analytics or runtime asset service is required. GitHub Pages serves this repository directly. `home.html` is the owner-approved temporary destination for the entry link; change its `href` in `index.html` when the next page is ready.

## Artwork and rendering

The five original eclipse images and five SVG exports live in `assets/`. The Figma file is unchanged. SVG dimensions, paths and filter padding are preserved. `layout.js` places the assets in the original 3840 × 2560 coordinate system:

1. Black backdrop with monochrome grain.
2. Five-image eclipse group, color-dodge at 50% group opacity.
3. Repeated central eclipse, color-dodge at 100% opacity.
4. Color-dodge spectrum, with its original exported blur.
5. Two translucent circles, crosshair lines and blurred central light.
6. Color-dodge wordmark, entry lettering and license text.

Canvas 2D's real `color-dodge` compositing performs these operations on individual source assets. It is **not** a full-page Figma screenshot. Binary grain is blended before downsampling to retain textured highlights; applying CSS color-dodge to already-downsampled grain would turn the highlights solid white. Grain is generated deterministically from seed 3975, matching the design's white/25%-alpha monochrome intent, rather than reproducing Figma's proprietary random noise pixel for pixel.

The canvas resolution is capped at 14 million pixels. It redraws only on initial asset/font loading and layout changes. There are no animation loops. HTML supplies the heading and keyboard-operable links, including visible focus outlines. A layered HTML/CSS version remains available if JavaScript or Canvas cannot run; its highlight texture is less exact.

Wide viewports crop the scene around its center. Portrait viewports reposition peripheral eclipses, place the wordmark above the scene and keep the entry below it. The crosshair, central eclipse and beam share one coordinate transform. The footer wraps on narrow screens.

## Typography

The original Cinzel wordmark and Noto Serif SC entry lettering are preserved as Figma-exported outlines. The footer and temporary destination use self-hosted Sarasa Gothic SC Regular, sourced from the owner's specified [ZeoSeven distribution](https://fonts.zeoseven.com/items/161/). Only font chunks covering this page's text are included (about 530 KB). If you add copy, supply font coverage for the additional characters.

Font notices and OFL copies are under `assets/fonts/`; see `THIRD_PARTY.md`.

## Known visual limits

Figma and browsers use different rasterizers, so noise samples, antialiasing and tiny blurred edges can differ. Portrait composition is intentionally adapted. Verification covers the connected Chromium browser; Safari and Firefox require separate device/browser checks. No Figma source objects were edited.
