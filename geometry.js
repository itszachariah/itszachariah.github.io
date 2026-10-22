/* Page geometry: image proportions are independent of page diagonals. */
(function (root) {
  function geometry(width, height) {
    const portrait = width / height <= .8;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width * .1, height / 16);
    const stepY = portrait
      ? Math.min(height * .15, (height / 2 - Math.max(76, height * .09) - 44 - radius - 20) / 2)
      : height * .2;
    const sources = [
      { name: 'upper', asset: 'eclipse-upper.png', cx: 334.55, cy: 216.41, radius: 74.19, step: -2 },
      { name: 'left', asset: 'eclipse-left.png', cx: 316, cy: 207, radius: 82, step: -1 },
      { name: 'center', asset: 'eclipse-center.png', cx: 313.5, cy: 206.5, radius: 81, step: 0 },
      { name: 'right', asset: 'eclipse-right.png', cx: 299, cy: 203, radius: 82, step: 1 },
      { name: 'lower', asset: 'eclipse-lower.png', cx: 275.31, cy: 194.46, radius: 79.88, step: 2 }
    ];
    const moons = sources.map(source => {
      const x = center.x + source.step * width / 8;
      const y = center.y + source.step * stepY;
      const scale = radius / source.radius;
      return { ...source, x, y, scale, left: x - source.cx * scale,
        top: y - source.cy * scale, width: 615 * scale, height: 412 * scale };
    });
    return {
      width, height, portrait, center, radius, moons,
      // The original fan's far-right ray ends at native (1928,1286),
      // from its apex (8,8). Map that ray to the actual bottom-right corner.
      beam: { x: center.x - 8 * width / 3840, y: center.y - 8 * height / 2556,
        width: 1936 * width / 3840, height: 1294 * height / 2556 },
      diagonals: [[0, 0, center.x, center.y], [0, height, width, 0]],
      circles: { x: center.x - 1263.5 * height / 2560, y: -717 * height / 2560,
        width: 2527 * height / 2560, height: 3994 * height / 2560 }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = geometry;
  else root.eclipseGeometry = geometry;
})(typeof window !== 'undefined' ? window : this);
